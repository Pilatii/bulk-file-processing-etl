import { Injectable } from "@nestjs/common";
import { CsvImportStrategy } from "../../csv-import.strategy";
import { CreateUserDto } from "./create-user.dto";
import { PrismaService } from "../../../../prisma/prisma.service";
import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { JobEntity } from "@prisma/client";

@Injectable()
export class UserCsvImportStrategy implements CsvImportStrategy<CreateUserDto> {
	batchSize = 500
	readonly jobEntity = JobEntity.USER

	constructor(private readonly prisma: PrismaService) { }

	async validate(row: unknown): Promise<ValidationError[]> {
		const dto = plainToInstance(CreateUserDto, row)
		const errors = await validate(dto, {
			whitelist: true,
			forbidNonWhitelisted: true
		})

		return errors
	}

	async persist(data: CreateUserDto[]) {
		await this.prisma.user.createMany({
			data,
			skipDuplicates: true,
		})
	}
}
