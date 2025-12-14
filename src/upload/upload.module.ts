import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { JobModule } from "../job/job.module";
import { CsvValidator } from "../common/validators/csv-validator.service";

@Module({
	imports: [JobModule],
	controllers: [UploadController],
	providers: [UploadService, CsvValidator],
})
export class UploadModule { }
