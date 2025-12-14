import { InjectQueue } from "@nestjs/bull";
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from "@prisma/client";
import type { Queue } from "bull";
import { PrismaService } from "../prisma/prisma.service";
import { CsvJobType } from "../queue/csv/types";

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

	async createJob(jobType: CsvJobType) {
		return this.prisma.job.create({
			data: {
				status: "PENDING",
				entity: jobType
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

	async createJobAndEnqueueFileProcessing(filePath: string, jobType: CsvJobType) {
		const job = await this.createJob(jobType)

		await this.csvQueue.add(
			{ filePath, jobId: job.id, jobType: jobType },
			{ attempts: 3 }
		)

		return job.id
	}
}
