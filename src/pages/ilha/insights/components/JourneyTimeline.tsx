import { Card, CardContent, Typography, Box, Stack, Chip, Divider } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { ILHA_PALETTE } from "../../utils/echartsTheme";
import type { IlhaResumo, IlhaStage } from "../../types";

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
    <Card>
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          08 — NARRATIVA
        </Typography>
        <Typography variant="h6" fontWeight={700} mb={0.5}>
          Jornada do usuário
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          As 5 etapas comerciais detectadas nas últimas conversas.
        </Typography>

        <Stack spacing={3} divider={<Divider />}>
          {latest.map(({ u, c }) => (
            <Box key={c.id}>
              <Stack direction="row" justifyContent="space-between" mb={1.5}>
                <Box>
                  <Typography fontWeight={700}>{u.nome}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatStart(c.startedAt)} · {c.messages.length} mensagens
                  </Typography>
                </Box>
                <Chip
                  label={u.leadScore.label}
                  size="small"
                  sx={{
                    bgcolor:
                      u.leadScore.label === "Lead quente"
                        ? "rgba(255,122,1,0.12)"
                        : u.leadScore.label === "Lead morno"
                          ? "rgba(224,168,0,0.15)"
                          : "action.hover",
                    color:
                      u.leadScore.label === "Lead quente"
                        ? "#A85300"
                        : u.leadScore.label === "Lead morno"
                          ? "#9A6700"
                          : "text.secondary",
                    fontWeight: 600,
                  }}
                />
              </Stack>
              <StageTimeline stages={c.stages} />
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

function StageTimeline({ stages }: { stages: IlhaStage[] }) {
  return (
    <Stack spacing={0}>
      {stages.map((stage, i) => (
        <Box key={stage.label} sx={{ display: "flex", gap: 2 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: 24,
            }}
          >
            {stage.complete ? (
              <CheckCircleIcon
                sx={{ fontSize: 18, color: ILHA_PALETTE.primary, mt: 0.25 }}
              />
            ) : (
              <RadioButtonUncheckedIcon
                sx={{ fontSize: 18, color: "text.disabled", mt: 0.25 }}
              />
            )}
            {i < stages.length - 1 && (
              <Box
                sx={{
                  width: 2,
                  flex: 1,
                  minHeight: 18,
                  bgcolor: stage.complete ? ILHA_PALETTE.primary : ILHA_PALETTE.grid,
                  my: 0.25,
                  opacity: stage.complete ? 0.4 : 0.3,
                }}
              />
            )}
          </Box>
          <Box sx={{ flex: 1, pb: 1.5 }}>
            <Stack direction="row" alignItems="baseline" spacing={1}>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ color: stage.complete ? "text.primary" : "text.secondary" }}
              >
                {stage.label}
              </Typography>
              {stage.time && (
                <Typography variant="caption" color="text.secondary">
                  {stage.date} · {stage.time}
                </Typography>
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
              {stage.note}
            </Typography>
            {stage.complete && (
              <Stack direction="row" spacing={0.5} mt={0.25}>
                <Chip
                  label={`+${stage.elapsedFromPrevious}`}
                  size="small"
                  variant="outlined"
                  sx={{ height: 18, fontSize: 10 }}
                />
                <Chip
                  label={`total ${stage.elapsedFromStart}`}
                  size="small"
                  variant="outlined"
                  sx={{ height: 18, fontSize: 10 }}
                />
              </Stack>
            )}
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
