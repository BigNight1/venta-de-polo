import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Servir archivos estáticos
  const staticPath = join(__dirname, '..', "..", 'public');
  app.useStaticAssets(staticPath);


  // Habilitar CORS para el frontend de forma dinámica , despues hacerlo 
  app.enableCors();

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');
  await app.listen(port);
  console.log(`Backend running on port ${port}`);

  // Monitoreo de memoria cada 10 segundos
  setInterval(() => {
    const used = process.memoryUsage();
    console.log('Memoria usada (MB):', {
      rss: (used.rss / 1024 / 1024).toFixed(2),
      heapTotal: (used.heapTotal / 1024 / 1024).toFixed(2),
      heapUsed: (used.heapUsed / 1024 / 1024).toFixed(2),
      external: (used.external / 1024 / 1024).toFixed(2),
    });
  }, 10000); // cada 10 segundos
}
bootstrap();
