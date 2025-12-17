import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { JobModule } from "../job/job.module";
import { FileValidator } from "../common/validators/file-validator.service";

@Module({
	imports: [JobModule],
	controllers: [UploadController],
	providers: [UploadService, FileValidator],
	exports: [UploadService]
})
export class UploadModule { }
