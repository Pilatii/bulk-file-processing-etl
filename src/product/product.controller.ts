import { Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
	constructor(private readonly productService: ProductService) { }

	@Get(":id")
	getProduct(@Param("id") id: string) {
		return this.productService.getProduct(Number(id))
	}
}
