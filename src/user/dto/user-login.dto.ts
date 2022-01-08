import { IsNotEmpty } from "class-validator"

export class UserLoginDTO {
  @IsNotEmpty()
  readonly email: string

  @IsNotEmpty()
  readonly password: string
}
