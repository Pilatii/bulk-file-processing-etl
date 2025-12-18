import { Test, TestingModule } from '@nestjs/testing';
import { CsvWorker } from "./csv.worker";
import { JobService } from "../../job/job.service";
import mock from "mock-fs";


jest.mock("../../common/utils/count-file-lines", () => {
	return {
		countFileLines: jest.fn()
	}
})

import { countFileLines } from "../../common/utils/count-file-lines";
import { CsvImportStrategyResolver } from "../csv/csv-import-strategy.resolver";

describe('CsvWorker', () => {
	let worker: CsvWorker
	let jobService: JobService
	let csvImportStrategyResolver: CsvImportStrategyResolver

	const mockJob = {
		data: {
			filePath: '/uploads/test.csv',
			jobId: '123',
			jobEntity: "USER"
		},
		attemptsMade: 0,
		opts: { attempts: 3 }
	} as any;

	const mockStrategy = {
		jobEntity: 'USER',
		batchSize: 3,
		validate: jest.fn().mockResolvedValue([]),
		persist: jest.fn().mockResolvedValue(undefined)
	}

	beforeEach(async () => {

		const jobServiceMock = {
			updateJob: jest.fn(),

		}

		const resolverMock = {
			resolve: jest.fn().mockReturnValue(mockStrategy)
		}

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CsvWorker,
				{ provide: JobService, useValue: jobServiceMock },
				{ provide: CsvImportStrategyResolver, useValue: resolverMock }
			],
		}).compile()

		jobService = module.get(JobService)
		csvImportStrategyResolver = module.get(CsvImportStrategyResolver)
		worker = module.get(CsvWorker)
	})

	afterEach(() => {
		mock.restore()
		jest.clearAllMocks()
		jest.resetAllMocks()
	})

	it("Deve marcar linhas inválidas", async () => {
		mock({
			"/uploads": {
				"test.csv": "name,Country,email\nJohn,Botswana,testtest.com\n"
			},
			"uploads/errors": {
				"errors-123.csv": ""
			}
		});


		(countFileLines as jest.Mock).mockResolvedValue(2);
		(mockStrategy.validate as jest.Mock).mockResolvedValue([{ property: "email" }])

		await worker.handle(mockJob)

		expect(jobService.updateJob).toHaveBeenCalledWith("123", expect.objectContaining({ status: "COMPLETED", errorFilePath: "uploads/errors/errors-123.csv" })
		)
	})

	it("Deve processar CSV válido e salvar batches", async () => {
		mock({
			"/uploads": {
				"test.csv": "name,Country,email\nJohn,Botswana,test@test.com\n"
			}
		});

		(countFileLines as jest.Mock).mockResolvedValue(1)

		await worker.handle(mockJob)

		expect(jobService.updateJob).toHaveBeenCalledWith("123", expect.objectContaining({ status: "PROCESSING" }))
		expect(jobService.updateJob).toHaveBeenCalledWith("123", expect.objectContaining({ status: "COMPLETED", progress: 100, errorFilePath: null }))
	})

	it("Deve marcar RETRYING quando ainda há tentativas", async () => {
		mock({
			"/uploads": {
				"test.csv": "name,Country,email\nJohn,Botswana,test@test.com\n"
			}
		});

		(mockStrategy.persist).mockRejectedValue(new Error("DB down"))

		await expect(worker.handle(mockJob)).rejects.toThrow("DB down")

		expect(jobService.updateJob).toHaveBeenCalledWith("123", expect.objectContaining({ status: "RETRYING" }))
		expect(jobService.updateJob).not.toHaveBeenCalledWith("123", expect.objectContaining({ status: "COMPLETED" }))
		expect(jobService.updateJob).not.toHaveBeenCalledWith("123", expect.objectContaining({ status: "FAILED" }))
	})

	it("Deve marcar FAILED na última tentativa", async () => {
		mock({
			"/uploads": {
				"test.csv": "name,Country,email\nJohn,Botswana,test@test.com\n"
			}
		});

		const job = {
			data: { filePath: "/uploads/test.csv", jobId: "123", JobEntity: "USER" },
			attemptsMade: 2,
			opts: { attempts: 3 }
		} as any

		(mockStrategy.persist).mockRejectedValue(new Error("DB down"))

		await expect(worker.handle(job)).rejects.toThrow("DB down")

		expect(jobService.updateJob).toHaveBeenCalledWith("123", expect.objectContaining({ status: "FAILED" }))
		expect(jobService.updateJob).not.toHaveBeenCalledWith("123", expect.objectContaining({ status: "RETRYING" }))
		expect(jobService.updateJob).not.toHaveBeenCalledWith("123", expect.objectContaining({ status: "COMPLETED" }))
	})
})