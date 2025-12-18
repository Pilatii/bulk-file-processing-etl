import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JobModule } from "./job/job.module";
import { QueueProducerModule } from "./queue/queue-producer.module";
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { FileImportModule } from './file-import/file-import.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		FileImportModule,
		JobModule,
		QueueProducerModule,
		UserModule,
		ProductModule,
		FileImportModule
	]
})
export class ApiModule { }