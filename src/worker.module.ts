import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { QueueModule } from "./queue/queue.module";
import { JobModule } from "./job/job.module";
import { QueueConsumerModule } from "./queue/queue-consumer.module";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		JobModule,
		QueueConsumerModule
	]
})
export class WorkerModule { }