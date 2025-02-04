import { Injectable } from '@nestjs/common';
import { EnvConfigInterface } from './env-config.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvConfigService implements EnvConfigInterface {
  constructor(private config: ConfigService) {}

  getPort(): number {
    return Number(this.config.get<string>('PORT'));
  }

  getDatabaseUrl(): string {
    return this.config.get<string>('DATABASE_URL') || '';
  }

  getNodeEnv(): string {
    return this.config.get<string>('NODE_ENV') || 'development';
  }

  getJwtSecret(): string {
    return this.config.get<string>('JWT_SECRET') || '';
  }
}
