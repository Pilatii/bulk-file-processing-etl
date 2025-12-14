import { Controller, Get, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common'
import { UserService } from './user.service'
import { FileInterceptor } from "@nestjs/platform-express"
import { UploadService } from "../upload/upload.service"
import { CsvJobType } from "../queue/csv/types"

@Controller("users")
export class UserController {
	constructor(private readonly userService: UserService, private uploadService: UploadService) { }

	@Get()
	getUser(
		@Query('id') id?: string,
		@Query('email') email?: string
	) {
		return this.userService.getUser({
			id: id ? Number(id) : undefined,
			email
		})
	}

	@Post("import")
	@UseInterceptors(FileInterceptor("file"))
	importUsersFromCsv(@UploadedFile() file: Express.Multer.File) {
		return this.uploadService.handleFileUpload(file, CsvJobType.USER)
	}
}
