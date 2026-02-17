# Plannfly Frontend

Aplicacao web construida com Next.js 16 para gestao de aulas e alunos.

## Stack

- **Framework:** Next.js 16 (App Router)
- **React:** 19
- **Auth:** NextAuth.js v5 (Auth.js)
- **Estilizacao:** Tailwind CSS 4
- **Componentes:** Radix UI + shadcn/ui
- **Icones:** Lucide React

## Estrutura de Pastas

```
auth.ts                     # NextAuth v5 config (providers, callbacks)
middleware.ts               # Protecao de rotas (redireciona nao-autenticados)
app/
├── layout.tsx              # Layout raiz (com SessionProvider)
├── api/auth/[...nextauth]/ # NextAuth route handler
├── globals.css             # Estilos globais (inclui estilos da landing)
├── login/
│   └── page.tsx            # Pagina de login
├── (landing)/              # Route group da landing page
│   ├── layout.tsx          # Layout da landing (fonte Manrope)
│   └── page.tsx            # Landing page publica (rota "/")
├── (dashboard)/            # Route group do dashboard (estilos)
│   ├── layout.tsx          # Layout com CSS do dashboard
│   └── dashboard.css       # Tema e variaveis CSS
├── home/                   # Dashboard do professor
│   ├── layout.tsx          # Layout que importa dashboard.css
│   └── page.tsx            # Home do dashboard (rota "/home")
├── agenda/
│   └── page.tsx            # Calendario + aulas do dia
├── students/
│   └── page.tsx            # CRUD de alunos
├── mensalidades/
│   └── page.tsx            # Controle de mensalidades
├── settings/
│   ├── schedule/
│   │   └── page.tsx        # Configuracao de horarios
│   └── profile/
│       └── page.tsx        # Perfil do professor
├── hooks/
│   └── useScrollAnimation.ts # Hook para animacoes de scroll
├── components/
│   ├── layout/
│   │   ├── DashboardLayout.tsx  # Wrapper de paginas
│   │   ├── Header.tsx           # Cabecalho
│   │   └── SideBar.tsx          # Menu lateral
│   ├── landing/                 # Componentes da landing page
│   │   ├── BonusCards.tsx
│   │   ├── FaqItem.tsx
│   │   └── FeaturesImageCard.tsx
│   └── ui/                      # Componentes shadcn
│       ├── button.tsx
│       ├── card.tsx
│       ├── collapsible.tsx
│       ├── input.tsx
│       └── switch.tsx
├── lib/
│   ├── api.ts              # Cliente HTTP para backend (token via NextAuth session)
│   └── utils.ts            # Utilitarios (cn, etc)
└── public/
    ├── logo4.svg           # Logo para landing page
    └── ...                 # Assets estaticos
```

## Rotas Publicas

| Rota             | Pagina         | Descricao                              |
|------------------|----------------|----------------------------------------|
| `/`              | Landing Page   | Pagina publica de apresentacao         |
| `/login`         | Login          | Autenticacao via Google OAuth          |

## Navegacao (Sidebar - area autenticada)

| Rota             | Label          | Icone        |
|------------------|----------------|--------------|
| `/home`          | Dashboard      | LayoutDashboard |
| `/agenda`        | Agenda         | Calendar     |
| `/students`      | Alunos         | Users        |
| `/mensalidades`  | Mensalidades   | CreditCard   |
| `/settings/*`    | Configuracoes  | Settings     |

**Submenu Configuracoes:**
- `/settings/schedule` - Horarios (Clock)
- `/settings/profile` - Perfil (User)

---

## Design System & Patterns

### Tema de Cores

O tema usa CSS variables com HSL. A cor primaria e **violeta/roxo** (`#7c3aed`).

```css
/* Cores principais */
--primary: 262 83% 58%;           /* Violeta - cor principal */
--background: 210 40% 98%;        /* Cinza-azulado suave */
--card: 0 0% 100%;                /* Branco para cards */
--muted-foreground: 215 16% 47%; /* Texto secundario */
--border: 214 32% 91%;            /* Bordas sutis */
```

