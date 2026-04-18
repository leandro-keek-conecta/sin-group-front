# Ilha Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portar as 4 telas do protótipo `exemplos/` (Visão Geral, Análises, Insights, Conversas) para o app React principal, gated por `user.projeto.id === 9` (Ilha-Teck), com gráficos em ECharts e dados do webhook n8n.

**Architecture:** Nova rota `/ilha/*` dentro do `Layout` existente, um `IlhaLayout` faz o guard por projeto e contém sub-rotas. `useQuery` compartilhado entre as 4 rotas bate no webhook uma vez e alimenta tudo via `useIlhaData`. Conversas tem grid de 3 colunas. Gráficos via `echarts-for-react` com tema alinhado à paleta (laranja `#FF7A01`, Lato).

**Tech Stack:** React 18 · TypeScript · react-router-dom 6 · @tanstack/react-query 5 · MUI 5 · Tailwind · echarts + echarts-for-react (novos).

**Nota operacional:** o usuário definiu que **nunca devemos fazer `git commit`** neste projeto. As tarefas abaixo NÃO incluem step de commit. Ele controla os commits manualmente.

---

## Phase 0 — Setup

### Task 1: Instalar ECharts

**Files:**
- Modify: `package.json` (via package manager)

- [ ] **Step 1: Instalar dependências**

Run:
```bash
bun add echarts echarts-for-react
```

Expected output: adiciona `echarts` e `echarts-for-react` em `dependencies`.

- [ ] **Step 2: Verificar instalação**

Run:
```bash
bun pm ls | grep -E "echarts|echarts-for-react"
```

Expected: ambas listadas com versão.

---

## Phase 1 — Shared Infrastructure

### Task 2: Constantes

**Files:**
- Create: `src/pages/ilha/constants.ts`

- [ ] **Step 1: Criar arquivo**

```ts
export const ILHA_PROJECT_ID = 9;

export const ILHA_WEBHOOK_URL =
  "https://automacao.webhook.keekconecta.com.br/webhook/get-data";

export const ILHA_QUERY_KEY = ["ilha-data"] as const;

export const ILHA_QUERY_STALE_MS = 2 * 60 * 1000;
```

---

### Task 3: Tipos normalizados

**Files:**
- Create: `src/pages/ilha/types.ts`

- [ ] **Step 1: Criar arquivo completo**

```ts
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
  type: string;
  payload: Record<string, unknown>;
  occurredAt: Date;
};

export type IlhaConversation = {
  id: string;
  startedAt: Date;
  endedAt: Date | null;
  duration: number;
  transferredToAssistant: boolean;
  transferredAt: Date | null;
  assistantName: string | null;
  messages: IlhaMessage[];
  events: IlhaEvent[];
  sentimentBreakdown: { positive: number; neutral: number; negative: number };
  topIntents: string[];
  topThemes: string[];
};

export type IlhaUser = {
  id: string;
  nome: string;
  telefone: string;
  maskedPhone: string;
  latestStatus: string;
  leadScore: number;
  conversations: IlhaConversation[];
};

export type IlhaAggregates = {
  totalConversations: number;
  totalMessages: number;
  averageDuration: number;
  intentDistribution: { label: string; count: number }[];
  themeDistribution: { label: string; count: number }[];
  sentimentDistribution: { positive: number; neutral: number; negative: number };
  funnel: { label: string; count: number }[];
  themeIntentMatrix: Array<[string, string, number]>;
};

export type IlhaResumo = {
  users: IlhaUser[];
  aggregates: IlhaAggregates;
};

export type IlhaResumoRaw = unknown;
```

---

### Task 4: Teste unitário do normalizer (TDD)

**Files:**
- Create: `src/pages/ilha/utils/__tests__/normalize.test.ts`
- Create: `src/pages/ilha/utils/__tests__/fixtures.ts`

- [ ] **Step 1: Criar fixture com 2 formatos de resposta**

`src/pages/ilha/utils/__tests__/fixtures.ts`:
```ts
const conversations = [
  { id: "c1", user_id: "u1", started_at: "2026-04-10T10:00:00Z", ended_at: "2026-04-10T10:14:56Z" },
];
const events = [
  { id: "e1", conversation_id: "c1", type: "transfer", payload: { assistant_name: "Temis" }, occurred_at: "2026-04-10T10:10:00Z" },
];
const sessions = [{ id: "s1", conversation_id: "c1", user_status: "lead qualificado" }];
const users = [
  { id: "u1", nome: "Maria Silva", telefone: "+5583999990000", lead_score: 82 },
];
const chat_messages = [
  { id: "m1", conversation_id: "c1", from: "user", content: "Olá, quero um orçamento", sent_at: "2026-04-10T10:00:05Z", intent: "quote", theme: "pricing", sentiment: "neutral" },
  { id: "m2", conversation_id: "c1", from: "bot", content: "**Claro!** Qual produto?", sent_at: "2026-04-10T10:00:30Z", intent: "qualify", theme: "pricing", sentiment: "neutral" },
  { id: "m3", conversation_id: "c1", from: "assistant", content: "Oi, sou a Temis.", sent_at: "2026-04-10T10:10:05Z", intent: "greeting", theme: "support", sentiment: "positive" },
];

// Formato A: array de arrays (n8n postgres node)
export const rawFormatA = [conversations, events, sessions, users, chat_messages];

// Formato B: objeto com chaves nomeadas (fallback)
export const rawFormatB = { conversations, events, sessions, users, chat_messages };
```

- [ ] **Step 2: Criar teste**

`src/pages/ilha/utils/__tests__/normalize.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { normalize } from "../normalize";
import { rawFormatA, rawFormatB } from "./fixtures";

describe("normalize", () => {
  it("aceita array de arrays (formato A)", () => {
    const out = normalize(rawFormatA);
    expect(out.users).toHaveLength(1);
    expect(out.users[0].nome).toBe("Maria Silva");
    expect(out.users[0].conversations).toHaveLength(1);
    expect(out.users[0].conversations[0].messages).toHaveLength(3);
  });

  it("aceita objeto com chaves nomeadas (formato B)", () => {
    const out = normalize(rawFormatB);
    expect(out.users).toHaveLength(1);
    expect(out.users[0].conversations[0].transferredToAssistant).toBe(true);
  });

  it("detecta transferência para assistente via evento type=transfer", () => {
    const out = normalize(rawFormatA);
    const c = out.users[0].conversations[0];
    expect(c.transferredToAssistant).toBe(true);
    expect(c.assistantName).toBe("Temis");
    expect(c.transferredAt).toBeInstanceOf(Date);
  });

  it("agrega distribuições no nível global", () => {
    const out = normalize(rawFormatA);
    expect(out.aggregates.totalConversations).toBe(1);
    expect(out.aggregates.totalMessages).toBe(3);
    expect(out.aggregates.intentDistribution.length).toBeGreaterThan(0);
  });

  it("lança erro em formato não reconhecido", () => {
    expect(() => normalize({ foo: "bar" } as unknown)).toThrow(/formato/i);
  });
});
```

- [ ] **Step 3: Rodar e verificar que falha**

Run:
```bash
bun test src/pages/ilha/utils/__tests__/normalize.test.ts
```

Expected: FAIL — `normalize` não existe.

---

### Task 5: Implementar normalize.ts

**Files:**
- Create: `src/pages/ilha/utils/normalize.ts`

- [ ] **Step 1: Criar helper interno de detecção de formato**

`src/pages/ilha/utils/normalize.ts` (início):
```ts
import type {
  IlhaConversation,
  IlhaEvent,
  IlhaMessage,
  IlhaResumo,
  IlhaResumoRaw,
  IlhaUser,
} from "../types";

type RawTables = {
  conversations: any[];
  events: any[];
  sessions: any[];
  users: any[];
  chat_messages: any[];
};

function coerceTables(raw: IlhaResumoRaw): RawTables {
  if (Array.isArray(raw) && raw.length === 5 && raw.every(Array.isArray)) {
    const [conversations, events, sessions, users, chat_messages] = raw as any[];
    return { conversations, events, sessions, users, chat_messages };
  }
  if (
    raw &&
    typeof raw === "object" &&
    "conversations" in raw &&
    "chat_messages" in raw
  ) {
    const r = raw as RawTables;
    return {
      conversations: r.conversations ?? [],
      events: r.events ?? [],
      sessions: r.sessions ?? [],
      users: r.users ?? [],
      chat_messages: r.chat_messages ?? [],
    };
  }
  throw new Error(
    "Resposta do webhook em formato não reconhecido. Esperado array de 5 tabelas ou objeto com chaves {conversations, events, sessions, users, chat_messages}."
  );
}
```

