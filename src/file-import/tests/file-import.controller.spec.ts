import { Test, TestingModule } from '@nestjs/testing';
import { FileImportController } from '../file-import.controller';
import { FileImportService } from '../file-import.service';

describe('FileImportController', () => {
  let controller: FileImportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileImportController],
      providers: [FileImportService],
    }).compile();

    controller = module.get<FileImportController>(FileImportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