### Espacamento Padrao

| Contexto              | Valor           |
|-----------------------|-----------------|
| Padding de pagina     | `p-8 pt-6`      |
| Gap entre cards       | `gap-6`         |
| Padding interno card  | `p-4` ou `p-6`  |
| Espacamento vertical  | `space-y-6`     |

### Border Radius

```css
--radius: 0.75rem;  /* Base: rounded-xl */
```

- Cards: `rounded-xl`
- Botoes: `rounded-md` ou `rounded-lg`
- Inputs: `rounded-md`
- Avatares: `rounded-full`

---

## Padroes de Pagina

### Estrutura Base de Pagina

Toda pagina do dashboard DEVE seguir este padrao:

```tsx
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";

export default function MinhaPage() {
  return (
    <DashboardLayout title="Titulo" breadcrumb="Breadcrumb">
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Conteudo aqui */}
      </div>
    </DashboardLayout>
  );
}
```

### Animacao de Entrada

Sempre usar a animacao de entrada padrao:

```tsx
className="animate-in fade-in slide-in-from-bottom-4 duration-500"
```

---

## Padroes de Cards

### Card Simples (KPI)

```tsx
<Card className="p-6 bg-card border-border shadow-sm hover:shadow-md transition-shadow">
  <p className="text-sm font-medium text-muted-foreground">{label}</p>
  <h2 className="text-3xl font-bold mt-2 tracking-tight">{value}</h2>
</Card>
```

### Card com Header

```tsx
<Card className="border-border shadow-sm overflow-hidden">
  <div className="p-4 border-b border-border flex items-center gap-2">
    <Icon className="w-5 h-5 text-muted-foreground" />
    <h3 className="font-semibold">{titulo}</h3>
  </div>
  <div className="p-6">
    {/* Conteudo */}
  </div>
</Card>
```

### Card com Header e Info

```tsx
<Card className="min-h-[300px] border-border shadow-sm overflow-hidden flex flex-col">
  <div className="p-4 border-b border-border flex items-center justify-between bg-card">
    <div className="flex items-center gap-2">
      <Icon className="w-5 h-5 text-muted-foreground" />
      <h3 className="font-semibold text-sm">{titulo}</h3>
    </div>
    <Info className="w-4 h-4 text-muted-foreground cursor-help" />
  </div>
  <div className="flex-1 p-6">
    {/* Conteudo */}
  </div>
</Card>
```

---

## Padroes de Listagem (CRUD)

### Estrutura de Pagina de Listagem

```tsx
<DashboardLayout title="Entidade" breadcrumb="Entidade">
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

    {/* Titulo e Acao Principal */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Entidade</h1>
    </div>

    {/* Card de Conteudo */}
    <Card className="bg-card border-border shadow-sm rounded-xl overflow-hidden min-h-[600px] flex flex-col">

      {/* Toolbar */}
      <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-card">
        {/* Busca */}
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar..."
            className="pl-9 bg-secondary/50 border-transparent focus:bg-background focus:border-primary/50 transition-all h-10"
          />
        </div>

        {/* Botao Criar */}
        <Button className="w-full sm:w-auto bg-gradient-primary hover:opacity-90 transition-opacity text-white shadow-lg shadow-primary/25 border-0">
          <Plus className="w-4 h-4 mr-2" />
          Cadastrar
        </Button>
      </div>

      {/* Header da Tabela */}
      <div className="grid grid-cols-12 gap-4 p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/30 border-b border-border">
        <div className="col-span-2 pl-2">ID</div>
        <div className="col-span-4">Nome</div>
        {/* ... outras colunas */}
      </div>

      {/* Conteudo (lista ou empty state) */}
      <div className="flex-1">
        {/* Itens ou Empty State */}
      </div>

      {/* Paginacao */}
      <div className="p-4 border-t border-border flex items-center justify-end gap-2 bg-card">
        <Button variant="outline" size="icon" className="h-8 w-8">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

    </Card>
  </div>
</DashboardLayout>
```

### Empty State

