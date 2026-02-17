# PRD - Plannfly

**SaaS de Gestao para Professores**

| Campo   | Valor                                    |
|---------|------------------------------------------|
| Versao  | 1.0.0                                    |
| Data    | 2026-01-26                               |
| Status  | Aprovado para Desenvolvimento            |
| Stack   | NestJS, Next.js, Prisma, n8n, LLM Local  |

---

## 1. O Problema e a Solucao

### Problema
Professores particulares perdem receita e tempo gerenciando agendas manualmente e cobrando alunos via "fiado".

### Solucao
Um sistema "Headless" onde o professor configura regras via Web, e um Agente IA (WhatsApp) gerencia toda a interacao com o aluno (agendamento, duvidas e cobranca).

### Modelo de Negocio
Taxa de R$ 1,00 por transacao paga via link:
- R$ 0,80 - Custo AbacatePay
- R$ 0,20 - Margem Plannfly

---

## 2. Personas

### O Professor (Admin)
- 20-30 anos
- Tech-savvy o suficiente para usar um dashboard
- Quer automacao total no dia a dia

### O Aluno (End-User)
- Interage 100% via WhatsApp
- Nao faz login
- Nao baixa app

---

## 3. Requisitos Funcionais (Features)

### 3.1. Dashboard Web (Next.js)

#### Login Social
Google Auth (ja previsto no Schema `googleId`).

#### Configuracao de Agenda (ScheduleConfig)
- Interface visual de grade horaria para definir `workingHours` (Ex: Seg 08:00-18:00)
- Bloqueio manual de horarios (`blockedSlots`)

#### Gestao de Planos (Plan)
- CRUD de planos (Ex: "Plano Mensal 4 aulas/mes - R$ 200")

#### Gestao de Alunos (Student)
- Cadastro manual (Nome, WhatsApp, CPF)
- Associacao de Aluno a Plano (`StudentPlan`)

### 3.2. O Cerebro da Automacao (n8n + LLM Local)

#### Recepcao de Mensagem
O n8n recebe o webhook do WhatsApp.

#### Classificacao de Intencao (LLM)
O LLM analisa o texto e define a acao:
- `AGENDAR`
- `CANCELAR`
- `DUVIDA`
- `PAGAMENTO`

#### Tool Calling (A Grande Diferenca)
1. O LLM **nao decide** se o horario esta livre
2. Ele extrai a entidade `DATA` e `HORA`
3. O n8n chama a API do NestJS (`GET /availability?date=...`)
4. O NestJS retorna `true/false`
5. O LLM gera a resposta final baseada no retorno da API

### 3.3. Motor Financeiro (AbacatePay)

#### Geracao de Cobranca
1. Cronjob no NestJS verifica `Payments` com `status: pending` e `dueDate` proxima
2. Chama API AbacatePay -> Gera Link de Pagamento com Split Rule configurada

#### Envio
n8n dispara mensagem template no WhatsApp:
> "Ola {nome}, sua fatura vence hoje. Link: {url}"

#### Conciliacao
1. Webhook da AbacatePay bate no NestJS
2. Atualiza `Payment` para `paid`
3. Notifica Professor

---

## 4. Arquitetura de Dados (Prisma Analysis)

O schema esta 90% pronto, mas tem dois pontos de atencao critica para o fluxo de LLM e Pagamento funcionar.

### Ajustes Obrigatorios no Schema

#### Controle de LLM (Omissao Critica)
Voce nao tem onde guardar o contexto da conversa. LLMs locais nao tem memoria longa.

**Sugestao:** Criar tabela `ConversationLog` ou usar Redis para manter as ultimas 10 mensagens, senao o bot vai esquecer o que o aluno falou 2 segundos atras.

#### Idempotencia de Pagamento
Na tabela `Payment`, o campo `gatewayTransactionId` e vital. Garanta que ele seja preenchido antes de enviar o link, para evitar gerar 2 links para a mesma divida.

---

## 5. Requisitos Nao-Funcionais (SLA & Constraints)

### 5.1. Latencia do LLM Local

**Risco:** Se o modelo local demorar >10s para responder, o WhatsApp (Meta) pode dar timeout no webhook ou o usuario vai enviar "??" achando que travou.

**Requisito:** O n8n deve enviar um "Ack" (recibo de leitura) ou uma mensagem de "Digitando..." imediatamente, enquanto o LLM processa.

### 5.2. Seguranca Financeira

**Regra:** O webhook da AbacatePay deve ser validado via assinatura (HMAC) para evitar que alguem simule um pagamento falso chamando sua API.

---

## 6. Fluxos Criticos (User Stories)

### Fluxo 1: Agendamento Inteligente

```
Aluno: "Tem horario pra sexta as 15h?"
    |
    v
LLM: Extrai intent: check_availability, date: 2026-01-30, time: 15:00
    |
    v
n8n: Chama GET /lessons/check-availability
    |
    v
NestJS:
  - Verifica ScheduleConfig (Professor trabalha sexta as 15h?)
  - Verifica Lesson (Ja tem aula marcada?)
  - Retorna: available: true
    |
    v
LLM: Gera resposta: "Tenho sim! Quer confirmar?"
    |
    v
Aluno: "Sim"
    |
    v
n8n: Chama POST /lessons -> Cria registro no banco
```

### Fluxo 2: O Ciclo do Dinheiro (Split Payment)

```
NestJS (Cron): Identifica fatura de R$ 100,00 vencendo
    |
    v
AbacatePay API: Cria cobranca de R$ 101,00 (R$ 100 aula + R$ 1 taxa)
    |
    v
Split:
  - R$ 100,00 -> Conta Bancaria do Professor (Cadastrada na Abacate)
  - R$ 0,20 -> Conta Plannfly
  - Taxa Abacate: R$ 0,80 (retido na fonte)
    |
    v
n8n: Envia link
    |
    v
Aluno: Paga
    |
    v
Webhook: Atualiza Payment status paid
```

---

## 7. Roadmap de Desenvolvimento

### v0 - MVP Basico (Em Desenvolvimento)
- [x] Autenticacao Google OAuth
- [x] CRUD de Alunos
- [x] CRUD de Planos
- [x] CRUD de Aulas
- [x] Controle de Pagamentos (manual)
- [x] Dashboard
- [x] Calendario

### v1 - Automacao
- [ ] Integracao n8n
- [ ] LLM Local para classificacao de intencao
- [ ] WhatsApp API (webhook)
- [ ] Agendamento via chat

### v2 - Financeiro
- [ ] Integracao AbacatePay
- [ ] Split de pagamentos
- [ ] Cobranca automatica
- [ ] Conciliacao via webhook
