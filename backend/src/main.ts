import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

async function bootstrap() {
  // Validar variáveis de ambiente críticas
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 32) {
    console.error('❌ ERRO: JWT_SECRET deve estar configurado e ter pelo menos 32 caracteres');
    console.error('   Gere uma chave com: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);

  // Helmet - Headers de segurança
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false, // Necessário para Swagger UI
    }),
  );

  // Configurar CORS com whitelist
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3001',
  ].filter(Boolean);

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Permitir requisições sem origin (mobile apps, Postman, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS bloqueou origem: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Refresh-Token'],
  });

  // Cookie parser para refresh tokens
  app.use(cookieParser());

  // Validation pipe global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Exception filters globais
  app.useGlobalFilters(new HttpExceptionFilter(), new PrismaExceptionFilter());

  // Interceptor global para padronizar responses
  app.useGlobalInterceptors(new TransformInterceptor());

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Plannfly API')
    .setDescription('API para gestão de aulas, alunos, agenda e pagamentos para professores independentes')
    .setVersion('1.0')
    .addTag('auth', 'Autenticação e autorização')
    .addTag('users', 'Usuários (Professores)')
    .addTag('students', 'Alunos')
    .addTag('plans', 'Planos')
    .addTag('lessons', 'Aulas')
    .addTag('payments', 'Pagamentos')
    .addTag('calendar', 'Calendário e Agenda')
    .addTag('dashboard', 'Dashboard e Métricas')
    .addTag('schedule-config', 'Configuração de Agenda')
    .addTag('webhooks', 'Webhooks de integração externa')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
}
bootstrap();