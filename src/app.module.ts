import { Module } from '@nestjs/common';
import { PrismaModule } from './shared/prisma/prisma.module';
import { EnvConfigModule } from './shared/env-config/env-config.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PermissionsModule } from './permissions/permissions.module';
import { EmpreendimentosModule } from './empreendimentos/empreendimentos.module';
import { InccModule } from './incc/incc.module';
import { MedicaoMensalModule } from './medicao-mensal/medicao-mensal.module';
import { AprovacoesModule } from './aprovacoes/aprovacoes.module';
import { ContabilidadeModule } from './contabilidade/contabilidade.module';

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
    MedicaoMensalModule,
    AprovacoesModule,
    ContabilidadeModule,
  ],
})
export class AppModule {}
