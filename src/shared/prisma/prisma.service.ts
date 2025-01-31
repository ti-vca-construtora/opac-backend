import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { EnvConfigService } from '../env-config/env-config.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private config: EnvConfigService) {
    super({
      datasources: {
        db: {
          url: config.getDatabaseUrl(),
        },
      },
    });
  }

  cleanDb() {
    return this.$transaction([this.user.deleteMany()]);
  }

  async onModuleInit() {
    await this.$connect();
  }
}
