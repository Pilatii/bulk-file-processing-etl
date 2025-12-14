import { Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ProductService } from './product.service';
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadService } from "../upload/upload.service";
import { CsvJobType } from "../queue/csv/types";

@Controller('products')
export class ProductController {
	constructor(private readonly productService: ProductService, private uploadService: UploadService) { }

	@Get(":id")
	getProduct(@Param("id") id: string) {
		return this.productService.getProduct(Number(id))
	}

	@Post("import")
	@UseInterceptors(FileInterceptor("file"))
	importUsersFromCsv(@UploadedFile() file: Express.Multer.File) {
		return this.uploadService.handleFileUpload(file, CsvJobType.PRODUCT)
	}
}
