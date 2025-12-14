import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaModule } from "../prisma/prisma.module";
import { UploadModule } from "../upload/upload.module";

@Module({
	imports: [PrismaModule, UploadModule],
	controllers: [ProductController],
	providers: [ProductService],
})
export class ProductModule { }
