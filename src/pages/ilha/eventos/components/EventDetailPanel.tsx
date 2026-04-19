import { useState } from "react";
import { Box, Button, CircularProgress, IconButton, Stack, Typography } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import type { CalendlyEvent, CalendlyInvitee } from "../../types";
import { ilhaTokens } from "../../theme/tokens";
import { useCalendlyEventDetail, useCancelEvent } from "../hooks/useCalendly";
import { EventStatusChip } from "./EventStatusChip";
import {
  formatFullDateLabel,
  formatRelativeLabel,
  formatTimeRange,
} from "../utils/eventFormatters";

interface Props {
  selectedUri: string | null;
  fallback: CalendlyEvent | null;
  onBack?: () => void;
}

export function EventDetailPanel({ selectedUri, fallback, onBack }: Props) {
  const { data, isLoading, error } = useCalendlyEventDetail(selectedUri);

  if (!selectedUri) {
    return <EmptyState />;
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {onBack && <BackBar onBack={onBack} />}
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CircularProgress size={24} sx={{ color: ilhaTokens.color.accent }} />
        </Box>
      </Box>
    );
  }

  const event = data?.event ?? fallback;
  const invitees = data?.invitees ?? [];

  if (!event) {
    return (
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {onBack && <BackBar onBack={onBack} />}
        <Box sx={{ p: `${ilhaTokens.space.xl}px` }}>
          <Typography sx={{ color: ilhaTokens.color.danger, fontSize: ilhaTokens.font.body.size }}>
            {error?.message ?? "Evento não encontrado."}
          </Typography>
        </Box>
      </Box>
    );
  }

  return <EventDetailContent event={event} invitees={invitees} onBack={onBack} />;
}

function BackBar({ onBack, title }: { onBack: () => void; title?: string }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{
        px: `${ilhaTokens.space.md}px`,
        py: `${ilhaTokens.space.sm}px`,
        borderBottom: `1px solid ${ilhaTokens.color.border}`,
        bgcolor: ilhaTokens.color.bgSurface,
        position: "sticky",
        top: 0,
        zIndex: 1,
      }}
    >
      <IconButton
        onClick={onBack}
        size="small"
        aria-label="Voltar"
        sx={{
          color: ilhaTokens.color.textSecondary,
          "&:hover": { color: ilhaTokens.color.accent, bgcolor: ilhaTokens.color.accentSoft },
        }}
      >
        <ArrowBackIcon fontSize="small" />
      </IconButton>
      <Typography
        sx={{
          fontSize: ilhaTokens.font.bodyStrong.size,
          fontWeight: ilhaTokens.font.bodyStrong.weight,
          color: ilhaTokens.color.textPrimary,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          flex: 1,
          minWidth: 0,
        }}
      >
        {title ?? "Voltar"}
      </Typography>
    </Stack>
  );
}

