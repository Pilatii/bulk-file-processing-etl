import { Injectable, BadRequestException } from '@nestjs/common'
import { parse } from "csv-parse"
import * as fs from 'fs'
import csv from 'csv-parser';

@Injectable()
export class FileValidator {
	async validateCsv(file: Express.Multer.File): Promise<void> {

		// Validação de mimetype
		if (file.mimetype !== 'text/csv') throw new BadRequestException('Arquivo invalido')

		// Validação de estensão de arquivo
		if (!file.originalname.toLowerCase().endsWith('.csv')) throw new BadRequestException('Arquivo invalido')

		// Valida se o arquivo não esta vazio
		const stream = fs.createReadStream(file.path).pipe(csv())
		let hasData = false

		for await (const _ of stream) {
			hasData = true
			break
		}

		if (!hasData) {
			throw new BadRequestException("Arquivo vazio")
		}

		// Valida se o arquivo esta formatado com um CSV
		try {
			const parser = fs
				.createReadStream(file.path)
				.pipe(parse({ to_line: 5, relax_column_count: false }));

			for await (const _ of parser) {
			}

		} catch {
			throw new BadRequestException('CSV mal formatado');
		}
	}
}
