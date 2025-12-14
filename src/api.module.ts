import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UploadModule } from "./upload/upload.module";
import { JobModule } from "./job/job.module";
import { QueueModule } from "./queue/queue.module";
import { QueueProducerModule } from "./queue/queue-producer.module";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		UploadModule,
		JobModule,
		QueueProducerModule
	]
})
export class ApiModule { }