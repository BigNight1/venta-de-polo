import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Servir archivos estáticos
  const staticPath = join(__dirname, '..', "..", 'public');
  // console.log('Sirviendo archivos estáticos desde:', staticPath);
  app.useStaticAssets(staticPath);


  // Crear admin si no existe
  // const usersService = app.get(UsersService);
  // await usersService.createAdminUser();
  // Habilitar CORS para el frontend de forma dinámica , despues hacerlo 
  app.enableCors();

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');
  await app.listen(port);
  console.log(`Backend running on port ${port}`);
}
bootstrap();
