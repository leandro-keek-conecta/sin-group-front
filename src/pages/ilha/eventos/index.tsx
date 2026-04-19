import { useMemo, useState } from "react";
import { Box, CircularProgress, Stack, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { IlhaPageHeader } from "../components/IlhaPageHeader";
import { ilhaTokens } from "../theme/tokens";
import { useCalendlyEvents } from "./hooks/useCalendly";
import { EventList } from "./components/EventList";
import { EventDetailPanel } from "./components/EventDetailPanel";
import { SchedulingLinkCreator } from "./components/SchedulingLinkCreator";
import { ExportRangeButton } from "./components/ExportRangeButton";

type FilterTab = "upcoming" | "past" | "canceled";

const TABS: { id: FilterTab; label: string }[] = [
  { id: "upcoming", label: "Próximos" },
  { id: "past", label: "Realizados" },
  { id: "canceled", label: "Cancelados" },
];

export default function IlhaEventos() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [tab, setTab] = useState<FilterTab>("upcoming");
  const [selectedUri, setSelectedUri] = useState<string | null>(null);

  const { status, minStartTime, maxStartTime } = useMemo(() => buildFilter(tab), [tab]);

  const { data: events = [], isLoading, error, refetch, isFetching } = useCalendlyEvents({
    status,
    minStartTime,
    maxStartTime,
    count: 100,
  });

  const sortedEvents = useMemo(() => {
    const copy = [...events];
    copy.sort((a, b) => {
      const diff = a.startTime.getTime() - b.startTime.getTime();
      return tab === "past" ? -diff : diff;
    });
    return copy;
  }, [events, tab]);

  const selectedEvent = useMemo(
    () => sortedEvents.find((e) => e.uri === selectedUri) ?? null,
    [sortedEvents, selectedUri],
  );

  const handleSelectTab = (next: FilterTab) => {
    if (next === tab) return;
    setTab(next);
    setSelectedUri(null);
  };

  const subtitle = buildSubtitle(sortedEvents.length, tab);

  return (
    <Box
      sx={{
        px: { xs: `${ilhaTokens.space.md}px`, md: `${ilhaTokens.space["2xl"]}px` },
        pb: { xs: `${ilhaTokens.space.lg}px`, md: `${ilhaTokens.space["3xl"]}px` },
      }}
    >
      {!(isMobile && selectedUri) && (
        <>
          <IlhaPageHeader
            title="Eventos"
            subtitle={subtitle}
            actions={
              <Stack direction="row" spacing={1} alignItems="center">
                <ExportRangeButton />
                <SchedulingLinkCreator />
              </Stack>
            }
          />

          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              mb: `${ilhaTokens.space.lg}px`,
              p: "4px",
              bgcolor: ilhaTokens.color.bgSubtle,
              borderRadius: `${ilhaTokens.radius.md}px`,
              width: { xs: "100%", sm: "fit-content" },
              overflowX: "auto",
            }}
          >
            {TABS.map((t) => {
              const active = t.id === tab;
              return (
                <Box
                  key={t.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectTab(t.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelectTab(t.id);
                    }
                  }}
                  sx={{
                    flex: { xs: 1, sm: "0 0 auto" },
                    textAlign: "center",
                    px: `${ilhaTokens.space.md}px`,
                    py: { xs: "8px", sm: "6px" },
                    borderRadius: `${ilhaTokens.radius.sm}px`,
                    fontSize: ilhaTokens.font.body.size,
                    fontWeight: active
                      ? ilhaTokens.font.bodyStrong.weight
                      : ilhaTokens.font.body.weight,
                    color: active ? ilhaTokens.color.textPrimary : ilhaTokens.color.textSecondary,
                    bgcolor: active ? ilhaTokens.color.bgSurface : "transparent",
                    boxShadow: active ? ilhaTokens.shadow.sm : "none",
                    cursor: "pointer",
                    transition: `all ${ilhaTokens.transition.base}`,
                    whiteSpace: "nowrap",
                    "&:hover": {
                      color: ilhaTokens.color.textPrimary,
                    },
                  }}
                >
                  {t.label}
                </Box>
              );
            })}
          </Stack>
        </>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: `${ilhaTokens.layout.conversationsListWidth}px minmax(0, 1fr)`,
          },
          gap: 0,
          border: { xs: `1px solid ${ilhaTokens.color.border}`, md: `1px solid ${ilhaTokens.color.border}` },
          borderRadius: `${ilhaTokens.radius.lg}px`,
          overflow: "hidden",
          bgcolor: ilhaTokens.color.bgCanvas,
          mt: "1rem",
          minHeight: {
            xs: "calc(100dvh - 170px)",
            md: `calc(100dvh - 3rem - ${ilhaTokens.layout.tabBarHeight}px - 220px)`,
          },
          height: {
            xs: "calc(100dvh - 170px)",
            md: `calc(100dvh - 3rem - ${ilhaTokens.layout.tabBarHeight}px - 220px)`,
          },
        }}
      >
        <Box
          sx={{
            display: { xs: selectedUri ? "none" : "flex", md: "flex" },
            borderRight: { md: `1px solid ${ilhaTokens.color.border}` },
            bgcolor: ilhaTokens.color.bgSubtle,
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <Box
            sx={{
              px: `${ilhaTokens.space.md}px`,
              py: `${ilhaTokens.space.sm}px`,
              borderBottom: `1px solid ${ilhaTokens.color.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              minHeight: 36,
            }}
          >
            <Typography
              sx={{
                fontSize: ilhaTokens.font.micro.size,
                fontWeight: ilhaTokens.font.micro.weight,
                letterSpacing: ilhaTokens.font.micro.letterSpacing,
                textTransform: "uppercase",
                color: ilhaTokens.color.textTertiary,
              }}
            >
              {sortedEvents.length} evento{sortedEvents.length === 1 ? "" : "s"}
            </Typography>
            {isFetching && !isLoading && (
              <CircularProgress size={12} sx={{ color: ilhaTokens.color.accent }} />
            )}
          </Box>

          <Box sx={{ flex: 1, minHeight: 0 }}>
            {isLoading ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <CircularProgress size={20} sx={{ color: ilhaTokens.color.accent }} />
              </Box>
            ) : error ? (
              <Box sx={{ p: `${ilhaTokens.space.lg}px` }}>
                <Typography sx={{ color: ilhaTokens.color.danger, fontSize: ilhaTokens.font.body.size }}>
                  {error.message}
                </Typography>
                <Box
                  component="button"
                  onClick={() => refetch()}
                  sx={{
                    mt: `${ilhaTokens.space.sm}px`,
                    px: `${ilhaTokens.space.md}px`,
                    py: "6px",
                    fontSize: ilhaTokens.font.caption.size,
                    fontFamily: ilhaTokens.font.family,
                    bgcolor: "transparent",
                    color: ilhaTokens.color.accent,
                    border: `1px solid ${ilhaTokens.color.accent}`,
                    borderRadius: `${ilhaTokens.radius.sm}px`,
                    cursor: "pointer",
                  }}
                >
                  Tentar novamente
                </Box>
              </Box>
            ) : (
              <EventList
                events={sortedEvents}
                selectedUri={selectedUri}
                onSelect={setSelectedUri}
                emptyText={emptyTextFor(tab)}
              />
            )}
          </Box>
        </Box>

        <Box
          sx={{
            display: { xs: selectedUri ? "block" : "none", md: "block" },
            bgcolor: ilhaTokens.color.bgSurface,
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          <EventDetailPanel
            selectedUri={selectedUri}
            fallback={selectedEvent}
            onBack={isMobile ? () => setSelectedUri(null) : undefined}
          />
        </Box>
      </Box>
    </Box>
  );
}

function buildFilter(tab: FilterTab): {
  status: "active" | "canceled" | undefined;
  minStartTime?: Date;
  maxStartTime?: Date;
} {
  const now = new Date();
  if (tab === "upcoming") {
    return { status: "active", minStartTime: now };
  }
  if (tab === "past") {
    return { status: "active", maxStartTime: now };
  }
  return { status: "canceled" };
}

function buildSubtitle(count: number, tab: FilterTab): string {
  const plural = count === 1 ? "" : "s";
  if (tab === "upcoming") return `${count} próximo${plural} agendamento${plural}`;
  if (tab === "past") return `${count} evento${plural} realizado${plural}`;
  return `${count} evento${plural} cancelado${plural}`;
}

function emptyTextFor(tab: FilterTab): string {
  if (tab === "upcoming") return "Sem próximos agendamentos.";
  if (tab === "past") return "Sem eventos realizados.";
  return "Nenhum evento cancelado.";
}
