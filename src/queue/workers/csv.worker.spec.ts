import { Test, TestingModule } from '@nestjs/testing';
import { CsvWorker } from "./csv.worker";
import { PrismaService } from "../../prisma/prisma.service";
import { JobService } from "../../job/job.service";
import mock from "mock-fs";

jest.mock("../../common/utils/count-file-lines", () => {
	return {
		countFileLines: jest.fn()
	}
})

import { countFileLines } from "../../common/utils/count-file-lines";

describe('CsvWorker', () => {
	let worker: CsvWorker;
	let prisma: PrismaService;
	let jobService: JobService;

	const mockJob = {
		data: {
			filePath: '/uploads/test.csv',
			jobId: '123',
		},
		attemptsMade: 0,
		opts: { attempts: 3 }
	} as any;

	beforeEach(async () => {

		const jobServiceMock = {
			updateJob: jest.fn(),

		}

		const prismaServiceMock = {
			user: {
				createMany: jest.fn()
			}
		}

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				{ provide: JobService, useValue: jobServiceMock },
				{ provide: PrismaService, useValue: prismaServiceMock }
			],
		}).compile()

		prisma = module.get(PrismaService)
		jobService = module.get(JobService)
		worker = new CsvWorker(prisma, jobService)
	})

	afterEach(() => {
		mock.restore()
	})

	it("Deve falhar caso o arquivo esteja vazio", async () => {
		mock({
			"/uploads": {
				"test.csv": ""
			}
		});

		(countFileLines as jest.Mock).mockResolvedValue(0)

		await worker.handle(mockJob)

		expect(jobService.updateJob).toHaveBeenCalledWith("123", expect.objectContaining({ status: "FAILED" }))
	})

	it("Deve marcar linhas inválidas", async () => {
		mock({
			"/uploads": {
				"test.csv": "name,Country,email\nJohn,Botswana,testtest.com\n"
			}
		});

		(countFileLines as jest.Mock).mockResolvedValue(2);

		await worker.handle(mockJob)

		expect(jobService.updateJob).toHaveBeenCalledWith(
			"123",
			expect.objectContaining({
				status: "COMPLETED",
				invalidRows: expect.arrayContaining([
					expect.objectContaining({ row: 1 })
				])
			})
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
		expect(jobService.updateJob).toHaveBeenCalledWith("123", expect.objectContaining({ status: "COMPLETED", progress: 100, invalidRows: [] }))
		expect(prisma.user.createMany).toHaveBeenCalledTimes(1)
	})

	it("Deve quebrar as chamadas de acordo com o batche size", async () => {
		(worker as any).BATCH_SIZE = 2;

		mock({
			"/uploads": {
				"test.csv": "name,Country,email\nJohn,Botswana,test@test.com\nFrank,Panama,gmurillo@perez.com\nLindsay,Estonia,rhuff@kennedy.info\nGwendolyn,Yemen,kaylee45@rice.org\n"
			}
		});

		await worker.handle(mockJob);

		expect(prisma.user.createMany).toHaveBeenCalledTimes(2)
		expect(jobService.updateJob).toHaveBeenCalledWith("123", expect.objectContaining({ status: "COMPLETED" }))
	})

	it("Deve marcar RETRYING quando ainda há tentativas", async () => {
		mock({
			"/uploads": {
				"test.csv": "name,Country,email\nJohn,Botswana,test@test.com\n"
			}
		});

		(prisma.user.createMany as jest.Mock).mockRejectedValue(new Error("DB down"))

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
			data: { filePath: "/uploads/test.csv", jobId: "123" },
			attemptsMade: 2,
			opts: { attempts: 3 }
		} as any

		(prisma.user.createMany as jest.Mock).mockRejectedValue(new Error("DB down"))

		await expect(worker.handle(job)).rejects.toThrow("DB down")

		expect(jobService.updateJob).toHaveBeenCalledWith("123", expect.objectContaining({ status: "FAILED" }))
		expect(jobService.updateJob).not.toHaveBeenCalledWith("123", expect.objectContaining({ status: "RETRYING" }))
		expect(jobService.updateJob).not.toHaveBeenCalledWith("123", expect.objectContaining({ status: "COMPLETED" }))
	})
})