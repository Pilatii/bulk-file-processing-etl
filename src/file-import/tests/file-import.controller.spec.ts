import { Test, TestingModule } from '@nestjs/testing';
import { FileImportController } from '../file-import.controller';
import { FileImportService } from '../file-import.service';
import { JobService } from "../../job/job.service";
import { FileValidator } from "../../common/validators/file-validator.service";

describe('FileImportController', () => {
	let controller: FileImportController
	let jobService: JobService
	let fileValidator: FileValidator

	beforeEach(async () => {
		const jobServiceMock = {
			createJobAndEnqueueFileProcessing: jest.fn().mockResolvedValue({ id: 1 })
		}

		const FileValidatorMock = {
			validateCsv: jest.fn()
		}

		const module: TestingModule = await Test.createTestingModule({
			controllers: [FileImportController],
			providers: [
				FileImportService,
				{ provide: JobService, useValue: jobServiceMock },
				{ provide: FileValidator, useValue: FileValidatorMock }
			],
		}).compile();

		controller = module.get<FileImportController>(FileImportController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
