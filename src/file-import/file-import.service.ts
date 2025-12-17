import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { JobEntity } from "@prisma/client"
import { FileValidator } from "../common/validators/file-validator.service"
import { JobService } from "../job/job.service"
import * as fs from 'fs'

@Injectable()
export class FileImportService {
	constructor(private JobService: JobService, private FileValidator: FileValidator) { }

	async handleFileImport(file: Express.Multer.File, entity: JobEntity) {
		try {
			if (!file) throw new BadRequestException("Nenhum arquivo enviado")

			await this.FileValidator.validateCsv(file)

			await this.JobService.createJobAndEnqueueFileProcessing(file.path, entity)

			return { message: "Arquivo enviado para processamento em background." }

		} catch (error) {
			if (fs.existsSync(file.path)) {
				await fs.promises.unlink(file.path)
			}

			throw error
		}
	}

}
