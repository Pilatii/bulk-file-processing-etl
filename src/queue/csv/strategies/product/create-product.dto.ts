import { Decimal } from "@prisma/client/runtime/client";
import { IsDecimal, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string = ""

  @IsString()
  description: string = ""

  @IsDecimal()
  price: Decimal
}