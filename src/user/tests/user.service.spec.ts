import { Test, TestingModule } from '@nestjs/testing'
import { UserService } from '../user.service'
import { PrismaService } from "../../prisma/prisma.service"
import { NotFoundException } from "@nestjs/common"

describe('UserService', () => {
	let service: UserService
	let prisma: PrismaService

	beforeEach(async () => {

		const prismaMock = {
			user: {
				findFirst: jest.fn()
			}
		}

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserService,
				{ provide: PrismaService, useValue: prismaMock }
			]
		}).compile()

		service = module.get<UserService>(UserService)
		prisma = module.get<PrismaService>(PrismaService)
	})

	it("Deve retornar um usuario se encontrar", async () => {
		const mockUser = { id: 1, name: "teste", country: "brazil", email: "teste@email.com" };
		(prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser)

		const result = await service.getUser({ id: 1 })

		expect(result).toEqual(mockUser)
		expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { id: 1 } });
	})

	it('deve lançar NotFoundException se produto não encontrado', async () => {
		(prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

		await expect(service.getUser({ id: 1 })).rejects.toBeInstanceOf(NotFoundException)
	})
})
