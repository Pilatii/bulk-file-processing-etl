import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import * as fs from 'fs';
import csv from 'csv-parser';
import { JobService } from "../../job/job.service";
import { normalizeCsvKeys } from "../../common/utils/string.utils";
import { countFileLines } from "../../common/utils/count-file-lines";
import { CsvImportStrategyResolver } from "../csv/csv-import-strategy.resolver";


@Processor("csvQueue")
export class CsvWorker {
	constructor(private jobService: JobService, private csvImportStrategyResolver: CsvImportStrategyResolver) { }

	@Process({ concurrency: 1 })
	async handle(job: Job) {
		const { filePath, jobId, jobEntity } = job.data

		const buffer: any[] = []
		const MAX_ERRORS = 50

		let errorStream: fs.WriteStream | null = null
		let errorFilePath: string | null = null

		let success = false
		let errorCount = 0
		let totalRows = 0
		let currentRow = 0

		console.log(`[WORKER] Iniciando job com: ${filePath}`)

		try {
			const strategy = this.csvImportStrategyResolver.resolve(jobEntity)

			if (!fs.existsSync(filePath)) {
				await this.jobService.updateJob(jobId, { status: "FAILED", errorMesage: "Arquivo não encontrado" })
				return
			}

			totalRows = await countFileLines(filePath)

			await this.jobService.updateJob(jobId, { status: "VALIDATING", totalRows: totalRows })

			// Inicia validação do arquivo
			const validationStream = fs.createReadStream(filePath).pipe(csv())

			for await (const rawRow of validationStream) {
				currentRow++

				const row = normalizeCsvKeys(rawRow)
				const errors = await strategy.validate(row)

				if (errors?.length > 0) {
					errorCount++

					if (!errorStream) {
						errorFilePath = `uploads/errors/errors-${jobId}.csv`
						errorStream = fs.createWriteStream(errorFilePath)
						errorStream.write('Linha,Coluna\n')
					}

					errorStream.write(
						`${currentRow},"${errors.map(e => e.property).join(',')}"\n`
					)

					if (errorCount >= MAX_ERRORS) {
						break
					}
				}
			}

			if (errorStream) {
				errorStream.end()
			}

			if (errorCount >= MAX_ERRORS) {
				await this.jobService.updateJob(jobId, {
					status: 'FAILED',
					errorMesage: `Mais de ${MAX_ERRORS} linhas inválidas`,
					errorFilePath
				})

				success = true
				return
			}

			await this.jobService.updateJob(jobId, { status: "PROCESSING" })

			// Inicia persistencia na DB
			const stream = fs.createReadStream(filePath).pipe(csv())
			currentRow = 0

			for await (const rawRow of stream) {
				currentRow++

				const row = normalizeCsvKeys(rawRow)

				//Filtra linhas invalidas (Se chegou nesse ponto tem menos de 50 linhas invalidas)
				const errors = await strategy.validate(row)
				if (errors?.length > 0) {
					continue
				}

				buffer.push(row)

				if (buffer.length > strategy.batchSize) {
					await strategy.persist(buffer)
					buffer.length = 0
				}

				if (currentRow % 100 === 0) {
					const progress = Math.floor((currentRow / totalRows) * 100)
					await this.jobService.updateJob(jobId, { progress: progress })
				}
			}

			if (buffer.length > 0) {
				await strategy.persist(buffer)
			}

			await this.jobService.updateJob(jobId, { status: "COMPLETED", errorFilePath, progress: 100 })
			success = true

		} catch (error: any) {
			const isLastAttempt = job.attemptsMade + 1 >= (job?.opts?.attempts ?? 1)

			if (isLastAttempt) {
				await this.jobService.updateJob(jobId, { status: "FAILED", errorMesage: error.message || "Erro desconhecido" })

			} else {
				await this.jobService.updateJob(jobId, { status: "RETRYING", errorMesage: error.message || "Erro ineperado, iniciando nova tentativa..." })

			}

			throw error

		} finally {
			const isLastAttempt = job.attemptsMade + 1 >= (job?.opts?.attempts ?? 1)

			if ((isLastAttempt || success) && fs.existsSync(filePath)) {
				await fs.promises.unlink(filePath)
			}
		}
	}
}