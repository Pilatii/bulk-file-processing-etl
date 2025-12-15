import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ProductService {
	constructor(private prisma: PrismaService) {}

	async getProduct(id: number) {
		const product = await this.prisma.product.findUnique({
			where: { id }
		})
		console.log(product)

		if (!product) throw new NotFoundException("Produto não encontrado")

		return product
	}
}
