import { Controller, Get, Param } from '@nestjs/common';
import { JobService } from './job.service';

@Controller('jobs')
export class JobController {
	constructor(private readonly jobService: JobService) { }

	@Get(":id")
	getJob(@Param("id") id: string) {
		return this.jobService.getJob(Number(id))
	}

	@Get()
	getAll() {
		return this.jobService.getAll()
	}
}
