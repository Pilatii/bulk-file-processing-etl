import { Module } from '@nestjs/common';
import { QueueProducerModule } from './queue-producer.module';
import { CsvWorker } from './workers/csv.worker';
import { JobModule } from "../job/job.module";

@Module({
  imports: [QueueProducerModule, JobModule],
  providers: [CsvWorker],
})
export class QueueConsumerModule {}