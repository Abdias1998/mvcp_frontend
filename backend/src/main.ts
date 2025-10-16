import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS to allow the frontend to communicate with the backend
  app.enableCors();

  // Use a global pipe to automatically validate incoming request bodies
  app.useGlobalPipes(new ValidationPipe());
  const port = process.env.PORT || 3000; // Render attribue le port dynamiquement
  await app.listen(port);
  console.log(`🚀 Server running on port ${port}`);
}
bootstrap();
