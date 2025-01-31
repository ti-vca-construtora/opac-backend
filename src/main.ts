import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { fastifyCors } from '@fastify/cors';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('VCA Tech API')
    .setDescription('REST API - Interação com o Portal de Soluções da VCA Tech')
    .setVersion('1.0.0')
    .addBearerAuth({
      description: 'É necessário informar o token para realizar requisições.',
      name: 'Authorization: Bearer <<token>>',
      type: 'http',
      in: 'Header',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  await app.register(fastifyCors, { origin: '*' });

  await app.listen(3000, '0.0.0.0');
}

bootstrap();
