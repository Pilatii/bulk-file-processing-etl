import { Injectable, BadRequestException } from '@nestjs/common';
import { parse } from "csv-parse/sync";

@Injectable()
export class CsvValidator {
	validate(file: Express.Multer.File): void {
		if (file.mimetype !== 'text/csv') throw new BadRequestException('Arquivo invalido');

		if (!file.originalname.toLowerCase().endsWith('.csv')) throw new BadRequestException('Arquivo invalido');

		try {
			parse(file.buffer.toString("utf-8"), {
				columns: false,
				relaxColumnCount: false
			})
		} catch (e) {
			throw new BadRequestException("CSV mal formatado")
		}
	}
}
