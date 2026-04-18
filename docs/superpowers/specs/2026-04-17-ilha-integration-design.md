# Integração Ilha — Design

**Data:** 2026-04-17
**Projeto:** sin-group-front
**Escopo:** Migrar 4 telas do protótipo `exemplos/` para o app React principal, gated por `projeto.id === 9` (Ilha-Teck).

---

## 1. Motivação

O protótipo em `exemplos/` (HTML/CSS/JS vanilla) consome dados do webhook n8n em `https://automacao.webhook.keekconecta.com.br/webhook/get-data` (POST form-urlencoded com `Type=getResumo`) e renderiza 4 visões: Visão Geral, Análises, Insights e Conversas. Essas visões devem fazer parte do produto para o cliente **Ilha-Teck** (projeto id = 9) e compartilhar o design system do app principal (MUI + Tailwind + paleta laranja `#FF7A01`, Lato).

## 2. Rotas e gating

Todas as rotas são nested sob `/ilha/*`, dentro do `Layout` existente, protegidas por `ProtectedRoute` (roles USER/ADMIN):

| Rota | Origem em `exemplos/` |
|---|---|
| `/ilha/visao-geral` | `#/overview` |
| `/ilha/analises` | `#/analytics` |
| `/ilha/insights` | `#/insights` |
| `/ilha/conversas` | `#/chat` |

**Gate:** hardcoded (Q1=a). Um componente wrapper (`IlhaLayout`) verifica `projeto.id === 9` via `useProject()` ou `useAuth().user.projeto.id`. Se falso, redireciona para `/home`. O item de menu "Ilha" no sidebar só renderiza quando a checagem é verdadeira.

**Constante** em `src/pages/ilha/constants.ts`:
```ts
export const ILHA_PROJECT_ID = 9;
```

## 3. Estrutura de arquivos

```
src/pages/ilha/
├── constants.ts                    — ID do projeto Ilha
├── layout/IlhaLayout.tsx           — guard + wrapper; sub-nav opcional
├── hooks/useIlhaData.ts            — react-query, cache 2min, queryKey ['ilha-data']
├── services/ilhaService.ts         — fetch POST form-urlencoded do webhook
├── types.ts                        — tipos normalizados (User, Conversation, Message, Event, Session)
├── utils/normalize.ts              — raw (5 tabelas SQL) → shape interno
├── utils/formatMarkdown.ts         — parser markdown simples (port de exemplos/dashboard.js)
├── overview/
│   ├── index.tsx                   — página Visão Geral
│   └── components/
│       ├── HeroCard.tsx
│       ├── LeadScoreRing.tsx       — ECharts gauge
│       └── ConversionFunnel.tsx    — ECharts funnel
├── analytics/
│   ├── index.tsx
│   └── components/
│       ├── TopIntentsBars.tsx      — ECharts bar (horizontal)
│       ├── TopThemesBars.tsx       — ECharts bar
│       ├── SentimentDonut.tsx      — ECharts pie (donut)
│       ├── SentimentTrack.tsx      — barra segmentada CSS (não é ECharts)
│       ├── BotPerformance.tsx      — métricas numéricas + mini ECharts sparkline
│       └── ThemeIntentMatrix.tsx   — ECharts heatmap
├── insights/
│   ├── index.tsx
│   └── components/
│       ├── InsightsList.tsx        — cards texto, sem chart
│       └── JourneyTimeline.tsx     — timeline CSS (não é ECharts)
└── conversas/
    ├── index.tsx                   — grid 3 colunas
    ├── hooks/useChatFilters.ts     — search + conversa selecionada
    └── components/
        ├── ConversationsList.tsx   — lista de usuários + busca
        ├── ChatThread.tsx          — bubbles, divisores de data, markdown
        ├── UserInfoPanel.tsx       — painel direito (detalhes user/conversa)
        ├── ConversationTabs.tsx    — abas retráteis
        └── AssistantTransferBadge.tsx — indicador de transferência bot → humano
```

## 4. Dados

### 4.1 Serviço

`src/pages/ilha/services/ilhaService.ts` expõe `fetchIlhaResumo()`:

