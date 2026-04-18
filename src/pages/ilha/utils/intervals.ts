const PT_BR = "pt-BR";
const TIMEZONE = "America/Fortaleza";

export function formatDuration(ms: number): string {
  if (!ms || ms < 0 || !isFinite(ms)) return "0m 00s";
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
  }
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

export function formatElapsed(fromMs: number, toMs: number): string {
  const delta = toMs - fromMs;
  if (delta <= 0) return "instant.";
  return formatDuration(delta);
}

export function formatClockTime(d: Date | null | undefined): string {
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat(PT_BR, {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: TIMEZONE,
    }).format(d);
  } catch {
    return d.toLocaleTimeString(PT_BR, { hour: "2-digit", minute: "2-digit" });
  }
}

export function formatDate(d: Date | null | undefined): string {
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat(PT_BR, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: TIMEZONE,
    }).format(d);
  } catch {
    return d.toLocaleDateString(PT_BR);
  }
}

export function formatDateTime(d: Date | null | undefined): string {
  if (!d) return "—";
  return `${formatDate(d)} ${formatClockTime(d)}`;
}

export function formatSeconds(s: number): string {
  if (!isFinite(s) || s < 0) return "0,0s";
  return `${s.toFixed(1).replace(".", ",")}s`;
}
