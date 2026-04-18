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

export const rawFormatA = [conversations, events, sessions, users, chat_messages];
export const rawFormatB = { conversations, events, sessions, users, chat_messages };
