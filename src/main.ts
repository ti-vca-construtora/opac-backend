import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { fastifyCors } from '@fastify/cors';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './shared/swagger/swagger.config';

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

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'OPAC - API Docs',
    swaggerOptions: {
      filter: true,
      persistAuthorization: true,
    },
  });

  await app.register(fastifyCors, { origin: '*' });

  await app.listen(3000, '0.0.0.0');
}

bootstrap();
