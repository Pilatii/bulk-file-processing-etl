import { IsEmail, IsInt, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string = ""

  @IsString()
  country: string = ""

  @IsEmail()
  email: string = ""
}