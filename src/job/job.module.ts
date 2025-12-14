import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BullModule } from "@nestjs/bull";

@Module({
  imports: [BullModule.registerQueue({ name: 'csvQueue' }), PrismaModule],
  controllers: [JobController],
  providers: [JobService],
  exports: [JobService],
})
export class JobModule {}
