import { Test, TestingModule } from '@nestjs/testing'
import { ProductController } from '../product.controller'
import { ProductService } from '../product.service'
import { UploadService } from "src/upload/upload.service"
import { PrismaService } from "src/prisma/prisma.service"

describe('ProductController', () => {
	let controller: ProductController

	beforeEach(async () => {

		const uploadServiceMock = {
			handleFileUpload: jest.fn()
		}

		const prismaMock = {
			product: {
				findUnique: jest.fn()
			}
		}

		const module: TestingModule = await Test.createTestingModule({
			controllers: [ProductController],
			providers: [
				ProductService,
				{ provide: UploadService, useValue: uploadServiceMock},
				{ provide: PrismaService, useValue: prismaMock}
			]
		}).compile()

		controller = module.get<ProductController>(ProductController)
	});

	it('should be defined', () => {
		expect(controller).toBeDefined()
	})
})
