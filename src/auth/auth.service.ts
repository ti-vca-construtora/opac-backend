import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { OutputUserPresenter } from 'src/users/presenters/output-user.presenter';
import { JwtService } from '@nestjs/jwt';
import { UserOutputDto } from '../users/dtos/output-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserOutputDto | null> {
    const user = await this.usersService.findByEmail(email);

    // encrypt given password to match hash
    if (user.data && user.data.hash === password) {
      // remove hash property from user - ok
      // create user presenter - ok

      return new OutputUserPresenter(user.data);
    }

    return null;
  }

  login(user: { email: string; id: string }) {
    const payload = { email: user.email, sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
