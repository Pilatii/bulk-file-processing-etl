import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import * as fs from 'fs';
import csv from 'csv-parser';
import { PrismaService } from "../../prisma/prisma.service";
import { JobService } from "../../job/job.service";
import { plainToInstance } from "class-transformer";
import { CreateUserDto } from "../../dto/create-user.dto";
import { normalizeCsvKeys } from "../../common/utils/string.utils";
import { validate } from "class-validator";
import { countFileLines } from "../../common/utils/count-file-lines";


@Processor("csvQueue")
export class CsvWorker {
	constructor(private prisma: PrismaService, private jobService: JobService) { }
	private readonly BATCH_SIZE = 500

	@Process({ concurrency: 1 })
	async handle(job: Job) {
		const { filePath, jobId } = job.data

		console.log(`[WORKER] Iniciando job com: ${filePath}`, fs.existsSync(filePath))

		const buffer: any[] = []

		let totalRows = 0
		let currentRow = 0
		const invalidRows: any[] = []

		try {
			if (!fs.existsSync(filePath)) {
				await this.jobService.updateJob(jobId, { status: "FAILED", errorMesage: "Arquivo não encontrado" })
				return
			}

			totalRows = await countFileLines(filePath)

			if (totalRows <= 0) {
				await this.jobService.updateJob(jobId, { status: "FAILED", errorMesage: "Arquivo vazio" })
				return
			}

			await this.jobService.updateJob(jobId, { status: "PROCESSING", totalRows: totalRows })

			const stream = fs.createReadStream(filePath).pipe(csv())

			for await (const rawRow of stream) {
				currentRow++

				const row = normalizeCsvKeys(rawRow)
				const errors = await validate(plainToInstance(CreateUserDto, row))

				if (errors.length > 0) {
					invalidRows.push({
						row: currentRow,
						fields: errors.map(e => e.property)
					})
					continue
				}

				buffer.push(row)

				if (buffer.length > this.BATCH_SIZE) {
					await this.prisma.user.createMany({ data: buffer, skipDuplicates: true })
					buffer.length = 0
				}

				if (currentRow % 100 === 0) {
					const progress = Math.floor((currentRow / totalRows) * 100)
					await this.jobService.updateJob(jobId, { progress: progress })
				}
			}

			if (buffer.length > 0) {
				await this.prisma.user.createMany({ data: buffer, skipDuplicates: true })
			}

			await this.jobService.updateJob(jobId, { status: "COMPLETED", progress: 100, invalidRows: invalidRows })

		} catch (error: any) {
			const isLastAttempt = job.attemptsMade + 1 >= (job?.opts?.attempts ?? 1)

			if (isLastAttempt) { 
				await this.jobService.updateJob(jobId, { status: "FAILED", errorMesage: error.message || "Erro desconhecido" })
				
			} else {
				await this.jobService.updateJob(jobId, { status: "RETRYING", errorMesage: error.message || "Erro ineperado, iniciando nova tentativa..." })
				
			}

			throw error

		} finally {
			if (fs.existsSync(filePath)) {
				await fs.promises.unlink(filePath)
			}
		}
	}
}