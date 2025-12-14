import { ValidationError } from "class-validator";
import { CsvJobType } from "./types";

export interface CsvImportStrategy<T> {
	readonly jobType: CsvJobType
	batchSize: number;
	validate(row: unknown): Promise<ValidationError[]>;
	persist(data: T[]): Promise<void>;
}
