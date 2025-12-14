export enum CsvJobType {
	USER = "USER",
	PRODUCT = "PRODUCT"
}

export interface CsvJobPayload {
	filePath: string
	jobId: number
	jobType: CsvJobType
}
