import { Box, Stack, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import type { IlhaResumo, IlhaStage } from "../../types";
import { IlhaCard } from "../../components/IlhaCard";
import { ilhaTokens, leadLabelColor } from "../../theme/tokens";

function formatStart(d: Date): string {
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function JourneyTimeline({ data }: { data: IlhaResumo }) {
  const latest = data.users
    .flatMap((u) => u.conversations.map((c) => ({ u, c })))
    .sort((a, b) => b.c.startedAt.getTime() - a.c.startedAt.getTime())
    .slice(0, 3);

  return (
    <IlhaCard
      title="Jornada do usuário"
      subtitle="As 5 etapas comerciais detectadas nas últimas conversas"
    >
      <Stack spacing={`${ilhaTokens.space.xl}px`}>
        {latest.map(({ u, c }, idx) => {
          const tone = leadLabelColor[u.leadScore.label];
          return (
            <Box
              key={c.id}
              sx={{
                pt: idx === 0 ? 0 : `${ilhaTokens.space.lg}px`,
                borderTop:
                  idx === 0 ? "none" : `1px solid ${ilhaTokens.color.border}`,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                sx={{ mb: `${ilhaTokens.space.md}px` }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: ilhaTokens.font.h2.size,
                      fontWeight: ilhaTokens.font.h1.weight,
                      color: ilhaTokens.color.textPrimary,
                    }}
                  >
                    {u.nome}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: ilhaTokens.font.caption.size,
                      color: ilhaTokens.color.textTertiary,
                      mt: "2px",
                    }}
                  >
                    {formatStart(c.startedAt)} · {c.messages.length} mensagens
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    px: `${ilhaTokens.space.sm}px`,
                    height: 22,
                    borderRadius: `${ilhaTokens.radius.sm}px`,
                    bgcolor: tone.bg,
                    color: tone.fg,
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: tone.dot,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: ilhaTokens.font.caption.size,
                      fontWeight: ilhaTokens.font.bodyStrong.weight,
                    }}
                  >
                    {u.leadScore.label}
                  </Typography>
                </Box>
              </Stack>
              <StageTimeline stages={c.stages} />
            </Box>
          );
        })}
      </Stack>
    </IlhaCard>
  );
}

function StageTimeline({ stages }: { stages: IlhaStage[] }) {
  return (
    <Stack spacing={0}>
      {stages.map((stage, i) => (
        <Box key={stage.label} sx={{ display: "flex", gap: `${ilhaTokens.space.md}px` }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: 20,
              pt: "2px",
            }}
          >
            {stage.complete ? (
              <CheckCircleIcon
                sx={{ fontSize: 16, color: ilhaTokens.color.accent }}
              />
            ) : (
              <RadioButtonUncheckedIcon
                sx={{ fontSize: 16, color: ilhaTokens.color.textDisabled }}
              />
            )}
            {i < stages.length - 1 && (
              <Box
                sx={{
                  width: 1,
                  flex: 1,
                  minHeight: 24,
                  bgcolor: stage.complete
                    ? ilhaTokens.color.accent
                    : ilhaTokens.color.border,
                  opacity: stage.complete ? 0.4 : 1,
                  mt: "2px",
                }}
              />
            )}
          </Box>
          <Box sx={{ flex: 1, pb: `${ilhaTokens.space.md}px` }}>
            <Stack
              direction="row"
              alignItems="baseline"
              spacing={`${ilhaTokens.space.sm}px`}
            >
              <Typography
                sx={{
                  fontSize: ilhaTokens.font.body.size,
                  fontWeight: ilhaTokens.font.bodyStrong.weight,
                  color: stage.complete
                    ? ilhaTokens.color.textPrimary
                    : ilhaTokens.color.textTertiary,
                }}
              >
                {stage.label}
              </Typography>
              {stage.time && (
                <Typography
                  sx={{
                    fontSize: ilhaTokens.font.caption.size,
                    color: ilhaTokens.color.textTertiary,
                  }}
                >
                  {stage.date} · {stage.time}
                </Typography>
              )}
            </Stack>
            <Typography
              sx={{
                fontSize: ilhaTokens.font.caption.size,
                color: ilhaTokens.color.textSecondary,
                display: "block",
                lineHeight: 1.4,
              }}
            >
              {stage.note}
            </Typography>
            {stage.complete && (
              <Stack
                direction="row"
                spacing={`${ilhaTokens.space.xs}px`}
                sx={{ mt: "4px" }}
              >
                <StageChip label={`+${stage.elapsedFromPrevious}`} />
                <StageChip label={`total ${stage.elapsedFromStart}`} />
              </Stack>
            )}
          </Box>
        </Box>
      ))}
    </Stack>
  );
}

function StageChip({ label }: { label: string }) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        height: 18,
        px: "6px",
        borderRadius: `${ilhaTokens.radius.sm}px`,
        border: `1px solid ${ilhaTokens.color.border}`,
        fontSize: 10,
        fontFamily: ilhaTokens.font.family,
        color: ilhaTokens.color.textSecondary,
        fontWeight: 600,
      }}
    >
      {label}
    </Box>
  );
}
