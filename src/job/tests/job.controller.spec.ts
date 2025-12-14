import { Test, TestingModule } from '@nestjs/testing';
import { JobController } from '../job.controller';
import { JobService } from '../job.service';
import { getQueueToken } from '@nestjs/bull';
import { PrismaService } from "../../prisma/prisma.service";

describe('JobController', () => {
	let controller: JobController;
	let jobServiceMock: any
	let queueMock: any
	let prismaMock: any

	beforeEach(async () => {
		jobServiceMock = {
			getJob: jest.fn()
		}

		queueMock = {
			add: jest.fn()
		}

		prismaMock = {
			job: {
				findUnique: jest.fn(),
				create: jest.fn(),
				update: jest.fn(),
			}
		}

		const module: TestingModule = await Test.createTestingModule({
			controllers: [JobController],
			providers: [
				{ provide: JobService, useValue: jobServiceMock },
				{ provide: getQueueToken('csvQueue'), useValue: queueMock },
				{ provide: PrismaService, useValue: prismaMock }
			],
		}).compile();

		controller = module.get<JobController>(JobController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
