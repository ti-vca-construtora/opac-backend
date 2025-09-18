import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { OutputUserPresenter } from 'src/users/presenters/output-user.presenter';
import { JwtService } from '@nestjs/jwt';
import { UserOutputDto } from '../users/dtos/output-user.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

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

    if (!user.data) return null;

    const isPasswordValid = await bcrypt.compare(password, user.data.hash);

    if (!isPasswordValid) return null;

    return new OutputUserPresenter(user.data);
  }

  login(user: { email: string; id: string; roles: Role[] }) {
    const payload = { email: user.email, sub: user.id, roles: user.roles };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