- [ ] **Step 2: Adicionar helpers de formatação**

Append ao mesmo arquivo:
```ts
function toDate(v: unknown): Date {
  return v ? new Date(String(v)) : new Date(0);
}

function maskPhone(phone: string): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 6) return phone;
  const last2 = digits.slice(-2);
  return `${phone.slice(0, phone.length - 6)}****-**${last2}`;
}

function pickString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function topN<T extends { count: number; label: string }>(items: T[], n = 5): string[] {
  return [...items]
    .sort((a, b) => b.count - a.count)
    .slice(0, n)
    .map((x) => x.label);
}
```

- [ ] **Step 3: Adicionar função de agregação por lista**

Append:
```ts
function tally(list: Array<string | undefined>): { label: string; count: number }[] {
  const map = new Map<string, number>();
  for (const item of list) {
    if (!item) continue;
    map.set(item, (map.get(item) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}
```

- [ ] **Step 4: Implementar normalize**

Append:
```ts
export function normalize(raw: IlhaResumoRaw): IlhaResumo {
  const { conversations, events, sessions, users, chat_messages } = coerceTables(raw);

  const eventsByConv = new Map<string, IlhaEvent[]>();
  for (const e of events) {
    const convId = String(e.conversation_id ?? e.conversationId);
    const mapped: IlhaEvent = {
      id: String(e.id),
      conversationId: convId,
      type: pickString(e.type, "unknown"),
      payload: (e.payload ?? {}) as Record<string, unknown>,
      occurredAt: toDate(e.occurred_at ?? e.occurredAt),
    };
    const arr = eventsByConv.get(convId) ?? [];
    arr.push(mapped);
    eventsByConv.set(convId, arr);
  }

  const messagesByConv = new Map<string, IlhaMessage[]>();
  for (const m of chat_messages) {
    const convId = String(m.conversation_id ?? m.conversationId);
    const mapped: IlhaMessage = {
      id: String(m.id),
      conversationId: convId,
      from: (m.from as IlhaMessage["from"]) ?? "user",
      content: pickString(m.content),
      sentAt: toDate(m.sent_at ?? m.sentAt),
      intent: m.intent ?? undefined,
      theme: m.theme ?? undefined,
      sentiment: m.sentiment ?? undefined,
    };
    const arr = messagesByConv.get(convId) ?? [];
    arr.push(mapped);
    messagesByConv.set(convId, arr);
  }
  for (const arr of messagesByConv.values()) {
    arr.sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
  }

  const sessionsByConv = new Map<string, any>();
  for (const s of sessions) {
    sessionsByConv.set(String(s.conversation_id ?? s.conversationId), s);
  }

  const convsByUser = new Map<string, IlhaConversation[]>();
  for (const c of conversations) {
    const convId = String(c.id);
    const userId = String(c.user_id ?? c.userId);
    const msgs = messagesByConv.get(convId) ?? [];
    const evts = eventsByConv.get(convId) ?? [];

    const transferEvt = evts.find((e) => e.type === "transfer");
    const firstAssistantMsg = msgs.find((m) => m.from === "assistant");
    const transferredToAssistant = Boolean(transferEvt || firstAssistantMsg);
    const transferredAt =
      transferEvt?.occurredAt ?? firstAssistantMsg?.sentAt ?? null;
    const assistantName =
      (transferEvt?.payload as any)?.assistant_name ??
      (transferEvt?.payload as any)?.assistantName ??
      null;

    const intents = tally(msgs.map((m) => m.intent));
    const themes = tally(msgs.map((m) => m.theme));
    const sentimentBreakdown = {
      positive: msgs.filter((m) => m.sentiment === "positive").length,
      neutral: msgs.filter((m) => m.sentiment === "neutral").length,
      negative: msgs.filter((m) => m.sentiment === "negative").length,
    };

    const startedAt = toDate(c.started_at ?? c.startedAt);
    const endedAt = c.ended_at || c.endedAt ? toDate(c.ended_at ?? c.endedAt) : null;
    const duration = endedAt ? endedAt.getTime() - startedAt.getTime() : 0;

    const conv: IlhaConversation = {
      id: convId,
      startedAt,
      endedAt,
      duration,
      transferredToAssistant,
      transferredAt,
      assistantName,
      messages: msgs,
      events: evts,
      sentimentBreakdown,
      topIntents: topN(intents),
      topThemes: topN(themes),
    };

    const arr = convsByUser.get(userId) ?? [];
    arr.push(conv);
    convsByUser.set(userId, arr);
  }

  const ilhaUsers: IlhaUser[] = users.map((u: any) => {
    const userId = String(u.id);
    const convs = (convsByUser.get(userId) ?? []).sort(
      (a, b) => b.startedAt.getTime() - a.startedAt.getTime()
    );
    const latest = convs[0];
    const latestSession = latest ? sessionsByConv.get(latest.id) : null;
    const telefone = pickString(u.telefone ?? u.phone);
    return {
      id: userId,
      nome: pickString(u.nome ?? u.name, "Sem nome"),
      telefone,
      maskedPhone: maskPhone(telefone),
      latestStatus: pickString(latestSession?.user_status, "—"),
      leadScore: Number(u.lead_score ?? u.leadScore ?? 0),
      conversations: convs,
    };
  });

  const allMsgs = ilhaUsers.flatMap((u) => u.conversations.flatMap((c) => c.messages));
  const allConvs = ilhaUsers.flatMap((u) => u.conversations);

  const intentDistribution = tally(allMsgs.map((m) => m.intent));
  const themeDistribution = tally(allMsgs.map((m) => m.theme));
  const sentimentDistribution = {
    positive: allMsgs.filter((m) => m.sentiment === "positive").length,
    neutral: allMsgs.filter((m) => m.sentiment === "neutral").length,
    negative: allMsgs.filter((m) => m.sentiment === "negative").length,
  };

  const funnel = [
    { label: "Conversas iniciadas", count: allConvs.length },
    { label: "Interações bot", count: allConvs.filter((c) => c.messages.some((m) => m.from === "bot")).length },
    { label: "Qualificadas", count: allConvs.filter((c) => (c.topIntents ?? []).includes("qualify") || (c.topIntents ?? []).includes("quote")).length },
    { label: "Transferidas p/ atendente", count: allConvs.filter((c) => c.transferredToAssistant).length },
  ];

  const matrixMap = new Map<string, number>();
  for (const m of allMsgs) {
    if (!m.theme || !m.intent) continue;
    const k = `${m.theme}|${m.intent}`;
    matrixMap.set(k, (matrixMap.get(k) ?? 0) + 1);
  }
  const themeIntentMatrix: IlhaResumo["aggregates"]["themeIntentMatrix"] = [];
  for (const [k, v] of matrixMap) {
    const [theme, intent] = k.split("|");
    themeIntentMatrix.push([theme, intent, v]);
  }

  return {
    users: ilhaUsers,
    aggregates: {
      totalConversations: allConvs.length,
      totalMessages: allMsgs.length,
      averageDuration:
        allConvs.length > 0
          ? allConvs.reduce((a, c) => a + c.duration, 0) / allConvs.length
          : 0,
      intentDistribution,
      themeDistribution,
      sentimentDistribution,
      funnel,
      themeIntentMatrix,
    },
  };
}
```

- [ ] **Step 5: Rodar o teste**

Run:
```bash
bun test src/pages/ilha/utils/__tests__/normalize.test.ts
```

Expected: todos passam.

---

### Task 6: Serviço de fetch

**Files:**
- Create: `src/pages/ilha/services/ilhaService.ts`

- [ ] **Step 1: Criar arquivo**

```ts
import { ILHA_WEBHOOK_URL } from "../constants";
import type { IlhaResumoRaw } from "../types";

export async function fetchIlhaResumo(): Promise<IlhaResumoRaw> {
  const response = await fetch(ILHA_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ Type: "getResumo" }).toString(),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Falha ao carregar resumo Ilha (HTTP ${response.status})`);
  }
  return response.json();
}
```

---

### Task 7: Hook compartilhado

**Files:**
- Create: `src/pages/ilha/hooks/useIlhaData.ts`

- [ ] **Step 1: Criar hook**

```ts
import { useQuery } from "@tanstack/react-query";
import { ILHA_QUERY_KEY, ILHA_QUERY_STALE_MS } from "../constants";
import { fetchIlhaResumo } from "../services/ilhaService";
import { normalize } from "../utils/normalize";
import type { IlhaResumo } from "../types";

