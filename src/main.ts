
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';

import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {bufferLogs: true});

    app.enableCors({
    origin: 'http://localhost:5173', 
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe()); 
  app.use(cookieParser());
 app.useLogger(app.get(Logger));
  await app.listen(3000);
}
bootstrap();