import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserEntity } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserEntity | null> {
    const user = await this.usersService.findByEmail(email);

    // // encrypt given password to match hash
    // if (user && user.data.hash === password) {
    //   // remove hash property from user - ok
    //   // create user presenter
    //   return {
    //     email,
    //     name: user.data.name,
    //   };
    // }

    return null;
  }
}
