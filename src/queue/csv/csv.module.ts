import { Module } from "@nestjs/common";
import { CsvImportStrategyResolver } from "./csv-import-strategy.resolver";
import { UserCsvImportStrategy } from "./strategies/user/user-csv.strategy";
import { ProductCsvImportStrategy } from "./strategies/product/product-csv.strategy";

@Module({
	providers: [
		CsvImportStrategyResolver,
		UserCsvImportStrategy,
		ProductCsvImportStrategy
	],
	exports: [
		CsvImportStrategyResolver
	]
})
export class CsvModule { }
