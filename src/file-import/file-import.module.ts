import { Module } from '@nestjs/common';
import { FileImportService } from './file-import.service';
import { FileImportController } from './file-import.controller';
import { JobModule } from "../job/job.module";
import { FileValidator } from "../common/validators/file-validator.service";

@Module({
  controllers: [FileImportController],
  providers: [FileImportService, FileValidator],
  imports: [JobModule]
})
export class FileImportModule {}
