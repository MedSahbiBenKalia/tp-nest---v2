import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {  
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true, 
      transformOptions: {
        enableImplicitConversion: true, 
      },
    }),
  );
  app.enableCors({
    origin: '*', // Autoriser toutes les origines
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['*'], // Autoriser tous les headers
    credentials: true, // Désactiver les credentials pour le mode permissif
    exposedHeaders: ['*'],
  });

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
  });
  console.log(join(__dirname, '../..', 'public/uploads'))
  app.useStaticAssets(join(__dirname, '../..', 'public/uploads'), {
    prefix: '/uploads/',
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
