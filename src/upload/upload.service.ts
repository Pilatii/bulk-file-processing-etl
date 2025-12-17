import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { FileValidator } from "../common/validators/file-validator.service";
import { JobService } from "../job/job.service";
import { v4 as uuidv4 } from "uuid";
import { JobEntity } from "@prisma/client";

@Injectable()
export class UploadService {
	constructor(private JobService: JobService, private csvFileValidator: FileValidator) { }

	async saveUploadedFile(file: Express.Multer.File): Promise<string> {

		

		this.csvFileValidator.validateCsv(file)

		const uploadDir = path.join(process.cwd(), "uploads")
		const filePath = path.join(uploadDir, `${Date.now()}-${uuidv4()}`)

		if (!fs.existsSync(uploadDir)) {
			await fs.promises.mkdir(uploadDir, { recursive: true })
		}

		await fs.promises.writeFile(filePath, file.buffer)

		return filePath
	}

	async handleFileUpload(file: Express.Multer.File, jobEntity: JobEntity) {
		if (!file) throw new BadRequestException("Nenhum arquivo enviado")
		
		const filePath = await this.saveUploadedFile(file)

		const jobId = await this.JobService.createJobAndEnqueueFileProcessing(filePath, jobEntity)

		return { message: 'Arquivo enviado para processamento em background.' }
	}
}


