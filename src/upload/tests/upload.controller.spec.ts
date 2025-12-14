import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from '../upload.controller';
import { UploadService } from '../upload.service';
import { JobService } from "../../job/job.service";

describe('UploadController', () => {
	let controller: UploadController;
	let uploadServiceMock: any
	let jobServiceMock: any

	beforeEach(async () => {
		uploadServiceMock = {
			handleFileUpload: jest.fn()
		}

		jobServiceMock = {
			createJobAndEnqueueFileProcessing: jest.fn()
		}

		const module: TestingModule = await Test.createTestingModule({
			controllers: [UploadController],
			providers: [
				{ provide: UploadService, useValue: uploadServiceMock},
				{ provide: JobService, useValue: jobServiceMock }
			]
		}).compile();

		controller = module.get<UploadController>(UploadController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