```ts
export async function fetchIlhaResumo() {
  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ Type: "getResumo" }).toString(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Falha HTTP ${res.status}`);
  return res.json() as Promise<IlhaResumoRaw>;
}
```

`WEBHOOK_URL` fica em `src/pages/ilha/constants.ts` (não no `api.tsx` principal, que é de outra base).

### 4.2 Shape bruto (n8n SQL)

O n8n retorna 5 result-sets (conversations, events, sessions, users, chat_messages). O shape exato depende da versão do node Postgres — pode vir como `[[...], [...], [...], [...], [...]]` (array de arrays) ou mesclado. O `normalize.ts` deve suportar ambas as formas e emitir um erro claro caso nenhuma funcione.

### 4.3 Shape normalizado

```ts
export type IlhaUser = {
  id: string;
  nome: string;
  telefone: string;
  maskedPhone: string;
  latestStatus: string;
  leadScore: number;
  conversations: IlhaConversation[];
};

export type IlhaConversation = {
  id: string;
  startedAt: Date;
  endedAt: Date | null;
  duration: number;              // ms
  transferredToAssistant: boolean;
  transferredAt: Date | null;
  assistantName: string | null;
  messages: IlhaMessage[];
  events: IlhaEvent[];
  sentimentBreakdown: { positive: number; neutral: number; negative: number };
  topIntents: string[];
  topThemes: string[];
};

export type IlhaMessage = {
  id: string;
  conversationId: string;
  from: "user" | "bot" | "assistant";
  content: string;
  sentAt: Date;
  intent?: string;
  theme?: string;
  sentiment?: "positive" | "neutral" | "negative";
};

export type IlhaEvent = {
  id: string;
  conversationId: string;
  type: "transfer" | "status_change" | "intent_detected" | string;
  payload: Record<string, unknown>;
  occurredAt: Date;
};

export type IlhaResumo = {
  users: IlhaUser[];
  aggregates: {
    totalConversations: number;
    totalMessages: number;
    averageDuration: number;
    intentDistribution: { label: string; count: number }[];
    themeDistribution: { label: string; count: number }[];
    sentimentDistribution: { positive: number; neutral: number; negative: number };
    funnel: { label: string; count: number }[];
    themeIntentMatrix: Array<[string, string, number]>; // [theme, intent, count]
  };
};
```

### 4.4 Hook compartilhado

`useIlhaData` é um `useQuery` compartilhado entre as 4 rotas (queryKey fixa `['ilha-data']`, `staleTime: 2*60*1000`). Cada rota consome a mesma query, então só há um fetch mesmo navegando entre telas.

## 5. Transferência para assistente (Q2)

Detecção:
1. No `normalize.ts`, a tabela `events` é varrida por conversa. Evento com `type === 'transfer'` ou `payload.transferred === true` marca `transferredToAssistant = true`, registra `transferredAt` e `assistantName` se disponível.
2. Também mensagens com `from === 'assistant'` sinalizam transferência (fallback).

Renderização:
1. **Header da conversa:** `<AssistantTransferBadge assistantName={...} transferredAt={...} />` — chip laranja com ícone de pessoa, visível apenas se `transferredToAssistant`.
2. **Inline na thread:** entre a última mensagem de bot/user e a primeira de `assistant`, um divisor `<ThreadDivider>` com texto "Transferido para {assistantName}" e hora.
3. **No painel direito:** seção "Status" mostra "Atendente ativo" + nome + timestamp.
4. **Lista de usuários:** chip pequeno "ATENDENTE" se a conversa ativa do usuário está transferida.

## 6. Gráficos (ECharts)

**Biblioteca:** `echarts` + `echarts-for-react`. Instalação:
```bash
bun add echarts echarts-for-react
```

**Componentes com ECharts:**
| Componente | Tipo | Notas |
|---|---|---|
| `LeadScoreRing` | gauge | valor 0–100, cor segue limiar (vermelho/âmbar/verde) |
| `ConversionFunnel` | funnel | etapas do funil |
| `TopIntentsBars` | bar horizontal | top 5–8 intenções |
| `TopThemesBars` | bar horizontal | top 5–8 temas |
| `SentimentDonut` | pie (donut) | 3 fatias: positive/neutral/negative |
| `BotPerformance` (sparkline opcional) | line | série temporal curta de tempo de resposta |
| `ThemeIntentMatrix` | heatmap | eixo x=intenções, y=temas |

**Componentes CSS (não ECharts):**
- `SentimentTrack` — barra segmentada horizontal simples
- `JourneyTimeline` — timeline vertical
- `InsightsList` — cards textuais

**Tematização ECharts:**
Um helper `src/pages/ilha/utils/echartsTheme.ts` exporta opções base (cores alinhadas com a paleta do app: laranja `#FF7A01`, verde `#5d9161`, cinzas). Cada componente recebe o tema e aplica apenas os dados.

