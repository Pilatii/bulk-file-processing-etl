import { Test, TestingModule } from '@nestjs/testing'
import { UserController } from '../user.controller'
import { UserService } from '../user.service'
import { UploadService } from "src/upload/upload.service"
import { PrismaService } from "src/prisma/prisma.service"

describe('UserController', () => {
	let controller: UserController

	beforeEach(async () => {

		const uploadServiceMock = {
			handleFileUpload: jest.fn()
		}

		const prismaMock = {
			user: {
				findFirst: jest.fn()
			}
		}

		const module: TestingModule = await Test.createTestingModule({
			controllers: [UserController],
			providers: [
				UserService,
				{ provide: UploadService, useValue: uploadServiceMock},
				{ provide: PrismaService, useValue: prismaMock}
			]
		}).compile()

		controller = module.get<UserController>(UserController)
	})

	it('should be defined', () => {
		expect(controller).toBeDefined()
	})
})