```tsx
<div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
  <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
    <Search className="w-8 h-8 text-muted-foreground/50" />
  </div>
  <h3 className="text-lg font-medium text-foreground">Nenhum dado encontrado</h3>
  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
    Descricao do empty state aqui.
  </p>
</div>
```

---

## Padroes de Botoes

### Botao Primario (CTA)

```tsx
<Button className="bg-gradient-primary hover:opacity-90 transition-opacity text-white shadow-lg shadow-primary/25 border-0">
  <Plus className="w-4 h-4 mr-2" />
  Acao Principal
</Button>
```

### Botao Ghost (Icone)

```tsx
<Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
  <Icon className="w-5 h-5" />
</Button>
```

### Botao Outline (Paginacao)

```tsx
<Button variant="outline" size="icon" className="h-8 w-8">
  <ChevronLeft className="w-4 h-4" />
</Button>
```

---

## Padroes de Input

### Input com Icone de Busca

```tsx
<div className="relative w-full sm:w-96">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
  <Input
    placeholder="Pesquisar..."
    className="pl-9 bg-secondary/50 border-transparent focus:bg-background focus:border-primary/50 transition-all h-10"
  />
</div>
```

---

## Padroes de Grid

### Grid de KPIs (3 colunas)

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {kpis.map((kpi) => (
    <Card key={kpi.label} className="p-6 ...">
      {/* ... */}
    </Card>
  ))}
</div>
```

### Grid de Charts (2 colunas)

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Cards de graficos */}
</div>
```

---

## Padroes de Tipografia

| Elemento           | Classes                                           |
|--------------------|---------------------------------------------------|
| Titulo de pagina   | `text-2xl font-semibold tracking-tight`           |
| Titulo de card     | `font-semibold` ou `font-semibold text-sm`        |
| Label              | `text-sm font-medium text-muted-foreground`       |
| Valor grande       | `text-3xl font-bold tracking-tight`               |
| Texto secundario   | `text-sm text-muted-foreground`                   |
| Header de tabela   | `text-xs font-medium text-muted-foreground uppercase tracking-wider` |

---

## Padroes de Icones

- **Biblioteca:** Lucide React
- **Tamanho padrao:** `w-4 h-4` ou `w-5 h-5`
- **Cor:** `text-muted-foreground` (inativo) / `text-foreground` (ativo)

```tsx
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";

<Search className="w-4 h-4 text-muted-foreground" />
```

---

## Variaveis CSS Customizadas

```css
/* Gradiente primario (botoes CTA) */
.bg-gradient-primary {
  background: linear-gradient(110deg, #7c3aed 0%, #9061f9 40%, #c4b5fd 50%, #9061f9 60%, #7c3aed 100%);
  background-size: 200% auto;
}

/* Animacao shimmer */
--animate-shimmer: shimmer 2s linear infinite;
```

---

## Checklist para Novas Paginas

- [ ] Usar `DashboardLayout` como wrapper
- [ ] Adicionar animacao `animate-in fade-in slide-in-from-bottom-4 duration-500`
- [ ] Usar `space-y-6` para espacamento vertical
- [ ] Cards com `border-border shadow-sm`
- [ ] Botao principal com `bg-gradient-primary`
- [ ] Inputs com `bg-secondary/50 border-transparent`
- [ ] Empty states centralizados com icone em circulo
- [ ] Paginacao no footer do card
- [ ] Tipografia consistente (ver tabela acima)
- [ ] Icones do Lucide React

---

## Comandos

```bash
# Desenvolvimento (porta 3001)
npm run dev

# Build
npm run build

# Producao
npm run start

# Lint
npm run lint
```

## Variaveis de Ambiente

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_API_TIMEOUT=10000

# NextAuth
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=<gerar com openssl rand -base64 32>

# Google OAuth (usado pelo NextAuth)
AUTH_GOOGLE_ID=<Google Client ID>
AUTH_GOOGLE_SECRET=<Google Client Secret>

# Backend (server-side, usado pelos callbacks do NextAuth)
BACKEND_URL=http://localhost:3000
SERVER_AUTH_SECRET=<mesmo valor do backend>
```
