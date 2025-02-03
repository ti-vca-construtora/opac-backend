import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserEntity } from 'src/users/entities/user.entity';
import { OutputUserPresenter } from 'src/users/presenters/output-user.presenter';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserEntity | null> {
    const user = await this.usersService.findByEmail(email);

    // encrypt given password to match hash
    if (user.data && user.data.hash === password) {
      // remove hash property from user - ok
      // create user presenter - ok

      return new OutputUserPresenter(user.data);
    }

    return null;
  }
}
