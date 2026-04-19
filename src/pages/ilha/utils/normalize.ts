import type {
  IlhaConversation,
  IlhaEvent,
  IlhaKpi,
  IlhaMessage,
  IlhaResumo,
  IlhaResumoRaw,
  IlhaUser,
  Insight,
  LeadScoreDetail,
} from "../types";
import {
  calculateLeadScore,
  computeConversationAnalytics,
  computeInsights,
  tally,
} from "./analytics";
import { formatPercent, maskPhone, normalizeText, titleize } from "./textHelpers";

type RawTables = {
  conversations: any[];
  events: any[];
  sessions: any[];
  users: any[];
  chat_messages: any[];
};

type FlatEvent = {
  id: string;
  user_id: string;
  tipo: string;
  descricao?: string;
  metadata?: Record<string, any> | null;
  created_at: string;
};

function looksLikeFlatEvent(e: unknown): boolean {
  return (
    e !== null &&
    typeof e === "object" &&
    "user_id" in (e as object) &&
    "tipo" in (e as object) &&
    "created_at" in (e as object)
  );
}

function isFlatEventsArray(raw: unknown): raw is FlatEvent[] {
  if (!Array.isArray(raw) || raw.length === 0) return false;
  const sampleSize = Math.min(raw.length, 5);
  let matches = 0;
  for (let i = 0; i < sampleSize; i++) {
    if (looksLikeFlatEvent(raw[i])) matches++;
  }
  return matches >= Math.ceil(sampleSize / 2);
}

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
    "Resposta do webhook em formato não reconhecido. Esperado array de 5 tabelas, objeto com {conversations, events, sessions, users, chat_messages}, ou array plano de eventos.",
  );
}

