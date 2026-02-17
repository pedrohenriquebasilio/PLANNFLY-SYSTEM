# Plannfly – Documento Técnico Inicial

## 1. Visão Geral

**Plannfly** é um SaaS voltado para professores independentes, com foco em **gestão de aulas, alunos, agenda e pagamentos**.

O sistema tem como objetivo centralizar:

* Organização da agenda de aulas
* Gestão de alunos
* Controle de planos e mensalidades
* Visualização financeira e operacional por meio de dashboards

> Este documento descreve apenas o **escopo inicial (v0)** da aplicação. Funcionalidades futuras (como automações via WhatsApp/IA) **não fazem parte deste escopo**.

---

## 2. Público-Alvo

* Professores independentes
* Instrutores particulares (música, idiomas, esportes, reforço escolar, etc.)
* Profissionais que gerenciam aulas recorrentes e pagamentos mensais

---

## 3. Escopo da Versão Inicial (v0)

### Incluído

* Autenticação via Google
* Gestão de agenda e calendário
* CRUD de alunos
* CRUD de planos e pagamentos
* Dashboard operacional e financeiro

### Fora do escopo (explicitamente)

* Integração com WhatsApp
* IA ou automações de mensagens
* Pagamentos automáticos (ex: cartão, PIX)

---

## 4. Autenticação e Usuários

### 4.1 Autenticação

* Login **exclusivamente via Google OAuth**
* Backend responsável por:

  * Validar token do Google
  * Criar ou recuperar o usuário na base
  * Gerenciar sessão/token da aplicação

### 4.2 Usuário (Professor)

Cada conta representa **um professor independente**.

Campos básicos do usuário:

* ID
* Nome
* Email (provido pelo Google)
* Data de criação

---

## 5. Gestão de Agenda e Calendário

### 5.1 Calendário

O usuário deve ter acesso a uma **página específica de calendário**, onde poderá:

* Visualizar aulas agendadas
* Visualizar aulas do dia
* Identificar aulas:

  * A realizar
  * Realizadas
  * Remarcadas

### 5.2 Configuração da Agenda

O usuário deve conseguir definir:

* Dias da semana em que trabalha
* Horários de funcionamento
* Regras de remarcação (ex: antecedência mínima)

Essas configurações impactam diretamente:

* Criação de novas aulas
* Remarcações
* Validações de agenda

---

## 6. Gestão de Alunos

### 6.1 Cadastro de Alunos (CRUD)

O sistema deve permitir **CRUD completo de alunos**.

Campos obrigatórios:

* Nome
* Telefone
* CPF (**chave única por usuário**)

Regras importantes:

* Não pode existir dois alunos com o mesmo CPF para o mesmo professor
* O aluno sempre pertence a um único professor

---

## 7. Planos e Pagamentos

### 7.1 Planos

O usuário pode criar **planos de aulas**, definindo:

* Nome do plano (ex: "Mensal – 2x por semana")
* Frequência de aulas (ex: 1x, 2x por semana)
* Valor do plano

Um plano pode estar associado a **vários alunos**.

### 7.2 Pagamentos

* Pagamentos são **atrelados diretamente aos alunos**
* O professor gerencia manualmente:

  * Mensalidades
  * Status do pagamento (pago / pendente)

Não há processamento financeiro automático na v0.

---

## 8. Dashboard

### 8.1 Dashboard Inicial

Ao entrar na aplicação, o usuário deve visualizar um dashboard com:

* Aulas do dia
* Aulas a serem dadas
* Aulas dadas
* Aulas remarcadas
* Valores a receber

### 8.2 Filtros

O dashboard deve permitir filtros por:

* Aluno
* Período

### 8.3 Indicadores

Indicadores esperados:

* Receita recebida x receita esperada
* Progressão de receita ao longo do tempo

---

## 9. Regras Gerais de Negócio

* Todos os dados são **isolados por usuário (professor)**
* Um professor não pode acessar dados de outro
* CPF é chave única apenas dentro do escopo do professor
* Toda aula, plano e pagamento deve estar vinculado a um aluno

---

## 10. Considerações Técnicas Iniciais

* Arquitetura preparada para crescimento (SaaS)
* Backend responsável por:

  * Autenticação
  * Regras de negócio
  * Validações
* Frontend focado em:

  * Experiência simples
  * Visualização clara de agenda e números

---

## 11. Próximos Passos (fora deste documento)

* Modelagem detalhada de banco de dados ( PRISMA )
* Definição da stack técnica ( NEST.JS BACKEND / NEXT FRONTEND)
