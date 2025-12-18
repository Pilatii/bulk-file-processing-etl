import { Test, TestingModule } from '@nestjs/testing'
import { FileImportService } from '../file-import.service'
import { Readable } from "stream"
import { JobEntity } from "@prisma/client"
import { BadRequestException } from "@nestjs/common"
import { JobService } from "../../job/job.service"
import { FileValidator } from "../../common/validators/file-validator.service"

const fileMock = {
	originalname: "teste.csv",
	buffer: Buffer.from("name,country,email\nGabriel,Brasil,teste@email.com"),
	fieldname: "file",
	encoding: "7bit",
	mimetype: "text/csv",
	size: 20,
	stream: Readable.from([]),
	destination: "",
	path: "",
	filename: ""
}

const errorFileMock = {
	originalname: "teste.png",
	buffer: Buffer.from("name,country"),
	fieldname: "file",
	encoding: "7bit",
	mimetype: "image/png",
	size: 20,
	stream: Readable.from([]),
	destination: "",
	path: "",
	filename: ""
}

describe('FileImportService', () => {
	let service: FileImportService
	let jobService: JobService
	let fileValidator: FileValidator

	beforeEach(async () => {
		const jobServiceMock = {
			createJobAndEnqueueFileProcessing: jest.fn().mockResolvedValue({ id: 1 })
		}

		const fileValidatorMock = {
			validateCsv: jest.fn().mockResolvedValue(undefined)
		}

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				FileImportService,
				{ provide: JobService, useValue: jobServiceMock },
				{ provide: FileValidator, useValue: fileValidatorMock }
			]
		})
			.overrideProvider(FileValidator)
			.useValue(fileValidatorMock)
			.compile()

		service = module.get<FileImportService>(FileImportService)
		jobService = module.get<JobService>(JobService)
		fileValidator = module.get<FileValidator>(FileValidator)
	})

	it('Deve enviar o job para fila', async () => {

		const result = await service.handleFileImport(fileMock, JobEntity.USER)

		expect(jobService.createJobAndEnqueueFileProcessing).toHaveBeenCalled()

		expect(result).toEqual({ message: "Arquivo enviado para processamento em background." })
	})

	it("Deve lançar BadRequest quando nenhum arquivo é enviado", async () => {
		await expect(service.handleFileImport(undefined as any, JobEntity.USER)).rejects.toThrow(BadRequestException)
	})

	it("Deve lançar BadRequest quando arquivo não é CSV", async () => {
		(fileValidator.validateCsv as jest.Mock).mockRejectedValue(new BadRequestException("Arquivo inválido"))

		await expect(service.handleFileImport(errorFileMock, JobEntity.USER)).rejects.toThrow(BadRequestException)
	})

})
