import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './shared/prisma/prisma.module';
import { EnvConfigModule } from './shared/env-config/env-config.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [EnvConfigModule.forRoot(), PrismaModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
