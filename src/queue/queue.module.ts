import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { CsvWorker } from './workers/csv.worker';
import { JobModule } from "../job/job.module";

@Module({
	imports: [BullModule.forRoot({ redis: { host: 'redis', port: 6379 } }), BullModule.registerQueue({ name: 'csvQueue' }), JobModule],
	providers: [CsvWorker]
})
export class QueueModule { }
