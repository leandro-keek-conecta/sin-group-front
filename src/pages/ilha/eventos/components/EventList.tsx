import { Box, Stack, Typography } from "@mui/material";
import type { CalendlyEvent } from "../../types";
import { ilhaTokens } from "../../theme/tokens";
import { EventStatusChip } from "./EventStatusChip";
import { formatTime, groupByDay } from "../utils/eventFormatters";

interface Props {
  events: CalendlyEvent[];
  selectedUri: string | null;
  onSelect: (uri: string) => void;
  emptyText?: string;
}

export function EventList({ events, selectedUri, onSelect, emptyText = "Nenhum evento encontrado." }: Props) {
  if (events.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: ilhaTokens.color.textTertiary,
          fontSize: ilhaTokens.font.body.size,
          px: `${ilhaTokens.space.xl}px`,
          textAlign: "center",
        }}
      >
        {emptyText}
      </Box>
    );
  }

  const groups = groupByDay(events);

  return (
    <Box
      sx={{
        overflowY: "auto",
        height: "100%",
        px: `${ilhaTokens.space.md}px`,
        py: `${ilhaTokens.space.md}px`,
      }}
    >
      {groups.map((group) => (
        <Box key={group.key} sx={{ mb: `${ilhaTokens.space.md}px` }}>
          <Typography
            sx={{
              fontSize: ilhaTokens.font.micro.size,
              fontWeight: ilhaTokens.font.micro.weight,
              letterSpacing: ilhaTokens.font.micro.letterSpacing,
              textTransform: "uppercase",
              color: ilhaTokens.color.textTertiary,
              px: `${ilhaTokens.space.sm}px`,
              mb: `${ilhaTokens.space.xs}px`,
            }}
          >
            {group.label}
          </Typography>
          <Stack spacing={`${ilhaTokens.space.xs}px`}>
            {group.events.map((event) => (
              <EventRow
                key={event.uri}
                event={event}
                selected={event.uri === selectedUri}
                onSelect={() => onSelect(event.uri)}
              />
            ))}
          </Stack>
        </Box>
      ))}
    </Box>
  );
}

function EventRow({
  event,
  selected,
  onSelect,
}: {
  event: CalendlyEvent;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      sx={{
        px: `${ilhaTokens.space.md}px`,
        py: `${ilhaTokens.space.sm}px`,
        borderRadius: `${ilhaTokens.radius.md}px`,
        border: `1px solid ${
          selected ? ilhaTokens.color.accent : ilhaTokens.color.border
        }`,
        bgcolor: selected ? ilhaTokens.color.accentSofter : ilhaTokens.color.bgSurface,
        cursor: "pointer",
        transition: `all ${ilhaTokens.transition.base}`,
        "&:hover": {
          borderColor: selected ? ilhaTokens.color.accent : ilhaTokens.color.borderStrong,
          bgcolor: selected ? ilhaTokens.color.accentSoft : ilhaTokens.color.bgSubtle,
        },
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Typography
          sx={{
            fontSize: ilhaTokens.font.bodyStrong.size,
            fontWeight: ilhaTokens.font.bodyStrong.weight,
            color: ilhaTokens.color.textPrimary,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}
        >
          {event.name}
        </Typography>
        <EventStatusChip status={event.status} />
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          mt: "4px",
          fontSize: ilhaTokens.font.caption.size,
          color: ilhaTokens.color.textTertiary,
        }}
      >
        <Typography component="span" sx={{ fontSize: "inherit", color: "inherit" }}>
          {formatTime(event.startTime)} – {formatTime(event.endTime)}
        </Typography>
        <Typography component="span" sx={{ fontSize: "inherit", color: "inherit" }}>
          ·
        </Typography>
        <Typography component="span" sx={{ fontSize: "inherit", color: "inherit" }}>
          {event.inviteesCount} convidado{event.inviteesCount === 1 ? "" : "s"}
        </Typography>
      </Stack>
    </Box>
  );
}
