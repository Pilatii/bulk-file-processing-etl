import { Module } from '@nestjs/common';
import { QueueProducerModule } from './queue-producer.module';
import { CsvWorker } from './workers/csv.worker';
import { JobModule } from "../job/job.module";
import { CsvModule } from "./csv/csv.module";

@Module({
  imports: [QueueProducerModule, JobModule, CsvModule],
  providers: [CsvWorker],
})
export class QueueConsumerModule {}