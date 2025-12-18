import { CsvImportStrategy } from "../csv/csv-import.strategy"

export type JobContext = {
	filePath: string
	jobId: number
	totalRows: number
	errorFilePath: string | null
	success: boolean
}