Todos os gráficos usam `<ReactECharts option={...} style={{height: '...'}} />` com altura controlada pelo container.

## 7. Tela de Conversas — layout e comportamento

Grid de 3 colunas via CSS Grid (Tailwind + CSS module):
```
grid-template-columns:
  minmax(280px, 340px)   // lista
  minmax(0, 1fr)         // thread
  minmax(280px, 360px);  // info
```
Altura: `calc(100dvh - header-height)`. Scroll independente por coluna.

**Lista (ConversationsList):**
- Busca textual (nome, telefone, status) — debounce 150ms
- Cada item: avatar (iniciais), nome, última mensagem truncada, hora, chip ATENDENTE se aplicável
- Contador no header ("N usuários", ou "N de M" quando filtro ativo)

**Thread (ChatThread):**
- Bubbles com tail, border-radius assimétrico
- Separadores de data (sticky top)
- Markdown básico (negrito, itálico, listas, links) via `formatMarkdown.ts`
- Divisor inline de transferência (ponto 5)
- Auto-scroll para a última mensagem ao selecionar conversa

**Info (UserInfoPanel):**
- Cabeçalho: avatar grande, nome, telefone
- Seção "Contexto": lead score (mini ring), duração total, nº conversas, nº mensagens
- Seção "Intenções e temas": chips das top 3 de cada
- Seção "Status": último status, se transferido mostra atendente
- Seção "Timeline": eventos principais (join, transfer, end)

**ConversationTabs:**
- Abas horizontais acima da thread quando o usuário tem múltiplas conversas
- Retrátil: botão chevron colapsa/expande a lista de abas (como no exemplos)
- Estado colapso persistido em `localStorage` com key `ilha-tabs-collapsed`

## 8. Navegação e menu

Em `Sidebar.tsx` (main app), adicionar um grupo condicional:

```tsx
{user.projeto.id === ILHA_PROJECT_ID && (
  <SidebarGroup label="Ilha">
    <MenuItem to="/ilha/visao-geral">Visão Geral</MenuItem>
    <MenuItem to="/ilha/analises">Análises</MenuItem>
    <MenuItem to="/ilha/insights">Insights</MenuItem>
    <MenuItem to="/ilha/conversas">Conversas</MenuItem>
  </SidebarGroup>
)}
```

(Nomes dos componentes dependem da implementação atual do Sidebar — ajustar na fase de plano.)

Se o usuário estiver logado em outro projeto, as rotas `/ilha/*` redirecionam para `/home` via `IlhaLayout`.

## 9. Estilo

- Paleta: laranja `#FF7A01` (primário, ações), verde `sinGroup.green` (positivo, recebidas), cinzas MUI para texto secundário
- Fonte: Lato (500 corpo, 600 headings, 700 números/score)
- Bubbles: `Paper` MUI com `elevation: 0`, border customizado, border-radius `16px` com 4px no canto do tail
- Cards dos dashboards: seguir o padrão já usado em `ProjectAcess` / MUI `Card` + sombra leve
- Tema ECharts harmonizado com a paleta via helper

## 10. Testes

Fora de escopo para essa spec — decisão de testes e cobertura fica para o plano de implementação. Mínimo aceito: normalizador (`normalize.ts`) deve ter testes unitários cobrindo os dois formatos possíveis de resposta do n8n.

## 11. Fora do escopo

- Envio de mensagens (composer é read-only)
- WebSocket / live updates (polling manual via refetch)
- Permissões granulares além do gate por `projeto.id`
- Exportação dos dashboards (PDF/CSV)
- Outros projetos que não sejam Ilha — a arquitetura permite generalizar depois, mas não é objetivo agora

## 12. Decisões em aberto (resolver no plano)

1. Nome exato da chave em `user.projeto` que contém o ID (pode ser `id`, `projetoId`, ou outro) — verificar em `src/@types/` na fase de plano.
2. Fonte real do "assistantName" no shape bruto — confirmar com a estrutura de `events` retornada pelo webhook em produção.
3. Se o Sidebar atual suporta grupos aninhados ou se precisa de adaptação.
