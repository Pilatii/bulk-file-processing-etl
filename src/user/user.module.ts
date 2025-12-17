import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  controllers: [UserController],
  imports: [PrismaModule],
  providers: [UserService],
})
export class UserModule {}
