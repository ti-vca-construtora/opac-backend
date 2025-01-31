import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config';
import { EnvConfigService } from './env-config.service';
import { join } from 'node:path';

@Module({
  providers: [EnvConfigService],
  exports: [EnvConfigService],
})
export class EnvConfigModule {
  static forRoot(options: ConfigModuleOptions = {}): DynamicModule {
    const nodeEnv = process.env.NODE_ENV || 'development';
    const envFilePath = [join(process.cwd(), `.env.${nodeEnv}`)];

    return {
      module: EnvConfigModule,
      imports: [
        ConfigModule.forRoot({
          ...options,
          envFilePath,
          isGlobal: true,
        }),
      ],
    };
  }
}
