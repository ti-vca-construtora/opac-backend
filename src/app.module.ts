import { Module } from '@nestjs/common';
import { PrismaModule } from './shared/prisma/prisma.module';
import { EnvConfigModule } from './shared/env-config/env-config.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PermissionsModule } from './permissions/permissions.module';
import { EmpreendimentosModule } from './empreendimentos/empreendimentos.module';
import { InccModule } from './incc/incc.module';
import { AnosModule } from './anos/anos.module';
import { MesesModule } from './meses/meses.module';
import { SemanasModule } from './semanas/semanas.module';

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
    AnosModule,
    MesesModule,
    SemanasModule,
  ],
})
export class AppModule {}
