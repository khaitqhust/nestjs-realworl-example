import { IsNotEmpty } from "class-validator"

export class UserCreateDTO {
  @IsNotEmpty()
  readonly username: string

  @IsNotEmpty()
  readonly email: string

  @IsNotEmpty()
  readonly password: string
}
