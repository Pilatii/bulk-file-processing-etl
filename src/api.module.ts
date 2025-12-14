import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UploadModule } from "./upload/upload.module";
import { JobModule } from "./job/job.module";
import { QueueProducerModule } from "./queue/queue-producer.module";
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		UploadModule,
		JobModule,
		QueueProducerModule,
		UserModule,
		ProductModule
	]
})
export class ApiModule { }