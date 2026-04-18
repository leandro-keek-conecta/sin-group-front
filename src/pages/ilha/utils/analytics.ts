import type {
  DominantSignal,
  IlhaConversation,
  IlhaMessage,
  IlhaStage,
  Insight,
  LeadScoreDetail,
  ResponsePair,
} from "../types";
import { formatDuration, formatClockTime, formatDate } from "./intervals";
import { normalizeText, titleize, formatPercent } from "./textHelpers";

type FlatEvent = {
  id: string;
  user_id: string;
  tipo: string;
  descricao?: string;
  metadata?: Record<string, any> | null;
  created_at: string;
};

export function tally(list: Array<string | undefined | null>): { label: string; count: number }[] {
  const map = new Map<string, number>();
  for (const item of list) {
    if (!item) continue;
    map.set(item, (map.get(item) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export function dominantSignal(
  list: Array<string | undefined | null>,
  transform: (s: string) => string = titleize,
): DominantSignal | null {
  const counts = tally(list);
  if (counts.length === 0) return null;
  const total = counts.reduce((a, c) => a + c.count, 0);
  const top = counts[0];
  return {
    label: transform(top.label),
    count: top.count,
    share: total > 0 ? top.count / total : 0,
  };
}

export function reconstructUserInputs(receivedEvents: FlatEvent[]): Array<{
  id: string;
  createdAt: Date;
  delta: string;
  duplicate: boolean;
}> {
  let previousMessage = "";
  return receivedEvents.map((event) => {
    const fullMessage = String(event.metadata?.mensagem ?? "");
    const delta = fullMessage.startsWith(previousMessage)
      ? fullMessage.slice(previousMessage.length).replace(/^\s+/, "")
      : fullMessage;
    previousMessage = fullMessage;
    return {
      id: event.id,
      createdAt: new Date(event.created_at),
      delta: delta.trim(),
      duplicate: !delta.trim(),
    };
  });
}

export function pairResponseTimes(events: FlatEvent[]): ResponsePair[] {
  const sorted = [...events].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const pairs: ResponsePair[] = [];
  let pending: FlatEvent | null = null;
  for (const event of sorted) {
    if (event.tipo === "mensagem_recebida") {
      pending = event;
      continue;
    }
    if (event.tipo === "mensagem_processada" && pending) {
      const processed = new Date(event.created_at);
      const received = new Date(pending.created_at);
      pairs.push({
        seconds: Math.round((processed.getTime() - received.getTime()) / 1000),
        theme: titleize(event.metadata?.tema ?? "sem tema"),
        receivedAt: received,
        processedAt: processed,
      });
      pending = null;
    }
  }
  return pairs;
}

type LeadScoreInput = {
  themes: Set<string>;
  intents: Set<string>;
  userInputs: string;
  hasTransfer: boolean;
};

export function calculateLeadScore(input: LeadScoreInput): LeadScoreDetail {
  let score = 0;
  const reasons: string[] = [];
  const inputs = normalizeText(input.userInputs);

  if (/alugar um espac[oº]|alugar espac[oº]|alugar o espac[oº]/.test(inputs)) {
    score += 30;
    reasons.push("Linguagem de compra detectada com pedido explícito de aluguel.");
  }
  if (input.themes.has("espaco")) {
    score += 20;
    reasons.push("Tema Espaço apareceu repetidamente nas mensagens processadas.");
  }
  if (input.themes.has("auditorio")) {
    score += 15;
    reasons.push("O interesse saiu do geral e chegou a um ativo específico: Auditório.");
  }
  if (input.themes.has("disponibilidade") || /disponibilidade/.test(inputs)) {
    score += 25;
    reasons.push("Consulta de disponibilidade indica tentativa real de fechar agenda.");
  }
  const dayMatch = inputs.match(/sabado|domingo|segunda|terca|quarta|quinta|sexta/);
  if (dayMatch) {
    score += 10;
    reasons.push(`O lead definiu preferência objetiva de data ao mencionar ${titleize(dayMatch[0])}.`);
  }
  if (input.hasTransfer) {
    score += 10;
    reasons.push("Handoff humano confirma maturidade suficiente para etapa comercial.");
  }

  score = Math.min(score, 100);

  let label: LeadScoreDetail["label"];
  let caption: string;
  if (score >= 80) {
    label = "Lead quente";
    caption = "Alta probabilidade de conversão ou follow-up comercial imediato.";
  } else if (score >= 60) {
    label = "Lead morno";
    caption = "Há sinal comercial, mas ainda existe fricção no fluxo.";
  } else {
    label = "Lead frio";
    caption = "Baixa chance comercial no momento.";
  }

  return {
    score,
    label,
    caption,
    reasons,
    qualified: score >= 70,
  };
}

type StageInput = {
  firstEventAt: Date | null;
  duvidaEventAt: Date | null;
  pediuInformacaoAt: Date | null;
  pediuDisponibilidadeAt: Date | null;
  transferAt: Date | null;
};

export function buildStages(input: StageInput): IlhaStage[] {
  const baseline = input.firstEventAt;
  const timeline: Array<{
    label: string;
    at: Date | null;
    fallback: string;
  }> = [
    {
      label: "Iniciou conversa",
      at: input.firstEventAt,
      fallback: "Lead abriu o atendimento com perguntas iniciais.",
    },
    {
      label: "Tirou dúvida",
      at: input.duvidaEventAt,
      fallback: "Primeira classificação tratada como dúvida.",
    },
    {
      label: "Pediu informação",
      at: input.pediuInformacaoAt,
      fallback: "A conversa pediu aprofundamento sobre o espaço.",
    },
    {
      label: "Pediu disponibilidade",
      at: input.pediuDisponibilidadeAt,
      fallback: "Etapa mais próxima de conversão comercial.",
    },
    {
      label: "Transferido",
      at: input.transferAt,
      fallback: "Sem handoff confirmado nesta amostra.",
    },
  ];

  let previous: Date | null = baseline;
  return timeline.map((stage) => {
    const complete = Boolean(stage.at);
    const time = stage.at ? formatClockTime(stage.at) : null;
    const date = stage.at ? formatDate(stage.at) : null;
    const elapsedFromStart =
      stage.at && baseline
        ? formatDuration(stage.at.getTime() - baseline.getTime())
        : "pendente";
    const elapsedFromPrevious =
      stage.at && previous
        ? formatDuration(stage.at.getTime() - previous.getTime())
        : "pendente";
    let note = stage.fallback;
    if (stage.at && previous && stage.at.getTime() > previous.getTime()) {
      note = `Etapa concluída em ${formatDuration(stage.at.getTime() - previous.getTime())} após a anterior.`;
    }
    if (stage.at) previous = stage.at;
    return {
      label: stage.label,
      complete,
      time,
      date,
      elapsedFromStart,
      elapsedFromPrevious,
      note,
    };
  });
}

type InsightsInput = {
  leadScore: LeadScoreDetail;
  duplicateInputs: number;
  receivedInputs: number;
  askedDateCount: number;
  dominantTheme: DominantSignal | null;
  returnGapMs: number;
  hasMultipleConversations: boolean;
};

export function computeInsights(input: InsightsInput): Insight[] {
  const insights: Insight[] = [];

  if (input.leadScore.qualified) {
    insights.push({
      id: "lead-quente",
      tone: "sale",
      badge: "Venda",
      title: input.leadScore.label,
      description: `O score derivado fechou em ${input.leadScore.score}/100 — ${input.leadScore.caption}`,
    });
  }

  if (input.duplicateInputs > 0 && input.receivedInputs > 0) {
    insights.push({
      id: "friccao-reenvio",
      tone: "risk",
      badge: "Risco",
      title: "Fricção por reenvio de mensagens",
      description: `${input.duplicateInputs} de ${input.receivedInputs} entradas recebidas foram repetições exatas (${formatPercent(input.duplicateInputs, input.receivedInputs)}), sinal de latência percebida ou baixa confiança no fluxo.`,
    });
  }

  if (input.askedDateCount > 0) {
    insights.push({
      id: "pergunta-data",
      tone: "ops",
      badge: "Operação",
      title: "Pergunta de data repetida",
      description: `O bot voltou a pedir data em ${input.askedDateCount} respostas. Vale pular essa etapa assim que o usuário disser que quer alugar um espaço.`,
    });
  }

  if (input.dominantTheme && input.dominantTheme.count > 0) {
    insights.push({
      id: "tema-dominante",
      tone: "focus",
      badge: "Foco",
      title: `Tema dominante: ${input.dominantTheme.label}`,
      description: `${input.dominantTheme.label} concentrou ${Math.round(input.dominantTheme.share * 100)}% das mensagens tratadas e virou o centro da jornada comercial.`,
    });
  }

  if (input.hasMultipleConversations && input.returnGapMs > 0) {
    insights.push({
      id: "retorno",
      tone: "context",
      badge: "Contexto",
      title: "Retorno em nova sessão",
      description: `O usuário voltou após ${formatDuration(input.returnGapMs)}. Preservar memória entre sessões reduz o risco de repetição e acelera a venda.`,
    });
  }

  return insights;
}

export function computeConversationAnalytics(
  conversation: IlhaConversation,
  flatEvents: FlatEvent[],
): Pick<
  IlhaConversation,
  | "responsePairs"
  | "duplicateInputsCount"
  | "receivedCount"
  | "processedCount"
  | "stages"
  | "dominantTheme"
  | "dominantIntent"
  | "dominantSentiment"
  | "askedDateCount"
  | "totalEventsCount"
> & { userInputsText: string; hasTransfer: boolean } {
  const received = flatEvents.filter((e) => e.tipo === "mensagem_recebida");
  const processed = flatEvents.filter((e) => e.tipo === "mensagem_processada");
  const transfers = flatEvents.filter((e) => e.tipo === "transferencia_humano");

  const inputs = reconstructUserInputs(received);
  const duplicateInputsCount = inputs.filter((i) => i.duplicate).length;
  const userInputsText = inputs.map((i) => i.delta).filter(Boolean).join(" ");

  const responsePairs = pairResponseTimes(flatEvents);

  const askedDateCount = processed.filter((e) =>
    normalizeText(e.metadata?.resposta).includes("data"),
  ).length;

  const transferAt = transfers[0] ? new Date(transfers[0].created_at) : null;
  const firstEventAt = flatEvents[0] ? new Date(flatEvents[0].created_at) : null;

  const duvidaEvent =
    processed.find((e) => normalizeText(e.metadata?.intencao) === "duvida") ?? processed[0];
  const duvidaEventAt = duvidaEvent ? new Date(duvidaEvent.created_at) : null;

  const pediuInformacaoInput = inputs.find(
    (i) =>
      normalizeText(i.delta).includes("quero saber mais") ||
      normalizeText(i.delta).includes("auditorio") ||
      normalizeText(i.delta).includes("falar mais"),
  );
  const pediuInformacaoAt = pediuInformacaoInput?.createdAt ?? null;

  const pediuDisponibilidadeInput = inputs.find(
    (i) =>
      normalizeText(i.delta).includes("disponibilidade") ||
      normalizeText(i.delta).includes("semana que vem") ||
      normalizeText(i.delta).includes("data"),
  );
  const pediuDisponibilidadeAt = pediuDisponibilidadeInput?.createdAt ?? null;

  const stages = buildStages({
    firstEventAt,
    duvidaEventAt,
    pediuInformacaoAt,
    pediuDisponibilidadeAt,
    transferAt,
  });

  const themes = processed.map((e) => normalizeText(e.metadata?.tema));
  const intents = processed.map((e) => normalizeText(e.metadata?.intencao));
  const sentiments = processed.map((e) => normalizeText(e.metadata?.sentimento));

  return {
    responsePairs,
    duplicateInputsCount,
    receivedCount: received.length,
    processedCount: processed.length,
    stages,
    dominantTheme: dominantSignal(themes),
    dominantIntent: dominantSignal(intents),
    dominantSentiment: dominantSignal(sentiments),
    askedDateCount,
    totalEventsCount: flatEvents.length,
    userInputsText,
    hasTransfer: transfers.length > 0,
  };
}

export function markDuplicatesOnMessages(
  messages: IlhaMessage[],
  duplicateTimestamps: Set<number>,
): IlhaMessage[] {
  if (duplicateTimestamps.size === 0) return messages;
  return messages.map((m) => {
    if (m.from !== "user") return m;
    if (duplicateTimestamps.has(m.sentAt.getTime())) return { ...m, isDuplicate: true };
    return m;
  });
}