function toDate(v: unknown): Date {
  return v ? new Date(String(v)) : new Date(0);
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

const SENTIMENT_MAP: Record<string, "positive" | "neutral" | "negative"> = {
  positivo: "positive",
  positive: "positive",
  neutro: "neutral",
  neutral: "neutral",
  negativo: "negative",
  negative: "negative",
};

function extractName(events: FlatEvent[]): string {
  for (const e of events) {
    if (e.tipo !== "mensagem_processada") continue;
    const resposta = pickString(e.metadata?.resposta);
    const match = resposta.match(/(?:Oi|Olá|Olá,|Oi,)[,!\s]+([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*)/);
    if (match && match[1]) {
      const name = match[1].trim();
      if (
        !/^(tudo|bem|boa|obrigad|como|posso|aqui|seja|vind|sou|meu|muito|prazer|entao|então|vamos|ok)/i.test(
          name,
        )
      ) {
        return name;
      }
    }
  }
  return "Sem nome";
}

function extractPhone(events: FlatEvent[]): string {
  for (const e of events) {
    const meta = e.metadata ?? {};
    const candidates = [meta.telefone, meta.phone, meta.numero, meta.whatsapp];
    for (const c of candidates) {
      if (typeof c === "string" && c.replace(/\D/g, "").length >= 8) return c;
    }
  }
  return "";
}

function buildConversationFromEvents(
  userEvents: FlatEvent[],
  convId: string,
  startedAt: Date,
): IlhaConversation {
  const messages: IlhaMessage[] = [];
  const ilhaEvents: IlhaEvent[] = [];
  let lastUserBacklog = "";
  const duplicateTimestamps = new Set<number>();

  const sorted = [...userEvents].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  for (const e of sorted) {
    const createdAt = new Date(e.created_at);
    const meta = e.metadata ?? {};
    if (e.tipo === "mensagem_recebida") {
      const full = pickString(meta.mensagem);
      if (e.descricao === "conversa_iniciada") {
        const lines = full.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
        lines.forEach((line, i) => {
          messages.push({
            id: `${e.id}-${i}`,
            conversationId: convId,
            from: "user",
            content: line,
            sentAt: new Date(createdAt.getTime() + i),
          });
        });
        lastUserBacklog = full;
        continue;
      }
      let newPart = "";
      const isDuplicate = full === lastUserBacklog;
      if (full.startsWith(lastUserBacklog) && full.length > lastUserBacklog.length) {
        newPart = full.slice(lastUserBacklog.length).replace(/^\n+/, "").trim();
      } else if (!isDuplicate) {
        const lines = full.split("\n");
        newPart = (lines[lines.length - 1] ?? "").trim();
      }
      lastUserBacklog = full;
      if (!newPart) {
        if (isDuplicate) duplicateTimestamps.add(createdAt.getTime());
        continue;
      }
      const last = messages[messages.length - 1];
      if (last && last.from === "user" && last.content === newPart) continue;
      messages.push({
        id: e.id,
        conversationId: convId,
        from: "user",
        content: newPart,
        sentAt: createdAt,
      });
    } else if (e.tipo === "mensagem_processada") {
      const resposta = pickString(meta.resposta);
      if (!resposta) continue;
      const sent = pickString(meta.sentimento, "neutro");
      messages.push({
        id: e.id,
        conversationId: convId,
        from: "bot",
        content: resposta,
        sentAt: createdAt,
        intent: pickString(meta.intencao) || undefined,
        theme: pickString(meta.tema) || undefined,
        sentiment: SENTIMENT_MAP[sent] ?? "neutral",
      });
    } else if (e.tipo === "transferencia_humano") {
      ilhaEvents.push({
        id: e.id,
        conversationId: convId,
        type: "transfer",
        payload: (meta as Record<string, unknown>) ?? {},
        occurredAt: createdAt,
      });
    }
  }

  messages.sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());

  const markedMessages: IlhaMessage[] = messages.map((m) =>
    m.from === "user" && duplicateTimestamps.has(m.sentAt.getTime())
      ? { ...m, isDuplicate: true }
      : m,
  );

  const transferEvt = ilhaEvents.find((ev) => ev.type === "transfer");
  const transferredToAssistant = Boolean(transferEvt);
  const transferredAt = transferEvt?.occurredAt ?? null;
  const assistantName =
    (transferEvt?.payload as any)?.automacao?.agente ??
    (transferEvt?.payload as any)?.assistant_name ??
    null;

  const intents = tally(markedMessages.map((m) => m.intent));
  const themes = tally(markedMessages.map((m) => m.theme));
  const sentimentBreakdown = {
    positive: markedMessages.filter((m) => m.sentiment === "positive").length,
    neutral: markedMessages.filter((m) => m.sentiment === "neutral").length,
    negative: markedMessages.filter((m) => m.sentiment === "negative").length,
  };

  const endedAt = markedMessages.length > 0 ? markedMessages[markedMessages.length - 1].sentAt : null;
  const duration = endedAt ? endedAt.getTime() - startedAt.getTime() : 0;

  const analytics = computeConversationAnalytics(
    {
      id: convId,
      startedAt,
      endedAt,
      duration,
      transferredToAssistant,
      transferredAt,
      assistantName,
      messages: markedMessages,
      events: ilhaEvents,
      sentimentBreakdown,
      topIntents: topN(intents),
      topThemes: topN(themes),
    } as IlhaConversation,
    sorted,
  );

  return {
    id: convId,
    startedAt,
    endedAt,
    duration,
    transferredToAssistant,
    transferredAt,
    assistantName,
    messages: markedMessages,
    events: ilhaEvents,
    sentimentBreakdown,
    topIntents: topN(intents),
    topThemes: topN(themes),
    responsePairs: analytics.responsePairs,
    duplicateInputsCount: analytics.duplicateInputsCount,
    receivedCount: analytics.receivedCount,
    processedCount: analytics.processedCount,
    stages: analytics.stages,
    dominantTheme: analytics.dominantTheme,
    dominantIntent: analytics.dominantIntent,
    dominantSentiment: analytics.dominantSentiment,
    askedDateCount: analytics.askedDateCount,
    totalEventsCount: analytics.totalEventsCount,
  };
}

function computeUserLeadScore(
  conversations: IlhaConversation[],
  rawEventsByConv: FlatEvent[][],
): LeadScoreDetail {
  const allUserInputs: string[] = [];
  const allThemes = new Set<string>();
  const allIntents = new Set<string>();
  let hasTransfer = false;

  conversations.forEach((conv, idx) => {
    if (conv.transferredToAssistant) hasTransfer = true;
    conv.messages
      .filter((m) => m.theme)
      .forEach((m) => allThemes.add(normalizeText(m.theme)));
    conv.messages
      .filter((m) => m.intent)
      .forEach((m) => allIntents.add(normalizeText(m.intent)));
    const flatEvents = rawEventsByConv[idx] ?? [];
    for (const e of flatEvents) {
      if (e.tipo === "mensagem_recebida") {
        const msg = String(e.metadata?.mensagem ?? "");
        if (msg) allUserInputs.push(msg);
      }
    }
  });

  return calculateLeadScore({
    themes: allThemes,
    intents: allIntents,
    userInputs: allUserInputs.join(" "),
    hasTransfer,
  });
}

function buildKpis(users: IlhaUser[], convs: IlhaConversation[]): IlhaKpi[] {
  const totalMessages = convs.reduce((a, c) => a + c.messages.length, 0);
  const returningUsers = users.filter((u) => u.conversations.length > 1).length;
  const qualified = users.filter((u) => u.leadScore.qualified).length;
  const transferred = convs.filter((c) => c.transferredToAssistant).length;

  return [
    { label: "Usuários", value: String(users.length), rawValue: users.length },
    { label: "Conversas", value: String(convs.length), rawValue: convs.length },
    { label: "Mensagens", value: String(totalMessages), rawValue: totalMessages },
    {
      label: "Retorno",
      value: formatPercent(returningUsers, users.length),
      rawValue: users.length > 0 ? returningUsers / users.length : 0,
      hint: `${returningUsers} de ${users.length}`,
    },
    {
      label: "Leads qualificados",
      value: String(qualified),
      rawValue: qualified,
      hint: `score ≥ 70 em ${users.length}`,
    },
    {
      label: "Transferências",
      value: String(transferred),
      rawValue: transferred,
      hint: "para atendimento humano",
    },
  ];
}

function buildGlobalInsights(users: IlhaUser[], convs: IlhaConversation[]): Insight[] {
  const all: Insight[] = [];
  const seenByTone = new Map<string, number>();

  for (const user of users) {
    const primary = user.conversations[0];
    if (!primary) continue;
    const perUser = computeInsights({
      leadScore: user.leadScore,
      duplicateInputs: primary.duplicateInputsCount,
      receivedInputs: primary.receivedCount,
      askedDateCount: primary.askedDateCount,
      dominantTheme: primary.dominantTheme,
      returnGapMs: user.returnGapMs,
      hasMultipleConversations: user.conversations.length > 1,
    });
    for (const insight of perUser) {
      const count = (seenByTone.get(insight.id) ?? 0) + 1;
      seenByTone.set(insight.id, count);
      all.push({
        ...insight,
        id: `${insight.id}-${user.id}`,
        title: users.length > 1 ? `${insight.title} — ${user.nome}` : insight.title,
      });
    }
  }

  if (convs.length === 0) return all;
  return all.slice(0, 12);
}

function buildPerformanceMetrics(convs: IlhaConversation[]): {
  avgResponseSeconds: number;
  resolvedByBotPercent: number;
  transferredPercent: number;
  duplicatesPercent: number;
  performanceByTheme: Array<{ theme: string; avgSeconds: number; count: number }>;
} {
  const allPairs = convs.flatMap((c) => c.responsePairs);
  const avgResponseSeconds =
    allPairs.length > 0
      ? allPairs.reduce((a, p) => a + p.seconds, 0) / allPairs.length
      : 0;

  const totalConvs = convs.length;
  const transferred = convs.filter((c) => c.transferredToAssistant).length;
  const transferredPercent = totalConvs > 0 ? (transferred / totalConvs) * 100 : 0;
  const resolvedByBotPercent = 100 - transferredPercent;

  const totalReceived = convs.reduce((a, c) => a + c.receivedCount, 0);
  const totalDuplicates = convs.reduce((a, c) => a + c.duplicateInputsCount, 0);
  const duplicatesPercent = totalReceived > 0 ? (totalDuplicates / totalReceived) * 100 : 0;

  const byTheme = new Map<string, { total: number; count: number }>();
  for (const pair of allPairs) {
    const label = pair.theme || "Sem tema";
    const cur = byTheme.get(label) ?? { total: 0, count: 0 };
    cur.total += pair.seconds;
    cur.count += 1;
    byTheme.set(label, cur);
  }
  const performanceByTheme = Array.from(byTheme.entries())
    .map(([theme, v]) => ({
      theme,
      avgSeconds: v.count > 0 ? v.total / v.count : 0,
      count: v.count,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    avgResponseSeconds,
    resolvedByBotPercent,
    transferredPercent,
    duplicatesPercent,
    performanceByTheme,
  };
}

function normalizeFlatEvents(raw: FlatEvent[]): IlhaResumo {
  const events = raw
    .filter(looksLikeFlatEvent)
    .sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  const byUser = new Map<string, FlatEvent[]>();
  for (const e of events) {
    const arr = byUser.get(e.user_id) ?? [];
    arr.push(e);
    byUser.set(e.user_id, arr);
  }

  const ilhaUsers: IlhaUser[] = [];
  for (const [userId, userEvents] of byUser) {
    const convBuckets: FlatEvent[][] = [];
    let current: FlatEvent[] = [];
    for (const e of userEvents) {
      if (e.descricao === "conversa_iniciada" && current.length > 0) {
        convBuckets.push(current);
        current = [];
      }
      current.push(e);
    }
    if (current.length > 0) convBuckets.push(current);

    const conversations: IlhaConversation[] = convBuckets.map((bucket, idx) => {
      const startedAt = new Date(bucket[0].created_at);
      return buildConversationFromEvents(bucket, `${userId}-${idx}`, startedAt);
    });
    conversations.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());

    // Map each sorted conversation back to its raw bucket (order inverted above)
    const bucketIndexByConvId = new Map<string, number>();
    convBuckets.forEach((_, idx) => {
      bucketIndexByConvId.set(`${userId}-${idx}`, idx);
    });
    const rawByConv = conversations.map(
      (c) => convBuckets[bucketIndexByConvId.get(c.id) ?? 0] ?? [],
    );

    const leadScore = computeUserLeadScore(conversations, rawByConv);

    const primeiroContato = userEvents[0] ? new Date(userEvents[0].created_at) : null;
    const ultimoContato = userEvents[userEvents.length - 1]
      ? new Date(userEvents[userEvents.length - 1].created_at)
      : null;

    let returnGapMs = 0;
    if (conversations.length > 1) {
      const previous = conversations[1];
      const latest = conversations[0];
      const prevEnd = previous.endedAt ?? previous.startedAt;
      returnGapMs = Math.max(0, latest.startedAt.getTime() - prevEnd.getTime());
    }

    const telefone = extractPhone(userEvents);

    ilhaUsers.push({
      id: userId,
      nome: extractName(userEvents),
      telefone,
      maskedPhone: telefone ? maskPhone(telefone) : `#${userId.slice(0, 8)}`,
      latestStatus: conversations[0]?.transferredToAssistant ? "Transferido" : "Ativo",
      leadScore,
      conversations,
      qtdInteracoes: conversations.reduce((a, c) => a + c.messages.length, 0),
      primeiroContato,
      ultimoContato,
      totalEventos: userEvents.length,
      returnGapMs,
    });
  }

  const allMsgs = ilhaUsers.flatMap((u) => u.conversations.flatMap((c) => c.messages));
  const allConvs = ilhaUsers.flatMap((u) => u.conversations);

  const intentDistribution = tally(allMsgs.map((m) => m.intent));
  const themeDistribution = tally(allMsgs.map((m) => m.theme));
  const sentimentDistribution = {
    positive: allMsgs.filter((m) => m.sentiment === "positive").length,
    neutral: allMsgs.filter((m) => m.sentiment === "neutral").length,
    negative: allMsgs.filter((m) => m.sentiment === "negative").length,
  };

  const stagesAcross = (key: number) =>
    allConvs.filter((c) => c.stages[key]?.complete).length;
  const funnel = [
    { label: "Iniciou conversa", count: stagesAcross(0) },
    { label: "Tirou dúvida", count: stagesAcross(1) },
    { label: "Pediu informação", count: stagesAcross(2) },
    { label: "Pediu disponibilidade", count: stagesAcross(3) },
    { label: "Transferido", count: stagesAcross(4) },
  ];

  const matrixMap = new Map<string, number>();
  for (const m of allMsgs) {
    if (!m.theme || !m.intent) continue;
    const k = `${titleize(m.theme)}|${titleize(m.intent)}`;
    matrixMap.set(k, (matrixMap.get(k) ?? 0) + 1);
  }
  const themeIntentMatrix: IlhaResumo["aggregates"]["themeIntentMatrix"] = [];
  for (const [k, v] of matrixMap) {
    const [theme, intent] = k.split("|");
    themeIntentMatrix.push([theme, intent, v]);
  }

  const kpis = buildKpis(ilhaUsers, allConvs);
  const insights = buildGlobalInsights(ilhaUsers, allConvs);
  const perf = buildPerformanceMetrics(allConvs);

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
      kpis,
      insights,
      ...perf,
    },
  };
}

