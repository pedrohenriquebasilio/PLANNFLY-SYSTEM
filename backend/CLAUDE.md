# Plannfly Backend

API REST construida com NestJS para gestao de aulas, alunos, agenda e pagamentos.

## Stack

- **Framework:** NestJS 11
- **ORM:** Prisma 6
- **Banco:** PostgreSQL
- **Auth:** NextAuth.js v5 (frontend) + JWT + Refresh Tokens (backend)
- **Validacao:** class-validator + class-transformer
- **Docs:** Swagger (OpenAPI)

## Estrutura de Pastas

```
src/
├── main.ts                 # Bootstrap da aplicacao
├── app.module.ts           # Modulo raiz
├── prisma/                 # Prisma Service (singleton)
├── common/                 # Utilitarios compartilhados
│   ├── decorators/         # Decorators customizados
│   ├── dto/                # DTOs base
│   ├── filters/            # Exception filters
│   ├── guards/             # Guards de autorizacao
│   ├── interceptors/       # Interceptors (transform response)
│   ├── pipes/              # Pipes de validacao
│   └── validators/         # Validators customizados
├── auth/                   # Autenticacao
│   ├── guards/             # JWT Guard
│   └── dto/                # DTOs de auth (sync, refresh)
├── users/                  # Modulo de usuarios (professores)
├── students/               # Modulo de alunos
├── plans/                  # Modulo de planos
├── lessons/                # Modulo de aulas
├── payments/               # Modulo de pagamentos
├── calendar/               # Modulo de calendario
├── dashboard/              # Modulo de dashboard/metricas
├── schedule-config/        # Configuracao de agenda
└── generated/              # Tipos gerados pelo Prisma
```

## Modulos

| Modulo           | Responsabilidade                                |
|------------------|------------------------------------------------|
| PrismaModule     | Conexao com banco (singleton global)           |
| AuthModule       | Sync com NextAuth, JWT, refresh tokens         |
| UsersModule      | CRUD de usuarios/professores                   |
| StudentsModule   | CRUD de alunos                                 |
| PlansModule      | CRUD de planos de aula                         |
| LessonsModule    | CRUD de aulas agendadas                        |
| PaymentsModule   | Controle de mensalidades                       |
| CalendarModule   | Visualizacao de eventos em calendario          |
| DashboardModule  | Metricas e indicadores                         |
| ScheduleConfigModule | Configuracao de horarios do professor      |

## Banco de Dados (Prisma Schema)

### Modelos Principais

```
User (Professor)
├── students[]
├── plans[]
├── lessons[]
├── payments[]
├── scheduleConfig
└── refreshTokens[]

Student (Aluno)
├── studentPlans[] (relacao M:N com Plan)
├── lessonStudents[] (relacao M:N com Lesson)
└── payments[]

Plan (Plano)
├── studentPlans[]
├── lessons[]
└── payments[]

Lesson (Aula)
└── studentLessons[] (permite aulas em grupo)

Payment (Pagamento)
├── student
└── plan?

ScheduleConfig
├── availableDays[]
├── workingHours (JSON)
└── blockedSlots (JSON)
```

### Relacionamentos Importantes

- **User -> Student:** 1:N (professor tem varios alunos)
- **Student <-> Plan:** M:N via `StudentPlan` (aluno pode ter varios planos)
- **Lesson <-> Student:** M:N via `LessonStudent` (aula pode ter varios alunos)
- **User -> ScheduleConfig:** 1:1 (cada professor tem uma config)

## Configuracoes Globais (main.ts)

```typescript
// CORS configurado para frontend
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
});

// Validation Pipe global
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));

// Exception Filters
app.useGlobalFilters(
  new HttpExceptionFilter(),
  new PrismaExceptionFilter()
);

// Response Transform Interceptor
app.useGlobalInterceptors(new TransformInterceptor());
```

## Autenticacao

### Fluxo NextAuth + Backend JWT
1. Frontend usa NextAuth.js v5 para Google OAuth (sessao gerenciada pelo NextAuth)
2. No sign-in, NextAuth chama `POST /auth/sync` (server-to-server, protegido por `ServerAuthGuard`)
3. Backend cria/recupera usuario e retorna JWT access token + refresh token
4. Tokens armazenados no token encriptado do NextAuth (nao no localStorage)
5. Refresh automatico: NextAuth verifica expiracao e chama `POST /auth/refresh`

### Protecao de Rotas
- Usar `@UseGuards(JwtAuthGuard)` em controllers protegidos
- Decorator `@CurrentUser()` para obter usuario logado
- `ServerAuthGuard` protege `/auth/sync` (validacao via header `x-server-auth`)

## Comandos

```bash
# Desenvolvimento
npm run start:dev

# Build
npm run build

# Producao
npm run start:prod

# Testes
npm run test
npm run test:e2e

# Prisma
npx prisma generate    # Gerar tipos
npx prisma migrate dev # Criar migration
npx prisma studio      # GUI do banco
```

## Variaveis de Ambiente

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
SERVER_AUTH_SECRET=...          # Shared secret with NextAuth (frontend)
FRONTEND_URL=http://localhost:3001
```

## Swagger

Documentacao disponivel em: `http://localhost:3000/api`

- Autenticacao via Bearer Token (JWT)
- Todas as rotas documentadas com decorators do NestJS/Swagger
