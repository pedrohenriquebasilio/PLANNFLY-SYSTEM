# Plannfly

Sistema SaaS de gestao para professores independentes, focado em gerenciamento de aulas, alunos, agenda e pagamentos.

## Documentacao de Referencia

- **[context.md](./context.md)** - Escopo da versao inicial (v0) em desenvolvimento
- **[PRD.md](./PRD.md)** - Visao completa do MVP com automacoes futuras (n8n, LLM, WhatsApp)

## Visao Geral

### O Problema
Professores particulares perdem receita e tempo gerenciando agendas manualmente e cobrando alunos via "fiado".

### A Solucao
**v0 (Atual):** Dashboard web para gestao manual de agenda, alunos, planos e pagamentos.

**MVP (Futuro):** Sistema "Headless" onde o professor configura regras via Web, e um Agente IA (WhatsApp) gerencia toda a interacao com o aluno.

## Arquitetura do Projeto

```
PLANNFLY/
├── backend/          # API NestJS + Prisma + PostgreSQL
├── frontend/         # Next.js 16 + React 19 + Tailwind
├── context.md        # Escopo v0 (atual)
├── PRD.md            # Visao completa MVP
└── CLAUDE.md         # Este arquivo
```

## Stack Tecnologica

| Camada      | Tecnologia                     |
|-------------|--------------------------------|
| Frontend    | Next.js 16, React 19, Tailwind |
| Backend     | NestJS 11, Prisma 6            |
| Banco       | PostgreSQL                     |
| Auth        | NextAuth.js v5 + Backend JWT   |
| Docs API    | Swagger                        |

### Futuro (MVP Completo)
| Camada      | Tecnologia                     |
|-------------|--------------------------------|
| Automacao   | n8n                            |
| IA          | LLM Local                      |
| Pagamentos  | AbacatePay                     |
| Messaging   | WhatsApp API                   |

## Dominio de Negocio

### Entidades Principais

- **User (Professor):** Dono da conta, gerencia tudo
- **Student (Aluno):** Vinculado a um professor, identificado por CPF unico por professor
- **Plan (Plano de Mensalidade):** Template de cobranca - define frequencia, valor, duracao. Pode ser padrao ou especifico por aluno
- **Lesson (Aula):** Evento agendado, pode ser individual ou em grupo
- **Payment (Cobranca):** Registro de cobranca mensal - vinculado a aluno, com status pago/pendente
- **ScheduleConfig:** Configuracao de horarios disponiveis do professor

### Paginas do Frontend (v0)

| Rota             | Pagina         | Descricao                              |
|------------------|----------------|----------------------------------------|
| `/`              | Landing Page   | Pagina publica de apresentacao         |
| `/login`         | Login          | Autenticacao via Google OAuth          |
| `/home`          | Dashboard      | KPIs de aulas e financeiro             |
| `/agenda`        | Agenda         | Calendario + lista de aulas do dia     |
| `/students`      | Alunos         | CRUD de alunos                         |
| `/mensalidades`  | Mensalidades   | Planos de cobranca + controle de pagamentos |
| `/settings/*`    | Configuracoes  | Horarios e perfil do professor         |

### Regras de Negocio Fundamentais

1. **Isolamento de dados:** Cada professor so ve seus proprios dados
2. **CPF unico por professor:** Um aluno nao pode ter CPF duplicado dentro do mesmo professor
3. **Vinculacao obrigatoria:** Aulas, planos e pagamentos sempre vinculados a alunos
4. **Aulas em grupo:** Suportado via tabela intermediaria `LessonStudent`

## Comandos de Desenvolvimento

```bash
# Backend (porta 3000)
cd backend
npm install
npm run start:dev

# Frontend (porta 3001)
cd frontend
npm install
npm run dev
```

## Endpoints da API

Documentacao Swagger disponivel em: `http://localhost:3000/api`

### Tags principais:
- `/auth` - Autenticacao (sync, refresh, logout)
- `/users` - Perfil do professor
- `/students` - CRUD de alunos
- `/plans` - CRUD de planos
- `/lessons` - CRUD de aulas
- `/payments` - Controle de pagamentos
- `/calendar` - Visualizacao de calendario
- `/dashboard` - Metricas e indicadores
- `/schedule-config` - Configuracao de agenda

## Escopo v0 (Em Desenvolvimento)

### Incluido
- Autenticacao via Google
- Gestao de agenda e calendario
- CRUD de alunos
- Controle de mensalidades (pagamentos manuais)
- Dashboard operacional e financeiro
- Configuracao de horarios do professor

### Fora do Escopo v0
- Integracao com WhatsApp
- IA ou automacoes de mensagens
- Pagamentos automaticos (cartao, PIX)
- n8n / LLM Local