function unwrapPayload(raw: unknown): unknown {
  let current = raw;
  for (let i = 0; i < 5; i++) {
    if (isFlatEventsArray(current)) return current;
    if (current && typeof current === "object") {
      const c = current as Record<string, unknown>;
      if ("data" in c) { current = c.data; continue; }
      if ("rows" in c) { current = c.rows; continue; }
      if ("items" in c) { current = c.items; continue; }
      if ("result" in c) { current = c.result; continue; }
      if ("events" in c && !("conversations" in c)) { current = c.events; continue; }
      if ("json" in c) { current = c.json; continue; }
    }
    if (Array.isArray(current) && current.length === 1) {
      const only = current[0];
      if (only && typeof only === "object" && "json" in (only as object)) {
        current = (only as any).json;
        continue;
      }
      if (Array.isArray(only)) {
        current = only;
        continue;
      }
    }
    break;
  }
  return current;
}

function describeShape(v: unknown): string {
  if (v === null) return "null";
  if (Array.isArray(v)) {
    const first = v[0];
    const keys =
      first && typeof first === "object"
        ? Object.keys(first).slice(0, 6).join(",")
        : typeof first;
    return `array(len=${v.length}, first=${keys})`;
  }
  if (typeof v === "object") {
    return `object(keys=${Object.keys(v as object).slice(0, 8).join(",")})`;
  }
  return typeof v;
}

