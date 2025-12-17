import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileImportService } from './file-import.service';
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { JobEntity } from "@prisma/client";

@Controller('import')
export class FileImportController {
	constructor(private readonly fileImportService: FileImportService) { }

	@UseInterceptors(FileInterceptor("file", {
		storage: diskStorage({
			destination: "./uploads",
			filename: (req, file, cb) => {
				const uniqueName = Date.now() + "-" + crypto.randomUUID() + ".csv"
				cb(null, uniqueName)
			},
		}),
		limits: {
			fileSize: 1024 * 1024 * 1024, // 1GB
		}
	}))
	@Post()
	handle(@UploadedFile() file: Express.Multer.File, @Body("entity") entity: JobEntity) {
		return this.fileImportService.handleFileImport(file, entity)
	}
}

