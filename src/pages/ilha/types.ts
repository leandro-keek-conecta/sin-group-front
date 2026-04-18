export type IlhaMessage = {
  id: string;
  conversationId: string;
  from: "user" | "bot" | "assistant";
  content: string;
  sentAt: Date;
  intent?: string;
  theme?: string;
  sentiment?: "positive" | "neutral" | "negative";
  isDuplicate?: boolean;
};

export type IlhaEvent = {
  id: string;
  conversationId: string;
  type: string;
  payload: Record<string, unknown>;
  occurredAt: Date;
};

export type IlhaStage = {
  label: string;
  complete: boolean;
  time: string | null;
  date: string | null;
  elapsedFromStart: string;
  elapsedFromPrevious: string;
  note: string;
};

export type ResponsePair = {
  seconds: number;
  theme: string;
  receivedAt: Date;
  processedAt: Date;
};

export type DominantSignal = {
  label: string;
  count: number;
  share: number; // 0-1
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
  responsePairs: ResponsePair[];
  duplicateInputsCount: number;
  receivedCount: number;
  processedCount: number;
  stages: IlhaStage[];
  dominantTheme: DominantSignal | null;
  dominantIntent: DominantSignal | null;
  dominantSentiment: DominantSignal | null;
  askedDateCount: number;
  totalEventsCount: number;
};

export type LeadScoreDetail = {
  score: number;
  label: "Lead quente" | "Lead morno" | "Lead frio";
  caption: string;
  reasons: string[];
  qualified: boolean;
};

export type IlhaUser = {
  id: string;
  nome: string;
  telefone: string;
  maskedPhone: string;
  latestStatus: string;
  leadScore: LeadScoreDetail;
  conversations: IlhaConversation[];
  qtdInteracoes: number;
  primeiroContato: Date | null;
  ultimoContato: Date | null;
  totalEventos: number;
  returnGapMs: number;
};

export type Insight = {
  id: string;
  tone: "sale" | "risk" | "ops" | "focus" | "context";
  badge: string;
  title: string;
  description: string;
};

export type IlhaKpi = {
  label: string;
  value: string;
  rawValue: number;
  hint?: string;
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
  kpis: IlhaKpi[];
  insights: Insight[];
  avgResponseSeconds: number;
  resolvedByBotPercent: number;
  transferredPercent: number;
  duplicatesPercent: number;
  performanceByTheme: Array<{ theme: string; avgSeconds: number; count: number }>;
};

export type IlhaResumo = {
  users: IlhaUser[];
  aggregates: IlhaAggregates;
};

export type IlhaResumoRaw = unknown;
