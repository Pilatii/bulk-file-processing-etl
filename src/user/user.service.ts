import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) { }

	async getUser(filters: { id?: number, email?: string }) {
		if (!filters.id && !filters.email) throw new BadRequestException("Informe um Id ou email")

		const user = await this.prisma.user.findFirst({
			where: {
				id: filters.id ? filters.id : undefined,
				email: filters.email ? filters.email : undefined
			}
		})

		if (!user) throw new NotFoundException("Usuario não encontrado")

		return user
	}
}
