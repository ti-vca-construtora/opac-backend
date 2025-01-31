import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { EnvConfigModule } from '../env-config/env-config.module';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
  imports: [EnvConfigModule],
})
export class PrismaModule {}
