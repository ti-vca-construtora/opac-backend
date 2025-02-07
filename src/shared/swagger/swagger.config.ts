import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('API Documentation')
  .setDescription('Documentação completa da API')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Insira o token JWT no formato: "Bearer {token}"',
    },
    'JWT',
  )
  .addTag('Auth', 'Operações de autenticação (login, registro, etc.)')
  .addTag('Users', 'Gerenciamento de usuários')
  .addTag('Permissions', 'Gerenciamento de permissões ABAC')
  .addTag('Empreendimentos', 'Gerenciamento de empreendimentos')
  .build();
