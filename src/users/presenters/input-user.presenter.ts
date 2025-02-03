import { CreateUserDto } from '../dtos/create-user.dto';

export class InputUserPresenter {
  name: string | null;
  email: string;
  hash: string;

  constructor(input: CreateUserDto) {
    this.name = input.name || null;
    this.email = input.email;
    this.hash = input.password;
  }
}
