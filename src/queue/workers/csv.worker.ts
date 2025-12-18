import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import * as fs from 'fs';
import csv from 'csv-parser';
import { JobService } from "../../job/job.service";
import { normalizeCsvKeys } from "../../common/utils/string.utils";
import { countFileLines } from "../../common/utils/count-file-lines";
import { CsvImportStrategyResolver } from "../csv/csv-import-strategy.resolver";
import { CsvImportStrategy } from "../csv/csv-import.strategy";
import { JobContext } from "./type";


@Processor("csvQueue")
export class CsvWorker {
	constructor(private jobService: JobService, private csvImportStrategyResolver: CsvImportStrategyResolver) { }

	@Process({ concurrency: 1 })
	async handle(job: Job) {
		const { filePath, jobId, jobEntity } = job.data

		const jobContext: JobContext = {
			filePath,
			jobId,
			success: false,
			totalRows: 0,
			errorFilePath: null
		}

		console.log(`[WORKER] Iniciando job com: ${filePath}`)

		try {
			const strategy = this.csvImportStrategyResolver.resolve(jobEntity)

			if (!fs.existsSync(filePath)) {
				await this.jobService.updateJob(jobId, { status: "FAILED", errorMesage: "Arquivo não encontrado" })
				return
			}

			jobContext.totalRows = await countFileLines(filePath)

			const validation = await this.runValidationPhase(jobContext, strategy)

			if (validation.hasFatalErrors) {
				await this.jobService.updateJob(jobId, {
					status: 'FAILED',
					errorMesage: `Mais de 50 linhas inválidas`,
					errorFilePath: jobContext.errorFilePath
				})

				jobContext.success = true
				return
			}

			await this.jobService.updateJob(jobId, { status: "PROCESSING" })

			await this.runProcessingPhase(jobContext, strategy)

			await this.jobService.updateJob(jobId, { status: "COMPLETED", errorFilePath: jobContext.errorFilePath, progress: 100 })
			jobContext.success = true

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

			if ((isLastAttempt || jobContext.success) && fs.existsSync(filePath)) {
				await fs.promises.unlink(filePath)
			}
		}
	}

	private async runValidationPhase(jobContext: JobContext, strategy: CsvImportStrategy<unknown>): Promise<{ hasFatalErrors: boolean }> {
		const MAX_ERRORS = 50
		let errorStream: fs.WriteStream | null = null

		let currentRow = 0
		let errorCount = 0

		await this.jobService.updateJob(jobContext.jobId, { status: "VALIDATING", totalRows: jobContext.totalRows })

		const validationStream = fs.createReadStream(jobContext.filePath).pipe(csv())

		for await (const rawRow of validationStream) {
			currentRow++

			const row = normalizeCsvKeys(rawRow)
			const errors = await strategy.validate(row)

			if (errors?.length > 0) {
				errorCount++

				if (!errorStream) {
					jobContext.errorFilePath = `uploads/errors/errors-${jobContext.jobId}.csv`
					errorStream = fs.createWriteStream(jobContext.errorFilePath)
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

		errorStream?.end()

		return { hasFatalErrors: errorCount >= MAX_ERRORS }
	}

	private async runProcessingPhase(jobContext: JobContext, strategy: CsvImportStrategy<unknown>) {
		const buffer: any[] = []
		let currentRow = 0

		const stream = fs.createReadStream(jobContext.filePath).pipe(csv())
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
				const progress = Math.floor((currentRow / jobContext.totalRows) * 100)
				await this.jobService.updateJob(jobContext.jobId, { progress: progress })
			}
		}

		if (buffer.length > 0) {
			await strategy.persist(buffer)
		}
	}
}