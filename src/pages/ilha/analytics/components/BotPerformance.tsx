import { Card, CardContent, Typography, Box, Stack, LinearProgress, Divider } from "@mui/material";
import type { IlhaResumo } from "../../types";
import { ILHA_PALETTE } from "../../utils/echartsTheme";
import { formatDuration } from "../../utils/intervals";

function formatSecondsPt(s: number): string {
  if (!isFinite(s) || s <= 0) return "0,0s";
  return `${s.toFixed(1).replace(".", ",")}s`;
}

function pctStr(n: number): string {
  return `${Math.round(n)}%`;
}

export function BotPerformance({ data }: { data: IlhaResumo }) {
  const {
    avgResponseSeconds,
    resolvedByBotPercent,
    transferredPercent,
    duplicatesPercent,
    performanceByTheme,
    totalConversations,
    totalMessages,
    averageDuration,
  } = data.aggregates;

  const metrics: Array<{ label: string; value: string; hint?: string }> = [
    {
      label: "Conversas",
      value: String(totalConversations),
      hint: `${totalMessages} mensagens`,
    },
    {
      label: "Duração média",
      value: formatDuration(averageDuration),
    },
    {
      label: "Resposta média",
      value: formatSecondsPt(avgResponseSeconds),
      hint: "por par mensagem-resposta",
    },
    {
      label: "Resolvido pelo bot",
      value: pctStr(resolvedByBotPercent),
    },
    {
      label: "Transferências",
      value: pctStr(transferredPercent),
      hint: "para atendente humano",
    },
    {
      label: "Duplicidades",
      value: pctStr(duplicatesPercent),
      hint: "mensagens reenviadas",
    },
  ];

  const maxTheme = performanceByTheme.reduce(
    (a, t) => (t.avgSeconds > a ? t.avgSeconds : a),
    0,
  );

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          05 — OPERAÇÃO
        </Typography>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Performance do bot
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)" },
            gap: 1.5,
          }}
        >
          {metrics.map((m) => (
            <Box
              key={m.label}
              sx={{
                p: 1.25,
                bgcolor: "action.hover",
                borderRadius: 1,
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                {m.label}
              </Typography>
              <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                {m.value}
              </Typography>
              {m.hint && (
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                  {m.hint}
                </Typography>
              )}
            </Box>
          ))}
        </Box>

        {performanceByTheme.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" fontWeight={700} mb={1}>
              Tempo de resposta por tema
            </Typography>
            <Stack spacing={1}>
              {performanceByTheme.slice(0, 6).map((row) => (
                <Box key={row.theme}>
                  <Stack direction="row" justifyContent="space-between" mb={0.25}>
                    <Typography variant="body2" fontWeight={600}>
                      {row.theme}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatSecondsPt(row.avgSeconds)} · {row.count} resp.
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={maxTheme > 0 ? (row.avgSeconds / maxTheme) * 100 : 0}
                    sx={{
                      height: 5,
                      borderRadius: 3,
                      bgcolor: "action.hover",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: ILHA_PALETTE.primary,
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
}
