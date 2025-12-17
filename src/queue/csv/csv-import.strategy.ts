import { ValidationError } from "class-validator";
import { JobEntity } from "@prisma/client";

export interface CsvImportStrategy<T> {
	readonly jobEntity: JobEntity
	batchSize: number;
	validate(row: unknown): Promise<ValidationError[]>;
	persist(data: T[]): Promise<void>;
}
