import { Injectable } from "@nestjs/common"
import { ProductCsvImportStrategy } from "./strategies/product/product-csv.strategy"
import { UserCsvImportStrategy } from "./strategies/user/user-csv.strategy"
import { JobEntity } from "@prisma/client";
import { CsvImportStrategy } from "./csv-import.strategy"

@Injectable()
export class CsvImportStrategyResolver {
	constructor(
		private readonly userStrategy: UserCsvImportStrategy,
		private readonly productStrategy: ProductCsvImportStrategy,
	) { }

	resolve(jobEntity: JobEntity): CsvImportStrategy<unknown> {
		switch (jobEntity) {
			case JobEntity.USER:
				return this.userStrategy
			case JobEntity.PRODUCT:
				return this.productStrategy
			default:
				throw new Error(`JobEntity ${jobEntity} não suportado`)
		}
	}
}
