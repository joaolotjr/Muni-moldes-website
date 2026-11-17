import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { corsOptions, trustProxySetting } from './security';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', trustProxySetting());
  app.disable('x-powered-by');

  // Cabeçalhos de segurança. As fotos em /uploads são carregadas pelo site, que
  // fica em outra origem, por isso a política de recursos é "cross-origin".
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.enableCors(corsOptions());

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  await app.listen(process.env.PORT ?? 3333);
}
bootstrap();
