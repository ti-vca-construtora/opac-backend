/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { Injectable } from '@nestjs/common';
import { EnvConfigService } from 'src/shared/env-config/env-config.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private envConfigService: EnvConfigService,
  ) {
    super({
      secretOrKey: envConfigService.getJwtSecret(),
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: {
    email: string;
    sub: string;
    iat: number;
    exp: number;
  }) {
    console.log('JWT Strategy.validate() chamado com payload: ', payload);

    const user = await this.usersService.findById(payload.sub);

    console.log('Usuário encontrado: ', user);

    return {
      id: user.data.id,
      name: user.data.name || null,
      email: user.data.email,
      createdAt: user.data.createdAt.toISOString(),
      roles: user.data.roles || [],
    };
  }
}
