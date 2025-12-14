import { BadRequestException } from '@nestjs/common'
import { CsvValidator } from './csv-validator.service'
import { Readable } from "stream"

describe('CsvValidator', () => {
	let validator: CsvValidator

	beforeEach(() => {
		validator = new CsvValidator()
	})

	const baseFileMock = {
		fieldname: "file",
		encoding: "7bit",
		size: 20,
		stream: Readable.from([]),
		destination: "",
		path: "",
		filename: ""
	}

	it("Deve lançar erro quando mimetype não for text/csv", () => {
		const file = {
			...baseFileMock,
			mimetype: "image/png",
			originalname: "arquivo.png",
			buffer: Buffer.from("id,name\n1,Gabriel")
		} as Express.Multer.File

		expect(() => validator.validate(file)).toThrow(BadRequestException)
	})

	it("Deve lançar erro quando extensão não for .csv", () => {
		const file = {
			...baseFileMock,
			mimetype: "text/csv",
			originalname: "arquivo.txt",
			buffer: Buffer.from("id,name\n1,Gabriel")
		} as Express.Multer.File

		expect(() => validator.validate(file)).toThrow(BadRequestException)
	})

	it("Deve lançar erro quando CSV tiver erros de parsing", () => {
		const file = {
			...baseFileMock,
			mimetype: "text/csv",
			originalname: "arquivo.csv",
			buffer: Buffer.from("id,name\n1,Gabriel,ExtraColumn")
		} as Express.Multer.File

		expect(() => validator.validate(file)).toThrow(BadRequestException)
	})

	it("Não deve lançar erro quando o CSV for válido", () => {
		const file = {
			...baseFileMock,
			mimetype: "text/csv",
			originalname: "arquivo.csv",
			buffer: Buffer.from("id,name\n1,Gabriel")
		} as Express.Multer.File

		expect(() => validator.validate(file)).not.toThrow();
	})
})
