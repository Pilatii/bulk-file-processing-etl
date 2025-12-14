import { Injectable } from "@nestjs/common"
import { ProductCsvImportStrategy } from "./strategies/product/product-csv.strategy"
import { UserCsvImportStrategy } from "./strategies/user/user-csv.strategy"
import { CsvJobType } from "./types"
import { CsvImportStrategy } from "./csv-import.strategy"

@Injectable()
export class CsvImportStrategyResolver {
	constructor(
		private readonly userStrategy: UserCsvImportStrategy,
		private readonly productStrategy: ProductCsvImportStrategy,
	) { }

	resolve(jobType: CsvJobType): CsvImportStrategy<unknown> {
		switch (jobType) {
			case CsvJobType.USER:
				return this.userStrategy
			case CsvJobType.PRODUCT:
				return this.productStrategy
			default:
				throw new Error(`CsvJobType ${jobType} não suportado`)
		}
	}
}
