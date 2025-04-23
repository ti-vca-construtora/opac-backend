import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './shared/prisma/prisma.module';
import { EnvConfigModule } from './shared/env-config/env-config.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PermissionsModule } from './permissions/permissions.module';
import { EmpreendimentosModule } from './empreendimentos/empreendimentos.module';
import { InccModule } from './incc/incc.module';

@Module({
  imports: [
    EnvConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    PermissionsModule,
    EmpreendimentosModule,
    InccModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
