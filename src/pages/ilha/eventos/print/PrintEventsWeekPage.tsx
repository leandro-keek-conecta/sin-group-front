import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useCalendlyEvents } from "../hooks/useCalendly";
import { fetchCalendlyEventDetail } from "../../services/calendlyService";
import {
  formatEventDateLabel,
  formatTimeRange,
  rollingSevenDays,
} from "../utils/eventFormatters";
import type { CalendlyEvent, CalendlyInvitee } from "../../types";
import { PRINT_CSS, printTheme } from "./printStyles";

const MONTHS_SHORT = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

function formatRangeForTitle(start: Date, end: Date): string {
  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")} ${MONTHS_SHORT[d.getMonth()]}`;
  return `${fmt(start)} a ${fmt(end)} ${end.getFullYear()}`;
}

function formatGeneratedAt(d: Date): string {
  const date = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${date} ${time}`;
}

function parseDateParam(raw: string | null): Date | null {
  if (!raw) return null;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function resolveRange(
  startParam: string | null,
  endParam: string | null,
): { start: Date; end: Date } {
  const parsedStart = parseDateParam(startParam);
  const parsedEnd = parseDateParam(endParam);
  if (parsedStart && parsedEnd) {
    const start = new Date(parsedStart);
    start.setHours(0, 0, 0, 0);
    const end = new Date(parsedEnd);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  return rollingSevenDays();
}

export default function PrintEventsWeekPage() {
  const [params] = useSearchParams();
  const { start, end } = useMemo(
    () => resolveRange(params.get("start"), params.get("end")),
    [params],
  );

  const eventsQuery = useCalendlyEvents({
    status: "active",
    minStartTime: start,
    maxStartTime: end,
    count: 100,
  });

  const events = eventsQuery.data ?? [];
  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime()),
    [events],
  );

  const detailQueries = useQueries({
    queries: sortedEvents.map((ev) => ({
      queryKey: ["ilha-calendly", "print-eventDetail", ev.uri],
      queryFn: () => fetchCalendlyEventDetail(ev.uri),
      staleTime: 60 * 1000,
      retry: 1,
    })),
  });

  const allDetailsSettled = detailQueries.every(
    (q) => q.isSuccess || q.isError,
  );
  const isReady =
    eventsQuery.isSuccess && (sortedEvents.length === 0 || allDetailsSettled);

  const printedRef = useRef(false);
  useEffect(() => {
    if (!isReady || printedRef.current) return;
    printedRef.current = true;
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, [isReady]);

  const rangeLabel = formatRangeForTitle(start, end);
  useEffect(() => {
    document.title = `Ilha — Agenda ${rangeLabel}`;
    return () => {
      document.title = "Keek";
    };
  }, [rangeLabel]);

  if (eventsQuery.isLoading || !isReady) {
    return (
      <>
        <style>{PRINT_CSS}</style>
        <Box className="print-root" sx={printTheme.loadingBox}>
          <CircularProgress size={24} />
          <Typography sx={{ color: "#555", fontSize: "11pt" }}>
            Carregando agenda…
          </Typography>
        </Box>
      </>
    );
  }

  if (eventsQuery.isError) {
    return (
      <>
        <style>{PRINT_CSS}</style>
        <Box className="print-root" sx={printTheme.loadingBox}>
          <Typography sx={{ color: "#B91C1C", fontSize: "12pt" }}>
            Não foi possível carregar os agendamentos.
          </Typography>
          <Box
            component="button"
            onClick={() => eventsQuery.refetch()}
            className="print-hide-on-print"
            sx={{
              fontFamily: "inherit",
              border: "1px solid #111",
              background: "#FFF",
              padding: "6px 14px",
              cursor: "pointer",
              fontSize: "10pt",
              borderRadius: "4px",
            }}
          >
            Tentar novamente
          </Box>
        </Box>
      </>
    );
  }

  return (
    <>
      <style>{PRINT_CSS}</style>
      <Box className="print-root">
        <Typography component="h1" sx={printTheme.pageTitle}>
          Agenda — Ilha Tech
        </Typography>
        <Typography sx={printTheme.pageSubtitle}>{rangeLabel}</Typography>
        <Box sx={printTheme.accentLine} />

        <Typography sx={printTheme.summary}>
          {sortedEvents.length === 0
            ? "Nenhum evento agendado nos próximos 7 dias."
            : `${sortedEvents.length} ${
                sortedEvents.length === 1 ? "agendamento" : "agendamentos"
              } nos próximos 7 dias`}
        </Typography>

        {sortedEvents.length === 0 ? (
          <Box sx={printTheme.emptyState}>
            Sem eventos no período selecionado.
          </Box>
        ) : (
          sortedEvents.map((ev, i) => {
            const detail = detailQueries[i];
            const invitees: CalendlyInvitee[] = detail?.data?.invitees ?? [];
            const detailError = detail?.isError ?? false;
            return (
              <EventPrintCard
                key={ev.uri}
                event={ev}
                invitees={invitees}
                detailError={detailError}
              />
            );
          })
        )}

        <Box sx={printTheme.footer}>
          <span>Keek · ilha.tech</span>
          <span>gerado {formatGeneratedAt(new Date())}</span>
        </Box>
      </Box>
    </>
  );
}

interface EventPrintCardProps {
  event: CalendlyEvent;
  invitees: CalendlyInvitee[];
  detailError: boolean;
}

function EventPrintCard({ event, invitees, detailError }: EventPrintCardProps) {
  const dayTime = `${formatEventDateLabel(event.startTime).toUpperCase()} · ${formatTimeRange(event.startTime, event.endTime)}`;
  const statusLabel =
    event.status === "canceled" ? "CANCELADO" : "CONFIRMADO";
  const visible = invitees.slice(0, 3);
  const remaining = invitees.length - visible.length;
  const joinUrl = event.location?.joinUrl ?? null;

  return (
    <Box className="print-card" sx={printTheme.card}>
      <Box sx={printTheme.cardHeader}>
        <Typography component="span" sx={printTheme.cardDayTime}>
          {dayTime}
        </Typography>
        <Typography component="span" sx={printTheme.cardStatus}>
          ● {statusLabel}
        </Typography>
      </Box>

      <Typography sx={printTheme.cardTitle}>{event.name}</Typography>

      {detailError && invitees.length === 0 && (
        <Box sx={{ mb: "4px" }}>
          <Typography component="span" sx={printTheme.cardMetaLabel}>
            Convidado:
          </Typography>
          <Typography component="span" sx={printTheme.cardMetaValue}>
            informação não disponível
          </Typography>
        </Box>
      )}

      {!detailError && invitees.length === 0 && (
        <Box sx={{ mb: "4px" }}>
          <Typography component="span" sx={printTheme.cardMetaLabel}>
            Convidados:
          </Typography>
          <Typography component="span" sx={printTheme.cardMetaValue}>
            sem convidados registrados
          </Typography>
        </Box>
      )}

      {visible.map((inv, idx) => (
        <Box key={`${inv.email}-${idx}`} sx={{ mb: "3px" }}>
          <Typography component="span" sx={printTheme.cardMetaLabel}>
            {idx === 0 ? "Convidado:" : "\u00A0"}
          </Typography>
          <Typography component="span" sx={printTheme.cardMetaValue}>
            {inv.name}
            {inv.email ? ` · ${inv.email}` : ""}
          </Typography>
        </Box>
      ))}

      {remaining > 0 && (
        <Typography sx={{ ...printTheme.cardMetaValue, marginLeft: "82px" }}>
          + {remaining} {remaining === 1 ? "convidado" : "convidados"}
        </Typography>
      )}

      {joinUrl && (
        <Box sx={{ mt: "6px" }}>
          <Typography component="span" sx={printTheme.cardMetaLabel}>
            Link:
          </Typography>
          <Typography component="span" sx={printTheme.cardLink}>
            {joinUrl}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