export function normalize(raw: IlhaResumoRaw): IlhaResumo {
  const unwrapped = unwrapPayload(raw);
  if (isFlatEventsArray(unwrapped)) {
    return normalizeFlatEvents(unwrapped);
  }
  if (!unwrapped || (typeof unwrapped !== "object")) {
    // eslint-disable-next-line no-console
    console.error("[Ilha] formato não reconhecido. raw:", raw, "unwrapped:", unwrapped);
    throw new Error(
      `Resposta do webhook em formato não reconhecido. Recebido: ${describeShape(unwrapped)}`,
    );
  }
  const isTablesShape =
    (Array.isArray(unwrapped) && unwrapped.length === 5 && unwrapped.every(Array.isArray)) ||
    (typeof unwrapped === "object" &&
      "conversations" in (unwrapped as object) &&
      "chat_messages" in (unwrapped as object));
  if (!isTablesShape) {
    // eslint-disable-next-line no-console
    console.error("[Ilha] formato não reconhecido. raw:", raw, "unwrapped:", unwrapped);
    throw new Error(
      `Resposta do webhook em formato não reconhecido. Recebido: ${describeShape(unwrapped)}`,
    );
  }
  const { conversations, events, sessions, users, chat_messages } = coerceTables(
    unwrapped as IlhaResumoRaw,
  );

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
      responsePairs: [],
      duplicateInputsCount: 0,
      receivedCount: 0,
      processedCount: 0,
      stages: [],
      dominantTheme: null,
      dominantIntent: null,
      dominantSentiment: null,
      askedDateCount: 0,
      totalEventsCount: evts.length,
    };

    const arr = convsByUser.get(userId) ?? [];
    arr.push(conv);
    convsByUser.set(userId, arr);
  }

  const ilhaUsers: IlhaUser[] = users.map((u: any) => {
    const userId = String(u.id);
    const convs = (convsByUser.get(userId) ?? []).sort(
      (a, b) => b.startedAt.getTime() - a.startedAt.getTime(),
    );
    const latest = convs[0];
    const latestSession = latest ? sessionsByConv.get(latest.id) : null;
    const telefone = pickString(u.telefone ?? u.phone);
    const fallbackLeadScore: LeadScoreDetail = {
      score: Number(u.lead_score ?? u.leadScore ?? 0),
      label: "Lead frio",
      caption: "Baixa chance comercial no momento.",
      reasons: [],
      qualified: Number(u.lead_score ?? u.leadScore ?? 0) >= 70,
    };
    if (fallbackLeadScore.score >= 80) {
      fallbackLeadScore.label = "Lead quente";
      fallbackLeadScore.caption = "Alta probabilidade de conversão.";
    } else if (fallbackLeadScore.score >= 60) {
      fallbackLeadScore.label = "Lead morno";
      fallbackLeadScore.caption = "Sinal comercial com fricção no fluxo.";
    }
    return {
      id: userId,
      nome: pickString(u.nome ?? u.name, "Sem nome"),
      telefone,
      maskedPhone: maskPhone(telefone),
      latestStatus: pickString(latestSession?.user_status, "—"),
      leadScore: fallbackLeadScore,
      conversations: convs,
      qtdInteracoes: convs.reduce((a, c) => a + c.messages.length, 0),
      primeiroContato: convs[convs.length - 1]?.startedAt ?? null,
      ultimoContato: convs[0]?.endedAt ?? convs[0]?.startedAt ?? null,
      totalEventos: convs.reduce((a, c) => a + c.events.length + c.messages.length, 0),
      returnGapMs: 0,
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
    {
      label: "Interações bot",
      count: allConvs.filter((c) => c.messages.some((m) => m.from === "bot")).length,
    },
    {
      label: "Qualificadas",
      count: allConvs.filter((c) =>
        (c.topIntents ?? []).includes("qualify") || (c.topIntents ?? []).includes("quote"),
      ).length,
    },
    {
      label: "Transferidas p/ atendente",
      count: allConvs.filter((c) => c.transferredToAssistant).length,
    },
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
      kpis: buildKpis(ilhaUsers, allConvs),
      insights: [],
      avgResponseSeconds: 0,
      resolvedByBotPercent: 0,
      transferredPercent: 0,
      duplicatesPercent: 0,
      performanceByTheme: [],
    },
  };
}
