import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local/local.strategy';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt/jwt.strategy';
import { EnvConfigModule } from 'src/shared/env-config/env-config.module';
import { EnvConfigService } from 'src/shared/env-config/env-config.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [EnvConfigModule],
      useFactory: (envConfigService: EnvConfigService) => ({
        secret: envConfigService.getJwtSecret(),
        signOptions: { expiresIn: '10000s' },
      }),
      inject: [EnvConfigService],
    }),
    EnvConfigModule,
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, EnvConfigService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
