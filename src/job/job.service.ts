import { InjectQueue } from "@nestjs/bull";
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from "@prisma/client";
import type { Queue } from "bull";
import { PrismaService } from "../prisma/prisma.service";
import { JobEntity } from "@prisma/client";

@Injectable()
export class JobService {
	constructor(@InjectQueue('csvQueue') private readonly csvQueue: Queue, private prisma: PrismaService) { }

	async getJob(id: number) {
		const job = await this.prisma.job.findUnique({
			where: { id }
		})

		if (!job) throw new NotFoundException("Job não encontrado")

		return job
	}
	
	async getAll() {
		const jobs = await this.prisma.job.findMany()

		if(!jobs) throw new NotFoundException("Nenum job encontrado")

		return jobs
	}

	async createJob(jobEntity: JobEntity) {
		return this.prisma.job.create({
			data: {
				status: "PENDING",
				entity: jobEntity
			}
		})
	}

	async updateJob(id: number, data: Prisma.JobUpdateArgs["data"]) {
		try {
			return this.prisma.job.update({
				where: { id },
				data
			})
			
		} catch (error: any) {
			if (error.code === "P2025") {
				throw new NotFoundException("Job não encontrado");
			}

			throw error
		}
	}

	async createJobAndEnqueueFileProcessing(filePath: string, jobEntity: JobEntity) {
		const job = await this.createJob(jobEntity)

		await this.csvQueue.add(
			{ filePath, jobId: job.id, jobEntity: jobEntity },
			{ attempts: 3 }
		)

		await this.updateJob(job.id, { status: "QUEUED" })

		return job.id
	}
}
