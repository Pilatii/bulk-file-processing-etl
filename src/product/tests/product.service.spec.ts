import { Test, TestingModule } from '@nestjs/testing'
import { ProductService } from '../product.service'
import { PrismaService } from "src/prisma/prisma.service"
import { NotFoundException } from "@nestjs/common"

describe('ProductService', () => {
	let service: ProductService
	let prisma: PrismaService

	beforeEach(async () => {
		const prismaMock = {
			product: {
				findUnique: jest.fn()
			}
		}

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ProductService,
				{ provide: PrismaService, useValue: prismaMock }
			]
		}).compile()

		service = module.get<ProductService>(ProductService)
		prisma = module.get<PrismaService>(PrismaService)
	})

	afterEach(() => {
			jest.clearAllMocks()
			jest.resetAllMocks()
		})

	it('deve retornar um produto se encontrado', async () => {
		const mockProduct = { id: 1, name: 'Produto X', price: 10 };
		(prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);

		const result = await service.getProduct(1);
		expect(result).toEqual(mockProduct);
		expect(prisma.product.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
	})

	it('deve lançar NotFoundException se produto não encontrado', async () => {
		(prisma.product.findUnique as jest.Mock).mockResolvedValue(null);

		await expect(service.getProduct(1)).rejects.toBeInstanceOf(NotFoundException)
	})
})