export function useIlhaData() {
  return useQuery<IlhaResumo, Error>({
    queryKey: ILHA_QUERY_KEY,
    queryFn: async () => normalize(await fetchIlhaResumo()),
    staleTime: ILHA_QUERY_STALE_MS,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
```

---

### Task 8: Parser markdown

**Files:**
- Create: `src/pages/ilha/utils/formatMarkdown.ts`

- [ ] **Step 1: Criar parser minimalista**

```ts
const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function formatMarkdown(raw: string): string {
  const escaped = escapeHtml(raw);
  const lines = escaped.split(/\r?\n/);

  const out: string[] = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };

  for (const line of lines) {
    const listMatch = line.match(/^\s*[-*]\s+(.*)$/);
    if (listMatch) {
      if (!inList) {
        out.push('<ul class="md-list">');
        inList = true;
      }
      out.push(`<li>${inlineFmt(listMatch[1])}</li>`);
      continue;
    }
    closeList();
    if (line.trim() === "") {
      out.push("<br />");
    } else {
      out.push(inlineFmt(line));
    }
  }
  closeList();
  return out.join("\n");
}

function inlineFmt(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}
```

---

## Phase 2 — Routes & Navegação

### Task 9: IlhaLayout (guard + sub-routing)

**Files:**
- Create: `src/pages/ilha/layout/IlhaLayout.tsx`

- [ ] **Step 1: Criar layout com guard**

```tsx
import { useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ILHA_PROJECT_ID } from "../constants";
import { Layout } from "@/components/Layout";

export default function IlhaLayout() {
  const { user } = useAuth();
  const projectId = user?.projeto?.id;

  if (projectId !== ILHA_PROJECT_ID) {
    return <Navigate to="/home" replace />;
  }

  return (
    <Layout titulo="Ilha — Conversation Intelligence">
      <Outlet />
    </Layout>
  );
}
```

**Nota:** se `Layout` exigir props diferentes (ex: sem `titulo`, ou não aceita `children` via `Outlet`), ajustar: pode ser necessário colocar `<Outlet />` como filho direto dentro do `<Layout>` em outro formato. Verificar `src/components/Layout.tsx` antes.

- [ ] **Step 2: Verificar que o import `Layout` tem `children` ou equivalente**

Run:
```bash
grep -n "children" src/components/Layout.tsx | head -20
```

Se a assinatura diferir, ajustar `IlhaLayout` (ex: usar `aoFechar`, `noDashboard={true}` nas props do Sidebar/Layout para evitar o skeleton do PowerBI que não se aplica aqui).

---

### Task 10: Registrar rotas

**Files:**
- Modify: `src/routes/routes.tsx`

- [ ] **Step 1: Adicionar imports**

Depois das linhas de import existentes (após linha 15):
```tsx
import IlhaLayout from "@/pages/ilha/layout/IlhaLayout";
import IlhaOverview from "@/pages/ilha/overview";
import IlhaAnalytics from "@/pages/ilha/analytics";
import IlhaInsights from "@/pages/ilha/insights";
import IlhaConversas from "@/pages/ilha/conversas";
```

- [ ] **Step 2: Adicionar bloco de rotas aninhadas**

Antes da linha `<Route path="*" element={<NotFound />} />` (linha 41):
```tsx
      {/* Ilha (só para projeto id=9) */}
      <Route
        path="/ilha"
        element={
          <ProtectedRoute allowedRoles={["USER", "ADMIN"]}>
            <IlhaLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<IlhaOverview />} />
        <Route path="visao-geral" element={<IlhaOverview />} />
        <Route path="analises" element={<IlhaAnalytics />} />
        <Route path="insights" element={<IlhaInsights />} />
        <Route path="conversas" element={<IlhaConversas />} />
      </Route>
```

- [ ] **Step 3: Criar stubs mínimos p/ cada página**

Criar 4 arquivos temporários que serão substituídos pelas tasks subsequentes:

`src/pages/ilha/overview/index.tsx`:
```tsx
export default function IlhaOverview() {
  return <div>Visão Geral (em construção)</div>;
}
```
`src/pages/ilha/analytics/index.tsx`:
```tsx
export default function IlhaAnalytics() {
  return <div>Análises (em construção)</div>;
}
```
`src/pages/ilha/insights/index.tsx`:
```tsx
export default function IlhaInsights() {
  return <div>Insights (em construção)</div>;
}
```
`src/pages/ilha/conversas/index.tsx`:
```tsx
export default function IlhaConversas() {
  return <div>Conversas (em construção)</div>;
}
```

- [ ] **Step 4: Subir dev server e validar navegação**

Run:
```bash
bun run dev
```

Logar no app com um usuário cujo `projeto.id === 9` e navegar manualmente para `/ilha/conversas`. Deve renderizar o stub. Logar com outro projeto e navegar para `/ilha/visao-geral` — deve redirecionar pra `/home`.

---

### Task 11: Sidebar condicional

**Files:**
- Modify: `src/components/sidebar/Sidebar.tsx`

- [ ] **Step 1: Adicionar imports de ícones e auth**

No topo de `Sidebar.tsx` (linhas 1-8), ajustar o import do MUI para incluir ícones que vamos usar e adicionar `useAuth`:
```tsx
import { BarChart, Public, Insights, Chat, Dashboard, Analytics } from "@mui/icons-material";
import { useAuth } from "@/context/AuthContext";
import { ILHA_PROJECT_ID } from "@/pages/ilha/constants";
```

- [ ] **Step 2: Ler o usuário dentro do componente**

Adicionar dentro do body de `Sidebar` (após linha 27):
```tsx
  const { user } = useAuth();
  const isIlha = user?.projeto?.id === ILHA_PROJECT_ID;
```

- [ ] **Step 3: Adicionar o bloco de itens condicionalmente**

Dentro do `<ul className={styles.ulStyle}>` (linha 86-119), após o bloco existente de rendering das seções PowerBI, adicionar antes do `</ul>`:
```tsx
        {isIlha && (
          <>
            <ItemMenu rotulo="ILHA" isTitle estaAberta={estaAberta} />
            <ItemMenu
              icone={<Dashboard />}
              rotulo="Visão Geral"
              para="/ilha/visao-geral"
              estaAberta={estaAberta}
              onClick={isMobile ? aoFechar : undefined}
            />
            <ItemMenu
              icone={<Analytics />}
              rotulo="Análises"
              para="/ilha/analises"
              estaAberta={estaAberta}
              onClick={isMobile ? aoFechar : undefined}
            />
            <ItemMenu
              icone={<Insights />}
              rotulo="Insights"
              para="/ilha/insights"
              estaAberta={estaAberta}
              onClick={isMobile ? aoFechar : undefined}
            />
            <ItemMenu
              icone={<Chat />}
              rotulo="Conversas"
              para="/ilha/conversas"
              estaAberta={estaAberta}
              onClick={isMobile ? aoFechar : undefined}
            />
          </>
        )}
```

- [ ] **Step 4: Validar no navegador**

Recarregar dev server. Com usuário do projeto 9: os 4 itens aparecem no sidebar sob o título "ILHA". Com outro projeto: não aparecem.

**Nota sobre navegação:** `ItemMenu` usa `<a href={para}>`, que dispara reload de página. Isso é aceitável (mesmo padrão do app). Se quiser SPA nav no futuro, trocar `<a>` por `<Link>` do react-router-dom em uma task separada fora deste plano.

---

## Phase 3 — Tela Conversas (prioridade)

### Task 12: Hook de filtros do chat

**Files:**
- Create: `src/pages/ilha/conversas/hooks/useChatFilters.ts`

- [ ] **Step 1: Criar hook com Zustand-like local state**

```ts
import { useCallback, useMemo, useState, useEffect } from "react";
import type { IlhaUser, IlhaConversation } from "../../types";

const TABS_STORAGE_KEY = "ilha-tabs-collapsed";

export function useChatFilters(users: IlhaUser[]) {
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [tabsCollapsed, setTabsCollapsedState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(TABS_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const setTabsCollapsed = useCallback((v: boolean) => {
    setTabsCollapsedState(v);
    try {
      localStorage.setItem(TABS_STORAGE_KEY, String(v));
    } catch {}
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const hay = [u.nome, u.telefone, u.maskedPhone, u.latestStatus]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [users, search]);

  useEffect(() => {
    if (!selectedUserId && filteredUsers.length > 0) {
      setSelectedUserId(filteredUsers[0].id);
    }
  }, [filteredUsers, selectedUserId]);

  const selectedUser = useMemo<IlhaUser | null>(
    () => users.find((u) => u.id === selectedUserId) ?? null,
    [users, selectedUserId]
  );

  useEffect(() => {
    if (!selectedUser) return;
    const validIds = new Set(selectedUser.conversations.map((c) => c.id));
    if (!selectedConversationId || !validIds.has(selectedConversationId)) {
      setSelectedConversationId(selectedUser.conversations[0]?.id ?? null);
    }
  }, [selectedUser, selectedConversationId]);

  const selectedConversation = useMemo<IlhaConversation | null>(
    () =>
      selectedUser?.conversations.find((c) => c.id === selectedConversationId) ?? null,
    [selectedUser, selectedConversationId]
  );

  return {
    search,
    setSearch,
    filteredUsers,
    selectedUser,
    selectedUserId,
    setSelectedUserId,
    selectedConversation,
    selectedConversationId,
    setSelectedConversationId,
    tabsCollapsed,
    setTabsCollapsed,
  };
}
```

---

### Task 13: AssistantTransferBadge

**Files:**
- Create: `src/pages/ilha/conversas/components/AssistantTransferBadge.tsx`

- [ ] **Step 1: Criar componente**

```tsx
import { Chip, Box, Typography } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

interface Props {
  assistantName: string | null;
  transferredAt: Date | null;
  variant?: "chip" | "divider";
}

export function AssistantTransferBadge({ assistantName, transferredAt, variant = "chip" }: Props) {
  const label = assistantName ? `Atendente: ${assistantName}` : "Transferido para atendente";
  const time = transferredAt
    ? transferredAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "";

  if (variant === "divider") {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          my: 1.5,
          px: 2,
          "&::before, &::after": {
            content: '""',
            flex: 1,
            height: 1,
            background: "rgba(255,122,1,0.25)",
          },
        }}
      >
        <Chip
          icon={<PersonIcon />}
          label={`${label}${time ? ` · ${time}` : ""}`}
          size="small"
          sx={{
            backgroundColor: "rgba(255,122,1,0.12)",
            color: "#FF7A01",
            fontWeight: 600,
            border: "1px solid rgba(255,122,1,0.4)",
          }}
        />
      </Box>
    );
  }

  return (
    <Chip
      icon={<PersonIcon />}
      label={label}
      size="small"
      sx={{
        backgroundColor: "rgba(255,122,1,0.12)",
        color: "#FF7A01",
        fontWeight: 600,
        border: "1px solid rgba(255,122,1,0.4)",
      }}
    />
  );
}
```

---

### Task 14: ConversationsList

**Files:**
- Create: `src/pages/ilha/conversas/components/ConversationsList.tsx`

- [ ] **Step 1: Criar componente**

```tsx
import { Box, InputBase, List, ListItemButton, Avatar, Typography, Chip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import type { IlhaUser } from "../../types";

interface Props {
  users: IlhaUser[];
  allUsersCount: number;
  search: string;
  onSearchChange: (v: string) => void;
  selectedUserId: string | null;
  onSelect: (id: string) => void;
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

function formatRelativeTime(d: Date): string {
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffMin < 60 * 24) return `${Math.floor(diffMin / 60)}h`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function ConversationsList({
  users,
  allUsersCount,
  search,
  onSearchChange,
  selectedUserId,
  onSelect,
}: Props) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", borderRight: "1px solid", borderColor: "divider" }}>
      <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={700}>Usuários</Typography>
          <Typography variant="caption" color="text.secondary">
            {search ? `${users.length} de ${allUsersCount}` : `${allUsersCount}`}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 0.75, bgcolor: "action.hover", borderRadius: 2 }}>
          <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
          <InputBase
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Pesquisar conversas"
            sx={{ flex: 1, fontSize: 14 }}
            inputProps={{ "aria-label": "pesquisar conversas" }}
          />
        </Box>
      </Box>
      <List sx={{ flex: 1, overflowY: "auto", p: 0 }}>
        {users.map((u) => {
          const latest = u.conversations[0];
          const lastMsg = latest?.messages[latest.messages.length - 1];
          const isActive = u.id === selectedUserId;
          const hasAssistant = latest?.transferredToAssistant;
          return (
            <ListItemButton
              key={u.id}
              selected={isActive}
              onClick={() => onSelect(u.id)}
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: "1px solid",
                borderColor: "divider",
                "&.Mui-selected": {
                  backgroundColor: "rgba(255,122,1,0.08)",
                  "&:hover": { backgroundColor: "rgba(255,122,1,0.12)" },
                },
              }}
            >
              <Avatar sx={{ mr: 1.5, width: 40, height: 40, bgcolor: "#FF7A01" }}>{initials(u.nome)}</Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                  <Typography noWrap fontWeight={600}>{u.nome}</Typography>
                  {lastMsg && (
                    <Typography variant="caption" color="text.secondary">
                      {formatRelativeTime(lastMsg.sentAt)}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.25 }}>
                  <Typography variant="body2" color="text.secondary" noWrap sx={{ flex: 1 }}>
                    {lastMsg?.content ?? u.latestStatus}
                  </Typography>
                  {hasAssistant && <Chip label="ATENDENTE" size="small" sx={{ height: 18, fontSize: 10, bgcolor: "rgba(255,122,1,0.12)", color: "#FF7A01" }} />}
                </Box>
              </Box>
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
```

---

### Task 15: ChatThread

**Files:**
- Create: `src/pages/ilha/conversas/components/ChatThread.tsx`

- [ ] **Step 1: Criar componente**

```tsx
import { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import type { IlhaConversation, IlhaMessage } from "../../types";
import { formatMarkdown } from "../../utils/formatMarkdown";
import { AssistantTransferBadge } from "./AssistantTransferBadge";

interface Props {
  conversation: IlhaConversation | null;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateLabel(d: Date): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (sameDay(d, today)) return "Hoje";
  if (sameDay(d, yesterday)) return "Ontem";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function bubbleStyles(from: IlhaMessage["from"]) {
  if (from === "user") {
    return {
      alignSelf: "flex-start",
      bgcolor: "#FFFFFF",
      borderRadius: "14px 14px 14px 2px",
    };
  }
  if (from === "assistant") {
    return {
      alignSelf: "flex-end",
      bgcolor: "rgba(255,122,1,0.12)",
      borderRadius: "14px 14px 2px 14px",
    };
  }
  return {
    alignSelf: "flex-end",
    bgcolor: "#DCF8C6",
    borderRadius: "14px 14px 2px 14px",
  };
}

export function ChatThread({ conversation }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.id]);

  if (!conversation) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "text.secondary" }}>
        Selecione uma conversa para visualizar as mensagens.
      </Box>
    );
  }

  const items: Array<{ kind: "date"; date: Date } | { kind: "transfer"; at: Date | null; name: string | null } | { kind: "msg"; msg: IlhaMessage }> = [];
  let lastDate: Date | null = null;
  let transferInserted = false;

  for (const msg of conversation.messages) {
    if (!lastDate || !sameDay(lastDate, msg.sentAt)) {
      items.push({ kind: "date", date: msg.sentAt });
      lastDate = msg.sentAt;
    }
    if (
      !transferInserted &&
      conversation.transferredToAssistant &&
      msg.from === "assistant"
    ) {
      items.push({ kind: "transfer", at: conversation.transferredAt, name: conversation.assistantName });
      transferInserted = true;
    }
    items.push({ kind: "msg", msg });
  }

  return (
    <Box
      ref={scrollRef}
      sx={{
        flex: 1,
        overflowY: "auto",
        px: 2,
        py: 1.5,
        display: "flex",
        flexDirection: "column",
        gap: 0.75,
        bgcolor: "#ECE5DD",
      }}
    >
      {items.map((it, i) => {
        if (it.kind === "date") {
          return (
            <Box key={`d-${i}`} sx={{ alignSelf: "center", my: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  px: 1.5,
                  py: 0.25,
                  bgcolor: "rgba(0,0,0,0.08)",
                  borderRadius: 2,
                  fontWeight: 600,
                }}
              >
                {formatDateLabel(it.date)}
              </Typography>
            </Box>
          );
        }
        if (it.kind === "transfer") {
          return (
            <AssistantTransferBadge
              key={`t-${i}`}
              assistantName={it.name}
              transferredAt={it.at}
              variant="divider"
            />
          );
        }
        const m = it.msg;
        const styles = bubbleStyles(m.from);
        return (
          <Box
            key={m.id}
            sx={{
              maxWidth: "72%",
              px: 1.25,
              py: 0.75,
              boxShadow: "0 1px 0.5px rgba(0,0,0,0.13)",
              ...styles,
            }}
          >
            <Box
              dangerouslySetInnerHTML={{ __html: formatMarkdown(m.content) }}
              sx={{
                "& .md-list": { margin: 0, paddingLeft: 2.5 },
                "& strong": { fontWeight: 700 },
                fontSize: 14,
                lineHeight: 1.4,
              }}
            />
            <Typography
              variant="caption"
              sx={{ display: "block", textAlign: "right", color: "rgba(0,0,0,0.45)", mt: 0.25, fontSize: 10 }}
            >
              {m.sentAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
```

---

### Task 16: UserInfoPanel

**Files:**
- Create: `src/pages/ilha/conversas/components/UserInfoPanel.tsx`

- [ ] **Step 1: Criar componente**

```tsx
import { Box, Typography, Avatar, Chip, Divider, Stack } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import type { IlhaUser, IlhaConversation } from "../../types";
import { AssistantTransferBadge } from "./AssistantTransferBadge";

interface Props {
  user: IlhaUser | null;
  conversation: IlhaConversation | null;
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec.toString().padStart(2, "0")}s`;
}

export function UserInfoPanel({ user, conversation }: Props) {
  if (!user) {
    return (
      <Box sx={{ p: 3, color: "text.secondary" }}>
        Nenhum usuário selecionado.
      </Box>
    );
  }
  return (
    <Box sx={{ height: "100%", overflowY: "auto", p: 3, borderLeft: "1px solid", borderColor: "divider" }}>
      <Stack alignItems="center" spacing={1} mb={2}>
        <Avatar sx={{ width: 72, height: 72, bgcolor: "#FF7A01", fontSize: 28 }}>
          {user.nome.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
        </Avatar>
        <Typography fontWeight={700}>{user.nome}</Typography>
        <Typography variant="body2" color="text.secondary">{user.maskedPhone || "Telefone indisponível"}</Typography>
      </Stack>
      <Divider sx={{ my: 2 }} />

      <Typography variant="overline" color="text.secondary">Contexto</Typography>
      <Stack spacing={1} mt={1}>
        <RowLabel label="Lead score" value={String(user.leadScore)} />
        <RowLabel label="Conversas" value={String(user.conversations.length)} />
        <RowLabel label="Status" value={user.latestStatus} />
        {conversation && (
          <>
            <RowLabel label="Início" value={conversation.startedAt.toLocaleString("pt-BR")} />
            <RowLabel label="Duração" value={formatDuration(conversation.duration)} />
            <RowLabel label="Mensagens" value={String(conversation.messages.length)} />
          </>
        )}
      </Stack>

      {conversation?.transferredToAssistant && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="overline" color="text.secondary">Atendente</Typography>
          <Box mt={1}>
            <AssistantTransferBadge
              assistantName={conversation.assistantName}
              transferredAt={conversation.transferredAt}
            />
          </Box>
        </>
      )}

      {conversation && (conversation.topIntents.length > 0 || conversation.topThemes.length > 0) && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="overline" color="text.secondary">Destaques</Typography>
          {conversation.topIntents.length > 0 && (
            <Box mt={1}>
              <Typography variant="caption" color="text.secondary">Intenções</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
                {conversation.topIntents.map((i) => (
                  <Chip key={i} label={i} size="small" />
                ))}
              </Box>
            </Box>
          )}
          {conversation.topThemes.length > 0 && (
            <Box mt={1.5}>
              <Typography variant="caption" color="text.secondary">Temas</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
                {conversation.topThemes.map((t) => (
                  <Chip key={t} label={t} size="small" />
                ))}
              </Box>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

function RowLabel({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={600}>{value}</Typography>
    </Box>
  );
}
```

---

### Task 17: ConversationTabs

**Files:**
- Create: `src/pages/ilha/conversas/components/ConversationTabs.tsx`

- [ ] **Step 1: Criar componente**

```tsx
import { Box, Tabs, Tab, IconButton, Collapse } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { IlhaConversation } from "../../types";

interface Props {
  conversations: IlhaConversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function ConversationTabs({ conversations, selectedId, onSelect, collapsed, onToggleCollapse }: Props) {
  if (conversations.length <= 1) return null;
  const activeLabel =
    conversations.find((c) => c.id === selectedId)?.startedAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) ?? "—";

  return (
    <Box sx={{ borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
      <Box
        onClick={onToggleCollapse}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1,
          cursor: "pointer",
          userSelect: "none",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <IconButton
          size="small"
          sx={{
            transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
            transition: "transform 180ms",
          }}
          aria-label={collapsed ? "expandir conversas" : "recolher conversas"}
        >
          <ExpandMoreIcon fontSize="small" />
        </IconButton>
        <Box sx={{ fontSize: 13, fontWeight: 600, color: "text.secondary" }}>
          {conversations.length} conversas · {activeLabel}
        </Box>
      </Box>
      <Collapse in={!collapsed}>
        <Tabs
          value={selectedId ?? false}
          onChange={(_, v) => onSelect(v)}
          variant="scrollable"
          scrollButtons="auto"
          TabIndicatorProps={{ style: { backgroundColor: "#FF7A01" } }}
        >
          {conversations.map((c) => (
            <Tab
              key={c.id}
              value={c.id}
              label={c.startedAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
              sx={{ minHeight: 44, textTransform: "none", "&.Mui-selected": { color: "#FF7A01" } }}
            />
          ))}
        </Tabs>
      </Collapse>
    </Box>
  );
}
```

---

### Task 18: Página Conversas — montagem

**Files:**
- Modify: `src/pages/ilha/conversas/index.tsx` (substitui stub da Task 10)

- [ ] **Step 1: Substituir pelo componente completo**

```tsx
import { Box, CircularProgress, Typography } from "@mui/material";
import { useIlhaData } from "../hooks/useIlhaData";
import { useChatFilters } from "./hooks/useChatFilters";
import { ConversationsList } from "./components/ConversationsList";
import { ChatThread } from "./components/ChatThread";
import { UserInfoPanel } from "./components/UserInfoPanel";
import { ConversationTabs } from "./components/ConversationTabs";
import { AssistantTransferBadge } from "./components/AssistantTransferBadge";

export default function IlhaConversas() {
  const { data, isLoading, error } = useIlhaData();

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "70vh" }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error || !data) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">Erro ao carregar conversas: {error?.message ?? "sem dados"}</Typography>
      </Box>
    );
  }

  return <ConversasShell users={data.users} />;
}

function ConversasShell({ users }: { users: import("../types").IlhaUser[] }) {
  const {
    search, setSearch,
    filteredUsers,
    selectedUser, selectedUserId, setSelectedUserId,
    selectedConversation, selectedConversationId, setSelectedConversationId,
    tabsCollapsed, setTabsCollapsed,
  } = useChatFilters(users);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "minmax(280px, 340px) minmax(0, 1fr) minmax(280px, 360px)",
        height: "calc(100dvh - 3rem)",
        minHeight: 0,
      }}
    >
      <ConversationsList
        users={filteredUsers}
        allUsersCount={users.length}
        search={search}
        onSearchChange={setSearch}
        selectedUserId={selectedUserId}
        onSelect={setSelectedUserId}
      />

      <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
        {selectedUser && (
          <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography fontWeight={700}>{selectedUser.nome}</Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedUser.maskedPhone || "Telefone indisponível"}
              </Typography>
            </Box>
            {selectedConversation?.transferredToAssistant && (
              <AssistantTransferBadge
                assistantName={selectedConversation.assistantName}
                transferredAt={selectedConversation.transferredAt}
              />
            )}
          </Box>
        )}

        {selectedUser && (
          <ConversationTabs
            conversations={selectedUser.conversations}
            selectedId={selectedConversationId}
            onSelect={setSelectedConversationId}
            collapsed={tabsCollapsed}
            onToggleCollapse={() => setTabsCollapsed(!tabsCollapsed)}
          />
        )}

        <ChatThread conversation={selectedConversation} />
      </Box>

      <UserInfoPanel user={selectedUser} conversation={selectedConversation} />
    </Box>
  );
}
```

- [ ] **Step 2: Testar no navegador**

Run:
```bash
bun run dev
```

Logar como usuário do projeto 9. Navegar para `/ilha/conversas`. Verificar:
- Lista à esquerda com todos os usuários
- Busca filtra em tempo real
- Seleção carrega thread no centro
- Painel direito mostra detalhes + badge de atendente quando aplicável
- Tabs de múltiplas conversas aparecem e colapsam

---

## Phase 4 — ECharts Theme

### Task 19: Tema base ECharts

**Files:**
- Create: `src/pages/ilha/utils/echartsTheme.ts`

- [ ] **Step 1: Criar helper**

```ts
import type { EChartsOption } from "echarts";

export const ILHA_PALETTE = {
  primary: "#FF7A01",
  primarySoft: "rgba(255,122,1,0.18)",
  positive: "#5d9161",
  neutral: "#B0B0B0",
  negative: "#D9534F",
  text: "#2D2D2D",
  subtext: "#666",
  grid: "#E5E5E5",
};

export const baseChartOption = (): Partial<EChartsOption> => ({
  textStyle: {
    fontFamily: "Lato, sans-serif",
    color: ILHA_PALETTE.text,
  },
  grid: {
    top: 24,
    right: 16,
    bottom: 24,
    left: 24,
    containLabel: true,
  },
  tooltip: {
    backgroundColor: "rgba(255,255,255,0.98)",
    borderColor: ILHA_PALETTE.grid,
    borderWidth: 1,
    textStyle: { color: ILHA_PALETTE.text },
    extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-radius: 6px;",
  },
});

export const sentimentColor = (s: "positive" | "neutral" | "negative") =>
  s === "positive" ? ILHA_PALETTE.positive : s === "negative" ? ILHA_PALETTE.negative : ILHA_PALETTE.neutral;
```

---

## Phase 5 — Visão Geral

### Task 20: HeroCard

**Files:**
- Create: `src/pages/ilha/overview/components/HeroCard.tsx`

- [ ] **Step 1: Criar componente**

```tsx
import { Card, CardContent, Typography, Chip, Box } from "@mui/material";
import type { IlhaResumo } from "../../types";

interface Props {
  data: IlhaResumo;
}

export function HeroCard({ data }: Props) {
  const totalUsers = data.users.length;
  return (
    <Card sx={{ bgcolor: "#2A2A2A", color: "white", overflow: "hidden" }}>
      <CardContent sx={{ p: 4 }}>
        <Chip
          label="CONVERSATION INTELLIGENCE"
          size="small"
          sx={{ bgcolor: "rgba(255,122,1,0.15)", color: "#FF7A01", fontWeight: 600, mb: 2 }}
        />
        <Typography variant="h3" fontWeight={700} fontFamily="Lato" mb={1}>
          Visão executiva
        </Typography>
        <Typography variant="h4" fontStyle="italic" color="rgba(255,255,255,0.75)" fontFamily="Lato" mb={3}>
          da jornada do lead.
        </Typography>
        <Typography sx={{ opacity: 0.85, maxWidth: 680 }}>
          {totalUsers} usuário{totalUsers === 1 ? "" : "s"} analisado{totalUsers === 1 ? "" : "s"} · {data.aggregates.totalConversations} conversa{data.aggregates.totalConversations === 1 ? "" : "s"} · {data.aggregates.totalMessages} mensagens.
        </Typography>
        <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
          <Chip label={`${data.aggregates.sentimentDistribution.positive} positivas`} sx={{ bgcolor: "rgba(93,145,97,0.25)", color: "#9ED3A3" }} />
          <Chip label={`${data.aggregates.sentimentDistribution.neutral} neutras`} sx={{ bgcolor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)" }} />
          <Chip label={`${data.aggregates.sentimentDistribution.negative} negativas`} sx={{ bgcolor: "rgba(217,83,79,0.25)", color: "#F0A2A0" }} />
        </Box>
      </CardContent>
    </Card>
  );
}
```

---

### Task 21: LeadScoreRing

**Files:**
- Create: `src/pages/ilha/overview/components/LeadScoreRing.tsx`

- [ ] **Step 1: Criar componente**

```tsx
import ReactECharts from "echarts-for-react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { ILHA_PALETTE, baseChartOption } from "../../utils/echartsTheme";
import type { IlhaResumo } from "../../types";

interface Props {
  data: IlhaResumo;
}

export function LeadScoreRing({ data }: Props) {
  const avgScore = data.users.length > 0 ? Math.round(data.users.reduce((s, u) => s + u.leadScore, 0) / data.users.length) : 0;

  const option = {
    ...baseChartOption(),
    series: [{
      type: "gauge",
      startAngle: 230,
      endAngle: -50,
      min: 0,
      max: 100,
      progress: { show: true, width: 18, itemStyle: { color: ILHA_PALETTE.primary } },
      axisLine: { lineStyle: { width: 18, color: [[1, ILHA_PALETTE.grid]] } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      pointer: { show: false },
      anchor: { show: false },
      detail: {
        valueAnimation: true,
        fontSize: 36,
        fontWeight: 700,
        color: ILHA_PALETTE.primary,
        offsetCenter: [0, 0],
        formatter: "{value}",
      },
      data: [{ value: avgScore }],
    }],
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">LEAD SCORE</Typography>
        <Typography variant="h6" fontWeight={700} mb={1}>Score médio</Typography>
        <Box sx={{ height: 220 }}>
          <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
        </Box>
        <Typography variant="caption" color="text.secondary">
          Score médio dos {data.users.length} usuário{data.users.length === 1 ? "" : "s"} analisados.
        </Typography>
      </CardContent>
    </Card>
  );
}
```

---

### Task 22: ConversionFunnel

**Files:**
- Create: `src/pages/ilha/overview/components/ConversionFunnel.tsx`

- [ ] **Step 1: Criar componente**

```tsx
import ReactECharts from "echarts-for-react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { ILHA_PALETTE, baseChartOption } from "../../utils/echartsTheme";
import type { IlhaResumo } from "../../types";

interface Props {
  data: IlhaResumo;
}

export function ConversionFunnel({ data }: Props) {
  const option = {
    ...baseChartOption(),
    color: [ILHA_PALETTE.primary],
    tooltip: { trigger: "item", formatter: "{b}: {c}" },
    series: [{
      name: "Funil",
      type: "funnel",
      left: "10%",
      right: "10%",
      top: 20,
      bottom: 10,
      minSize: "20%",
      sort: "descending",
      gap: 4,
      label: { show: true, position: "inside", color: "#fff", fontWeight: 600 },
      itemStyle: { borderColor: "#fff", borderWidth: 2 },
      data: data.aggregates.funnel.map((f, i) => ({
        value: f.count,
        name: f.label,
        itemStyle: { color: `rgba(255,122,1,${1 - i * 0.18})` },
      })),
    }],
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">01 — PIPELINE</Typography>
        <Typography variant="h6" fontWeight={700} mb={1}>Funil de conversão</Typography>
        <Box sx={{ height: 320 }}>
          <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
        </Box>
      </CardContent>
    </Card>
  );
}
```

---

### Task 23: Página Visão Geral — montagem

**Files:**
- Modify: `src/pages/ilha/overview/index.tsx`

- [ ] **Step 1: Substituir stub**

```tsx
import { Box, CircularProgress, Typography, Grid } from "@mui/material";
import { useIlhaData } from "../hooks/useIlhaData";
import { HeroCard } from "./components/HeroCard";
import { LeadScoreRing } from "./components/LeadScoreRing";
import { ConversionFunnel } from "./components/ConversionFunnel";

export default function IlhaOverview() {
  const { data, isLoading, error } = useIlhaData();

  if (isLoading) {
    return <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}><CircularProgress /></Box>;
  }
  if (error || !data) {
    return <Typography color="error" sx={{ p: 4 }}>Erro: {error?.message}</Typography>;
  }
  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}><HeroCard data={data} /></Grid>
        <Grid item xs={12} md={4}><LeadScoreRing data={data} /></Grid>
        <Grid item xs={12}><ConversionFunnel data={data} /></Grid>
      </Grid>
    </Box>
  );
}
```

- [ ] **Step 2: Validar no navegador**

Run: `bun run dev`. Navegar para `/ilha/visao-geral`. Verificar: hero escuro + gauge com score médio + funil com 4 etapas.

---

## Phase 6 — Análises

### Task 24: TopIntentsBars e TopThemesBars

**Files:**
- Create: `src/pages/ilha/analytics/components/HorizontalBars.tsx` (componente reusável)
- Create: `src/pages/ilha/analytics/components/TopIntentsBars.tsx`
- Create: `src/pages/ilha/analytics/components/TopThemesBars.tsx`

- [ ] **Step 1: Criar componente genérico reusável**

`HorizontalBars.tsx`:
```tsx
import ReactECharts from "echarts-for-react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { ILHA_PALETTE, baseChartOption } from "../../utils/echartsTheme";

interface Props {
  kicker: string;
  title: string;
  items: { label: string; count: number }[];
  max?: number;
}

export function HorizontalBars({ kicker, title, items, max = 8 }: Props) {
  const top = items.slice(0, max);
  const option = {
    ...baseChartOption(),
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    xAxis: { type: "value", axisLine: { show: false }, splitLine: { lineStyle: { color: ILHA_PALETTE.grid } } },
    yAxis: { type: "category", data: top.map((i) => i.label).reverse(), axisTick: { show: false } },
    series: [{
      type: "bar",
      data: top.map((i) => i.count).reverse(),
      itemStyle: { color: ILHA_PALETTE.primary, borderRadius: [0, 4, 4, 0] },
      label: { show: true, position: "right", color: ILHA_PALETTE.text },
    }],
  };
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">{kicker}</Typography>
        <Typography variant="h6" fontWeight={700} mb={1}>{title}</Typography>
        <Box sx={{ height: 32 * top.length + 40 }}>
          <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
        </Box>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Criar wrappers específicos**

`TopIntentsBars.tsx`:
```tsx
import { HorizontalBars } from "./HorizontalBars";
import type { IlhaResumo } from "../../types";
export function TopIntentsBars({ data }: { data: IlhaResumo }) {
  return <HorizontalBars kicker="02 — CLASSIFICAÇÃO" title="Top intenções" items={data.aggregates.intentDistribution} />;
}
```

`TopThemesBars.tsx`:
```tsx
import { HorizontalBars } from "./HorizontalBars";
import type { IlhaResumo } from "../../types";
export function TopThemesBars({ data }: { data: IlhaResumo }) {
  return <HorizontalBars kicker="03 — CLASSIFICAÇÃO" title="Top temas" items={data.aggregates.themeDistribution} />;
}
```

---

### Task 25: SentimentDonut

**Files:**
- Create: `src/pages/ilha/analytics/components/SentimentDonut.tsx`

- [ ] **Step 1: Criar componente**

```tsx
import ReactECharts from "echarts-for-react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { ILHA_PALETTE, baseChartOption } from "../../utils/echartsTheme";
import type { IlhaResumo } from "../../types";

export function SentimentDonut({ data }: { data: IlhaResumo }) {
  const d = data.aggregates.sentimentDistribution;
  const total = d.positive + d.neutral + d.negative;
  const option = {
    ...baseChartOption(),
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    series: [{
      type: "pie",
      radius: ["55%", "80%"],
      avoidLabelOverlap: true,
      label: { show: false },
      itemStyle: { borderColor: "#fff", borderWidth: 2 },
      data: [
        { value: d.positive, name: "Positivas", itemStyle: { color: ILHA_PALETTE.positive } },
        { value: d.neutral, name: "Neutras", itemStyle: { color: ILHA_PALETTE.neutral } },
        { value: d.negative, name: "Negativas", itemStyle: { color: ILHA_PALETTE.negative } },
      ],
    }],
    graphic: {
      type: "text",
      left: "center",
      top: "center",
      style: { text: `${total}\nmensagens`, textAlign: "center", fill: ILHA_PALETTE.text, font: "700 18px Lato" },
    },
  };
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">04 — QUALITATIVO</Typography>
        <Typography variant="h6" fontWeight={700} mb={1}>Análise de sentimento</Typography>
        <Box sx={{ height: 280 }}>
          <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
        </Box>
      </CardContent>
    </Card>
  );
}
```

---

### Task 26: SentimentTrack

**Files:**
- Create: `src/pages/ilha/analytics/components/SentimentTrack.tsx`

- [ ] **Step 1: Criar componente CSS puro**

```tsx
import { Box, Typography } from "@mui/material";
import { ILHA_PALETTE } from "../../utils/echartsTheme";
import type { IlhaResumo } from "../../types";

export function SentimentTrack({ data }: { data: IlhaResumo }) {
  const d = data.aggregates.sentimentDistribution;
  const total = d.positive + d.neutral + d.negative || 1;
  const pct = (n: number) => `${(n / total) * 100}%`;
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">Distribuição</Typography>
      <Box sx={{ display: "flex", mt: 0.5, height: 10, borderRadius: 5, overflow: "hidden", bgcolor: ILHA_PALETTE.grid }}>
        <Box sx={{ width: pct(d.positive), bgcolor: ILHA_PALETTE.positive }} />
        <Box sx={{ width: pct(d.neutral), bgcolor: ILHA_PALETTE.neutral }} />
        <Box sx={{ width: pct(d.negative), bgcolor: ILHA_PALETTE.negative }} />
      </Box>
    </Box>
  );
}
```

---

### Task 27: BotPerformance

**Files:**
- Create: `src/pages/ilha/analytics/components/BotPerformance.tsx`

- [ ] **Step 1: Criar componente**

```tsx
import { Card, CardContent, Typography, Box, Grid } from "@mui/material";
import type { IlhaResumo } from "../../types";

function formatMs(ms: number): string {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

export function BotPerformance({ data }: { data: IlhaResumo }) {
  const totalConvs = data.aggregates.totalConversations;
  const transfers = data.users.flatMap((u) => u.conversations).filter((c) => c.transferredToAssistant).length;
  const autoResolutionRate = totalConvs > 0 ? Math.round(((totalConvs - transfers) / totalConvs) * 100) : 0;

  const metrics = [
    { label: "Conversas", value: String(totalConvs) },
    { label: "Mensagens", value: String(data.aggregates.totalMessages) },
    { label: "Duração média", value: formatMs(data.aggregates.averageDuration) },
    { label: "Resolução automática", value: `${autoResolutionRate}%` },
    { label: "Transferências", value: String(transfers) },
  ];

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">05 — OPERAÇÃO</Typography>
        <Typography variant="h6" fontWeight={700} mb={2}>Performance do bot</Typography>
        <Grid container spacing={2}>
          {metrics.map((m) => (
            <Grid item xs={6} sm={4} key={m.label}>
              <Box sx={{ p: 1.5, bgcolor: "action.hover", borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">{m.label}</Typography>
                <Typography variant="h6" fontWeight={700}>{m.value}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
```

---

### Task 28: ThemeIntentMatrix

**Files:**
- Create: `src/pages/ilha/analytics/components/ThemeIntentMatrix.tsx`

- [ ] **Step 1: Criar heatmap**

```tsx
import ReactECharts from "echarts-for-react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { ILHA_PALETTE, baseChartOption } from "../../utils/echartsTheme";
import type { IlhaResumo } from "../../types";

export function ThemeIntentMatrix({ data }: { data: IlhaResumo }) {
  const matrix = data.aggregates.themeIntentMatrix;
  const themes = Array.from(new Set(matrix.map(([t]) => t)));
  const intents = Array.from(new Set(matrix.map(([, i]) => i)));
  const maxVal = matrix.reduce((m, [, , v]) => Math.max(m, v), 0);

  const option = {
    ...baseChartOption(),
    tooltip: { position: "top", formatter: (p: any) => `${themes[p.value[1]]} × ${intents[p.value[0]]}: ${p.value[2]}` },
    grid: { top: 40, left: 100, right: 20, bottom: 60, containLabel: false },
    xAxis: { type: "category", data: intents, splitArea: { show: true }, axisLabel: { rotate: 30 } },
    yAxis: { type: "category", data: themes, splitArea: { show: true } },
    visualMap: {
      min: 0,
      max: maxVal,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: 5,
      inRange: { color: ["#FFE8D4", ILHA_PALETTE.primary] },
    },
    series: [{
      name: "Ocorrências",
      type: "heatmap",
      data: matrix.map(([theme, intent, v]) => [intents.indexOf(intent), themes.indexOf(theme), v]),
      label: { show: true },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.5)" } },
    }],
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="overline" color="text.secondary">06 — CRUZAMENTO</Typography>
        <Typography variant="h6" fontWeight={700} mb={1}>Tema × intenção</Typography>
        <Box sx={{ height: 40 * Math.max(themes.length, 3) + 100 }}>
          <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
        </Box>
      </CardContent>
    </Card>
  );
}
```

---

### Task 29: Página Análises — montagem

**Files:**
- Modify: `src/pages/ilha/analytics/index.tsx`

- [ ] **Step 1: Substituir stub**

```tsx
import { Box, CircularProgress, Typography, Grid } from "@mui/material";
import { useIlhaData } from "../hooks/useIlhaData";
import { TopIntentsBars } from "./components/TopIntentsBars";
import { TopThemesBars } from "./components/TopThemesBars";
import { SentimentDonut } from "./components/SentimentDonut";
import { SentimentTrack } from "./components/SentimentTrack";
import { BotPerformance } from "./components/BotPerformance";
import { ThemeIntentMatrix } from "./components/ThemeIntentMatrix";

export default function IlhaAnalytics() {
  const { data, isLoading, error } = useIlhaData();
  if (isLoading) return <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}><CircularProgress /></Box>;
  if (error || !data) return <Typography color="error" sx={{ p: 4 }}>Erro: {error?.message}</Typography>;
  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}><TopIntentsBars data={data} /></Grid>
        <Grid item xs={12} md={6}><TopThemesBars data={data} /></Grid>
        <Grid item xs={12} md={7}>
          <SentimentDonut data={data} />
          <Box sx={{ mt: 2 }}><SentimentTrack data={data} /></Box>
        </Grid>
        <Grid item xs={12} md={5}><BotPerformance data={data} /></Grid>
        <Grid item xs={12}><ThemeIntentMatrix data={data} /></Grid>
      </Grid>
    </Box>
  );
}
```

- [ ] **Step 2: Validar no navegador**

`bun run dev` → `/ilha/analises`. Verificar os 5 cards + matriz.

---

## Phase 7 — Insights

### Task 30: InsightsList

**Files:**
- Create: `src/pages/ilha/insights/components/InsightsList.tsx`

- [ ] **Step 1: Criar gerador de insights + lista**

```tsx
import { Card, CardContent, Typography, Box, Stack } from "@mui/material";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import { ILHA_PALETTE } from "../../utils/echartsTheme";
import type { IlhaResumo } from "../../types";

function generateInsights(data: IlhaResumo): { title: string; body: string }[] {
  const out: { title: string; body: string }[] = [];
  const d = data.aggregates.sentimentDistribution;
  const total = d.positive + d.neutral + d.negative || 1;
  const positivePct = Math.round((d.positive / total) * 100);
  const negativePct = Math.round((d.negative / total) * 100);
  out.push({
    title: "Tom predominante",
    body: `${positivePct}% das mensagens são positivas, ${negativePct}% negativas. ${positivePct > 60 ? "Operação saudável." : "Atenção a focos negativos."}`,
  });

  const topIntent = data.aggregates.intentDistribution[0];
  if (topIntent) {
    out.push({
      title: "Intenção mais frequente",
      body: `"${topIntent.label}" aparece em ${topIntent.count} mensagens. Vale automatizar resposta específica se ainda não houver.`,
    });
  }

  const transfers = data.users.flatMap((u) => u.conversations).filter((c) => c.transferredToAssistant).length;
  if (transfers > 0) {
    out.push({
      title: "Transferências para atendente",
      body: `${transfers} conversa${transfers === 1 ? "" : "s"} escalaram para atendente humano. Investigar padrão comum nos gatilhos.`,
    });
  }
  return out;
}

export function InsightsList({ data }: { data: IlhaResumo }) {
  const items = generateInsights(data);
  return (
    <Card>
      <CardContent>
        <Typography variant="overline" color="text.secondary">07 — LEITURAS</Typography>
        <Typography variant="h6" fontWeight={700} mb={2}>Insights automáticos</Typography>
        <Stack spacing={2}>
          {items.map((it, i) => (
            <Box key={i} sx={{ display: "flex", gap: 1.5, p: 2, bgcolor: "action.hover", borderRadius: 1, borderLeft: `3px solid ${ILHA_PALETTE.primary}` }}>
              <LightbulbIcon sx={{ color: ILHA_PALETTE.primary, mt: 0.25 }} />
              <Box>
                <Typography fontWeight={700} mb={0.25}>{it.title}</Typography>
                <Typography variant="body2" color="text.secondary">{it.body}</Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
```

---

### Task 31: JourneyTimeline

**Files:**
- Create: `src/pages/ilha/insights/components/JourneyTimeline.tsx`

- [ ] **Step 1: Criar timeline CSS**

```tsx
import { Card, CardContent, Typography, Box, Stack, Avatar } from "@mui/material";
import { ILHA_PALETTE } from "../../utils/echartsTheme";
import type { IlhaResumo } from "../../types";

function formatStart(d: Date): string {
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function JourneyTimeline({ data }: { data: IlhaResumo }) {
  const latest = data.users
    .flatMap((u) => u.conversations.map((c) => ({ u, c })))
    .sort((a, b) => b.c.startedAt.getTime() - a.c.startedAt.getTime())
    .slice(0, 6);

  return (
    <Card>
      <CardContent>
        <Typography variant="overline" color="text.secondary">08 — NARRATIVA</Typography>
        <Typography variant="h6" fontWeight={700} mb={2}>Jornada do usuário</Typography>
        <Stack spacing={0}>
          {latest.map(({ u, c }, i) => (
            <Box key={c.id} sx={{ display: "flex", gap: 2 }}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Avatar sx={{ width: 12, height: 12, bgcolor: ILHA_PALETTE.primary, mt: 1 }}>{""}</Avatar>
                {i < latest.length - 1 && <Box sx={{ width: 2, flex: 1, bgcolor: ILHA_PALETTE.grid, my: 0.5 }} />}
              </Box>
              <Box sx={{ flex: 1, pb: 2 }}>
                <Typography variant="caption" color="text.secondary">{formatStart(c.startedAt)}</Typography>
                <Typography fontWeight={600}>{u.nome}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {c.messages.length} mensagens · {c.transferredToAssistant ? "Transferida" : "Auto-resolvida"}
                  {c.topIntents.length > 0 && ` · ${c.topIntents.slice(0, 2).join(", ")}`}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
```

---

### Task 32: Página Insights — montagem

**Files:**
- Modify: `src/pages/ilha/insights/index.tsx`

- [ ] **Step 1: Substituir stub**

```tsx
import { Box, CircularProgress, Typography, Stack } from "@mui/material";
import { useIlhaData } from "../hooks/useIlhaData";
import { InsightsList } from "./components/InsightsList";
import { JourneyTimeline } from "./components/JourneyTimeline";

export default function IlhaInsights() {
  const { data, isLoading, error } = useIlhaData();
  if (isLoading) return <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}><CircularProgress /></Box>;
  if (error || !data) return <Typography color="error" sx={{ p: 4 }}>Erro: {error?.message}</Typography>;
  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <InsightsList data={data} />
        <JourneyTimeline data={data} />
      </Stack>
    </Box>
  );
}
```

- [ ] **Step 2: Validar no navegador**

`bun run dev` → `/ilha/insights`. Verificar a lista de insights e a timeline.

---

## Phase 8 — Smoke test end-to-end

### Task 33: Validação manual completa

- [ ] **Step 1: Login como usuário do projeto 9 (Ilha)**

Logar na UI. Conferir que o sidebar mostra o grupo "ILHA" com 4 itens.

- [ ] **Step 2: Percorrer as 4 rotas**

- `/ilha/visao-geral` — Hero + Gauge + Funil renderizados
- `/ilha/analises` — 6 cards (2 barras, donut, track, performance, heatmap)
- `/ilha/insights` — lista de insights + timeline
- `/ilha/conversas` — 3 colunas, busca funcionando, seleção funcionando, badge de atendente visível quando aplicável

- [ ] **Step 3: Logar em outro projeto**

Trocar para um usuário cujo `projeto.id !== 9`. Conferir:
- Sidebar não mostra o grupo "ILHA"
- Acesso direto a `/ilha/conversas` redireciona para `/home`

- [ ] **Step 4: Verificar cache compartilhado**

Navegar rapidamente entre as 4 rotas e conferir no DevTools (Network) que há **apenas 1 chamada** ao webhook `get-data` (useQuery compartilha cache).

---

## Open questions & notas

1. **Formato real da resposta do webhook:** o normalizer suporta 2 formatos (array de 5 tabelas ou objeto chaveado). Se em produção vier em um 3º formato, adaptar `coerceTables` em `src/pages/ilha/utils/normalize.ts`.
2. **ItemMenu usa `<a href>`:** navegação dispara reload. Para SPA nav em nav lateral, fazer refactor separado (fora deste plano).
3. **Zero testes para UI:** spec confirmou que só `normalize` tem teste unitário. UI validada manualmente.

---

## Self-review

**Cobertura da spec:**
- §2 rotas e gate: Task 9, 10, 11 ✓
- §3 estrutura de arquivos: todas as tasks seguem a estrutura declarada ✓
- §4 dados (types, service, normalize, useQuery): Tasks 3–7 ✓
- §5 transferência p/ assistente: Tasks 5 (normalize), 13 (badge), 15 (divider inline), 16 (panel info) ✓
- §6 gráficos ECharts: Task 1 (install), 19 (theme), 21–22, 24–25, 28 ✓
- §7 conversas layout: Tasks 12, 14, 15, 16, 17, 18 ✓
- §8 navegação sidebar: Task 11 ✓
- §9 estilo: aplicado em cada componente ✓
- §10 testes mínimos: Task 4 (normalize.test.ts) ✓

**Placeholder scan:** nenhum "TBD", "add error handling" sem detalhe, ou referência a componente indefinido.

**Type consistency:** `IlhaUser.id: string`, `IlhaConversation.id: string` consistentes entre `types.ts`, `normalize.ts` e componentes. `IlhaResumo.aggregates.themeIntentMatrix` como `Array<[string, string, number]>` consumido corretamente em `ThemeIntentMatrix.tsx`.

**Policy:** Nenhum step de `git commit` (respeitando diretiva do usuário).
