import type { CalendlyEvent } from "../../types";

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MONTHS = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

export function formatEventDateLabel(date: Date): string {
  if (!isValidDate(date)) return "—";
  const w = WEEKDAYS[date.getDay()];
  const d = date.getDate().toString().padStart(2, "0");
  const m = MONTHS[date.getMonth()];
  return `${w}, ${d} ${m}`;
}

export function formatFullDateLabel(date: Date): string {
  if (!isValidDate(date)) return "—";
  const d = date.getDate().toString().padStart(2, "0");
  const m = MONTHS[date.getMonth()];
  const y = date.getFullYear();
  return `${d} de ${m}. ${y}`;
}

export function formatTimeRange(start: Date, end: Date): string {
  if (!isValidDate(start) || !isValidDate(end)) return "—";
  return `${formatTime(start)} – ${formatTime(end)}`;
}

export function formatTime(date: Date): string {
  if (!isValidDate(date)) return "";
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeLabel(date: Date): string {
  if (!isValidDate(date)) return "";
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMin = Math.round(diffMs / 60_000);
  const diffHour = Math.round(diffMs / 3_600_000);
  const diffDay = Math.round(diffMs / 86_400_000);

  if (diffMs > 0) {
    if (diffMin < 60) return `em ${diffMin} min`;
    if (diffHour < 24) return `em ${diffHour} h`;
    if (diffDay < 7) return `em ${diffDay} dia${diffDay === 1 ? "" : "s"}`;
    return formatFullDateLabel(date);
  }
  const absMin = Math.abs(diffMin);
  const absHour = Math.abs(diffHour);
  const absDay = Math.abs(diffDay);
  if (absMin < 60) return `há ${absMin} min`;
  if (absHour < 24) return `há ${absHour} h`;
  if (absDay < 7) return `há ${absDay} dia${absDay === 1 ? "" : "s"}`;
  return formatFullDateLabel(date);
}

function isValidDate(d: Date): boolean {
  return d instanceof Date && !Number.isNaN(d.getTime()) && d.getTime() > 0;
}

export function groupByDay(events: CalendlyEvent[]): { key: string; label: string; events: CalendlyEvent[] }[] {
  const groups = new Map<string, { label: string; events: CalendlyEvent[] }>();
  for (const event of events) {
    if (!isValidDate(event.startTime)) continue;
    const key = event.startTime.toISOString().slice(0, 10);
    const label = formatEventDateLabel(event.startTime);
    const existing = groups.get(key);
    if (existing) existing.events.push(event);
    else groups.set(key, { label, events: [event] });
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => ({ key, ...val }));
}

export function rollingSevenDays(from: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}
