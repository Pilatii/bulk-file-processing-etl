import { Injectable } from "@nestjs/common";
import { CsvImportStrategy } from "../../csv-import.strategy";
import { PrismaService } from "../../../../prisma/prisma.service";
import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { CsvJobType } from "../../types";
import { CreateProductDto } from "./create-product.dto";

@Injectable()
export class ProductCsvImportStrategy implements CsvImportStrategy<CreateProductDto> {
	batchSize = 500
	readonly jobType = CsvJobType.PRODUCT

	constructor(private readonly prisma: PrismaService) { }

	async validate(row: unknown): Promise<ValidationError[]> {
		const dto = plainToInstance(CreateProductDto, row)
		const errors = await validate(dto)

		return errors
	}

	async persist(data: CreateProductDto[]) {
		await this.prisma.product.createMany({
			data,
			skipDuplicates: true,
		})
	}
}
