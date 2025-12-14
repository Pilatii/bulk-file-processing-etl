import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UploadModule } from "../upload/upload.module";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  controllers: [UserController],
  imports: [UploadModule, PrismaModule],
  providers: [UserService],
})
export class UserModule {}
