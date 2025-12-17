import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from '../upload.service';
import { JobService } from "../../job/job.service";
import * as fs from "fs";
import path from "path";
import { Readable } from "stream";
import { BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { CsvFileValidator } from "../../common/validators/file-validator.service";
import { JobEntity } from "@prisma/client";

describe('UploadService', () => {
	let service: UploadService;
	let jobServiceMock: any
	let csvValidatorMock: any

	beforeEach(async () => {
		jobServiceMock = {
			createJobAndEnqueueFileProcessing: jest.fn().mockResolvedValue({ id: 1 })
		}

		csvValidatorMock = {
			validate: jest.fn()
		}

		jest.spyOn(fs.promises, "writeFile").mockResolvedValue(undefined)

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UploadService,
				{ provide: JobService, useValue: jobServiceMock },
				{ provide: CsvFileValidator, useValue: csvValidatorMock }
			]
		}).compile();

		service = module.get<UploadService>(UploadService);
	});

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

	it("Deve salvar o arquvio no disco", async () => {
		const writeSpy = jest.spyOn(fs.promises, "writeFile")

		await service.handleFileUpload(fileMock, JobEntity.USER)
		expect(writeSpy).toHaveBeenCalledTimes(1)

		const [savedPath, buffer] = writeSpy.mock.calls[0]

		expect(savedPath).toContain(path.join("uploads"))
		expect(buffer).toBe(fileMock.buffer);

	})

	it('Deve enviar o job para fila', async () => {

		const result = await service.handleFileUpload(fileMock, JobEntity.USER)

		expect(jobServiceMock.createJobAndEnqueueFileProcessing).toHaveBeenCalled()

		expect(result).toEqual({
			message: "Arquivo enviado para processamento em background."
		})
	});

	it("Deve lançar BadRequest quando nenhum arquivo é enviado", async () => {
		await expect(service.saveUploadedFile(undefined as any)).rejects.toThrow(BadRequestException)
	})

	it("Deve lançar BadRequest quando arquivo não é CSV", async () => {
		csvValidatorMock.validate.mockImplementation(() => {throw new BadRequestException("Arquivo inválido")})

		await expect(service.saveUploadedFile(errorFileMock)).rejects.toThrow(BadRequestException)
	})

	it("Deve lançar InternalServerError se writeFile falhar", async () => {
		jest.spyOn(fs.promises, "writeFile").mockRejectedValue(new InternalServerErrorException("disk full"));

		await expect(service.saveUploadedFile(fileMock)).rejects.toThrow(InternalServerErrorException);
	})


});
