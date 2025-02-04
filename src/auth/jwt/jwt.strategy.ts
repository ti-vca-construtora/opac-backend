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
    const user = await this.usersService.findById(payload.sub);

    return user;
  }
}
