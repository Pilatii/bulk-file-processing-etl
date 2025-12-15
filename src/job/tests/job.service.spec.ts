import { Test, TestingModule } from '@nestjs/testing';
import { JobService } from '../job.service';
import { getQueueToken } from "@nestjs/bull";
import { PrismaService } from "../../prisma/prisma.service";
import { CsvJobType } from "../../queue/csv/types";

describe('JobService', () => {
	let service: JobService;
	let queueMock: any
	let prismaMock: any

	beforeEach(async () => {

		queueMock = {
			add: jest.fn().mockResolvedValue({})
		}

		prismaMock = {
			job: {
				findUnique: jest.fn().mockResolvedValue({ id: 1 }),
				create: jest.fn().mockResolvedValue({ id: 1, status: "PENDING" }),
				update: jest.fn(),
			}
		}

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				JobService,
				{ provide: getQueueToken('csvQueue'), useValue: queueMock },
				{ provide: PrismaService, useValue: prismaMock }
			],
		}).compile();

		service = module.get<JobService>(JobService);
	});

	it("Deve criar um novo job", async () => {
		const result = await service.createJob(CsvJobType.USER)

		expect(result).toEqual({ id: 1, status: "PENDING" })
		expect(prismaMock.job.create).toHaveBeenCalled()
	});

	it("Deve retornar um job pelo id", async () => {
		const result = await service.getJob(1)

		expect(result).toEqual({ id: 1 })
		expect(prismaMock.job.findUnique).toHaveBeenCalled()
	})

	it("Deve atualizar um job", async () => {
		prismaMock.job.update.mockResolvedValue({ id: 1, status: "COMPLETED" })

		const result = await service.updateJob(1, { status: "COMPLETED" })

		expect(result).toEqual({ id: 1, status: "COMPLETED" })
		expect(prismaMock.job.update).toHaveBeenCalled()
	})

	it("Deve dar FAILED em job e salvar mensagem de erro", async () => {
		prismaMock.job.update.mockResolvedValue({ id: 1, status: "FAILED", errorMesage: "Erro no arquivo" })

		const result = await service.updateJob(1, {status: "FAILED", errorMesage: "Erro no CSV"})

		expect(result.status).toBe('FAILED');
		expect(prismaMock.job.update).toHaveBeenCalled()
	})

	it("Deve criar um job e registra na fila", async () => {
		const result = await service.createJobAndEnqueueFileProcessing('/tmp/test.csv', CsvJobType.USER);

		expect(result).toBe(1)
		expect(prismaMock.job.create).toHaveBeenCalled()
		expect(queueMock.add).toHaveBeenCalled()
	})
});