function EventDetailContent({
  event,
  invitees,
  onBack,
}: {
  event: CalendlyEvent;
  invitees: CalendlyInvitee[];
  onBack?: () => void;
}) {
  const cancel = useCancelEvent();
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState(false);

  const handleCancel = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    cancel.mutate({ uri: event.uri, reason: reason || undefined });
    setConfirming(false);
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      {onBack && <BackBar onBack={onBack} title={event.name} />}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: { xs: `${ilhaTokens.space.lg}px`, md: `${ilhaTokens.space["2xl"]}px` },
          py: { xs: `${ilhaTokens.space.lg}px`, md: `${ilhaTokens.space.xl}px` },
        }}
      >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Typography
          sx={{
            fontSize: ilhaTokens.font.display.size,
            fontWeight: ilhaTokens.font.display.weight,
            color: ilhaTokens.color.textPrimary,
            lineHeight: ilhaTokens.font.display.lineHeight,
          }}
        >
          {event.name}
        </Typography>
        <EventStatusChip status={event.status} />
      </Stack>
      <Typography
        sx={{
          fontSize: ilhaTokens.font.caption.size,
          color: ilhaTokens.color.textTertiary,
          mt: "4px",
        }}
      >
        {formatRelativeLabel(event.startTime)}
      </Typography>

      <Box
        sx={{
          mt: `${ilhaTokens.space.lg}px`,
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: `${ilhaTokens.space.sm}px`,
          p: `${ilhaTokens.space.lg}px`,
          borderRadius: `${ilhaTokens.radius.md}px`,
          border: `1px solid ${ilhaTokens.color.border}`,
          bgcolor: ilhaTokens.color.bgSurface,
        }}
      >
        <DetailRow
          icon={<CalendarMonthIcon fontSize="small" sx={{ color: ilhaTokens.color.accent }} />}
          label="Data"
          value={formatFullDateLabel(event.startTime)}
        />
        <DetailRow
          icon={<AccessTimeIcon fontSize="small" sx={{ color: ilhaTokens.color.accent }} />}
          label="Horário"
          value={formatTimeRange(event.startTime, event.endTime)}
        />
        {event.location && (
          <DetailRow
            icon={<LocationOnIcon fontSize="small" sx={{ color: ilhaTokens.color.accent }} />}
            label="Local"
            value={event.location.location ?? event.location.type ?? "—"}
            href={event.location.joinUrl}
          />
        )}
        {event.organizer && (
          <DetailRow
            icon={<PersonIcon fontSize="small" sx={{ color: ilhaTokens.color.accent }} />}
            label="Organizador"
            value={`${event.organizer.name} · ${event.organizer.email}`}
          />
        )}
      </Box>

      <Box sx={{ mt: `${ilhaTokens.space.xl}px` }}>
        <Typography
          sx={{
            fontSize: ilhaTokens.font.h2.size,
            fontWeight: ilhaTokens.font.h2.weight,
            color: ilhaTokens.color.textPrimary,
            mb: `${ilhaTokens.space.sm}px`,
          }}
        >
          Convidados ({invitees.length || event.inviteesCount})
        </Typography>
        {invitees.length === 0 ? (
          <Typography sx={{ fontSize: ilhaTokens.font.body.size, color: ilhaTokens.color.textTertiary }}>
            {event.inviteesCount > 0
              ? "Detalhes dos convidados não disponíveis."
              : "Nenhum convidado registrado."}
          </Typography>
        ) : (
          <Stack spacing={`${ilhaTokens.space.sm}px`}>
            {invitees.map((invitee) => (
              <InviteeRow key={invitee.uri} invitee={invitee} />
            ))}
          </Stack>
        )}
      </Box>

      {event.status === "active" && (
        <Box sx={{ mt: `${ilhaTokens.space.xl}px` }}>
          <Typography
            sx={{
              fontSize: ilhaTokens.font.h2.size,
              fontWeight: ilhaTokens.font.h2.weight,
              color: ilhaTokens.color.textPrimary,
              mb: `${ilhaTokens.space.sm}px`,
            }}
          >
            Ações
          </Typography>
          {confirming && (
            <Box
              sx={{
                mb: `${ilhaTokens.space.sm}px`,
                p: `${ilhaTokens.space.md}px`,
                borderRadius: `${ilhaTokens.radius.md}px`,
                border: `1px solid ${ilhaTokens.color.borderStrong}`,
                bgcolor: ilhaTokens.color.dangerSoft,
              }}
            >
              <Typography sx={{ fontSize: ilhaTokens.font.body.size, mb: `${ilhaTokens.space.sm}px` }}>
                Confirmar cancelamento deste evento?
              </Typography>
              <Box
                component="textarea"
                value={reason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
                placeholder="Motivo (opcional)"
                rows={2}
                sx={{
                  width: "100%",
                  p: `${ilhaTokens.space.sm}px`,
                  borderRadius: `${ilhaTokens.radius.sm}px`,
                  border: `1px solid ${ilhaTokens.color.border}`,
                  fontFamily: ilhaTokens.font.family,
                  fontSize: ilhaTokens.font.body.size,
                  resize: "vertical",
                  outline: "none",
                  "&:focus": { borderColor: ilhaTokens.color.accent },
                }}
              />
            </Box>
          )}
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              disabled={cancel.isPending}
            >
              {cancel.isPending
                ? "Cancelando…"
                : confirming
                ? "Confirmar cancelamento"
                : "Cancelar evento"}
            </Button>
            {confirming && (
              <Button size="small" onClick={() => setConfirming(false)}>
                Desistir
              </Button>
            )}
          </Stack>
          {cancel.isError && (
            <Typography
              sx={{
                mt: `${ilhaTokens.space.xs}px`,
                fontSize: ilhaTokens.font.caption.size,
                color: ilhaTokens.color.danger,
              }}
            >
              {cancel.error?.message ?? "Falha ao cancelar."}
            </Typography>
          )}
        </Box>
      )}
      </Box>
    </Box>
  );
}

function DetailRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.25}>
      <Box sx={{ width: 20, display: "flex", justifyContent: "center" }}>{icon}</Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          sx={{
            fontSize: ilhaTokens.font.micro.size,
            fontWeight: ilhaTokens.font.micro.weight,
            letterSpacing: ilhaTokens.font.micro.letterSpacing,
            textTransform: "uppercase",
            color: ilhaTokens.color.textTertiary,
          }}
        >
          {label}
        </Typography>
        {href ? (
          <Box
            component="a"
            href={href}
            target="_blank"
            rel="noreferrer"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              color: ilhaTokens.color.accent,
              fontSize: ilhaTokens.font.body.size,
              fontWeight: ilhaTokens.font.bodyStrong.weight,
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {value}
            <OpenInNewIcon sx={{ fontSize: 14 }} />
          </Box>
        ) : (
          <Typography sx={{ fontSize: ilhaTokens.font.body.size, color: ilhaTokens.color.textPrimary }}>
            {value}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

function InviteeRow({ invitee }: { invitee: CalendlyInvitee }) {
  const initial = invitee.name.charAt(0).toUpperCase() || "?";
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.25}
      sx={{
        p: `${ilhaTokens.space.sm}px`,
        borderRadius: `${ilhaTokens.radius.md}px`,
        border: `1px solid ${ilhaTokens.color.border}`,
        bgcolor: ilhaTokens.color.bgSurface,
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          bgcolor: ilhaTokens.color.accentSoft,
          color: ilhaTokens.color.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
        }}
      >
        {initial}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: ilhaTokens.font.bodyStrong.size,
            fontWeight: ilhaTokens.font.bodyStrong.weight,
            color: ilhaTokens.color.textPrimary,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {invitee.name || invitee.email}
        </Typography>
        <Typography
          sx={{
            fontSize: ilhaTokens.font.caption.size,
            color: ilhaTokens.color.textTertiary,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {invitee.email}
          {invitee.phone ? ` · ${invitee.phone}` : ""}
        </Typography>
      </Box>
      <EventStatusChip status={invitee.status} />
    </Stack>
  );
}

function EmptyState() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        px: `${ilhaTokens.space.xl}px`,
        textAlign: "center",
        color: ilhaTokens.color.textTertiary,
      }}
    >
      <CalendarMonthIcon sx={{ fontSize: 48, color: ilhaTokens.color.textDisabled, mb: 1 }} />
      <Typography sx={{ fontSize: ilhaTokens.font.h1.size, fontWeight: ilhaTokens.font.h1.weight }}>
        Selecione um evento
      </Typography>
      <Typography sx={{ fontSize: ilhaTokens.font.caption.size, mt: 0.5 }}>
        Escolha um agendamento na lista para ver detalhes, convidados e ações.
      </Typography>
    </Box>
  );
}
