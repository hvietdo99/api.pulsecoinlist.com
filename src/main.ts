import * as dotenv from 'dotenv';
dotenv.config();

import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';
import * as helmet from 'helmet';
import * as httpContext from 'express-http-context';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as config from 'config';
import { json } from 'express';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { setCorrelationId } from './shares/http';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(httpContext.middleware);
  app.use(helmet());
  app.enableCors({ origin: '*' });
  app.useGlobalPipes(new ValidationPipe());
  app.use(setCorrelationId);
  app.use(json({ limit: '5mb' }));

  app.setGlobalPrefix(config.get('globalPath'));

  if (config.get('env') !== 'production') {
    await _setupSwagger(app);
  }

  await app.listen(config.get('port'), () => {
    console.log(
      `${config.get('serviceName')} running on ${config.get('port')}`,
    );
    console.log(
      `swagger: http://localhost:${config.get('port')}/${config.get(
        'swagger.path',
      )}`,
    );
  });
}

async function _setupSwagger(app: INestApplication) {
  const options = new DocumentBuilder()
    .setTitle(config.get('swagger.title'))
    .setDescription(config.get('swagger.description'))
    .setVersion(config.get('swagger.version'))
    .addBearerAuth()
    .addBasicAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  try {
    const outputSwaggerFile = `${process.cwd()}/output-specs/api.pulsecoinlist.com.json`;
    fs.writeFileSync(outputSwaggerFile, JSON.stringify(document, null, 2), {
      encoding: 'utf8',
    });
  } catch (e) {
    console.warn(`Could not write swagger docs to file: ${e}`);
  }

  SwaggerModule.setup(config.get('swagger.path'), app, document, {
    customSiteTitle: config.get('swagger.title'),
  });
}

bootstrap();
