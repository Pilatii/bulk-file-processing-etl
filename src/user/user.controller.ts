import { Controller, Get, Query } from '@nestjs/common'
import { UserService } from './user.service'

@Controller("users")
export class UserController {
	constructor(private readonly userService: UserService) { }

	@Get()
	getUser(
		@Query('id') id?: string,
		@Query('email') email?: string
	) {
		return this.userService.getUser({
			id: id ? Number(id) : undefined,
			email
		})
	}
}
