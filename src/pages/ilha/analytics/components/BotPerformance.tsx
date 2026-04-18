import { Box, Stack, Typography } from "@mui/material";
import type { IlhaResumo } from "../../types";
import { IlhaCard } from "../../components/IlhaCard";
import { ilhaTokens } from "../../theme/tokens";
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
    { label: "Duração média", value: formatDuration(averageDuration) },
    {
      label: "Resposta média",
      value: formatSecondsPt(avgResponseSeconds),
      hint: "por par pergunta/resposta",
    },
    { label: "Resolvido pelo bot", value: pctStr(resolvedByBotPercent) },
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
    <IlhaCard title="Performance do bot" subtitle="Operação consolidada no intervalo">
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)" },
          border: `1px solid ${ilhaTokens.color.border}`,
          borderRadius: `${ilhaTokens.radius.md}px`,
          overflow: "hidden",
        }}
      >
        {metrics.map((m, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          return (
            <Box
              key={m.label}
              sx={{
                p: `${ilhaTokens.space.md}px ${ilhaTokens.space.lg}px`,
                borderLeft: col > 0 ? `1px solid ${ilhaTokens.color.border}` : "none",
                borderTop: row > 0 ? `1px solid ${ilhaTokens.color.border}` : "none",
              }}
            >
              <Typography
                sx={{
                  fontSize: ilhaTokens.font.micro.size,
                  fontWeight: ilhaTokens.font.micro.weight,
                  letterSpacing: ilhaTokens.font.micro.letterSpacing,
                  color: ilhaTokens.color.textTertiary,
                  textTransform: "uppercase",
                }}
              >
                {m.label}
              </Typography>
              <Typography
                sx={{
                  fontSize: ilhaTokens.font.display.size,
                  fontWeight: ilhaTokens.font.display.weight,
                  lineHeight: 1.2,
                  color: ilhaTokens.color.textPrimary,
                  mt: "2px",
                }}
              >
                {m.value}
              </Typography>
              {m.hint && (
                <Typography
                  sx={{
                    fontSize: ilhaTokens.font.caption.size,
                    color: ilhaTokens.color.textTertiary,
                    mt: "2px",
                  }}
                >
                  {m.hint}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>

      {performanceByTheme.length > 0 && (
        <Box sx={{ mt: `${ilhaTokens.space.lg}px` }}>
          <Typography
            sx={{
              fontSize: ilhaTokens.font.h2.size,
              fontWeight: ilhaTokens.font.h2.weight,
              color: ilhaTokens.color.textPrimary,
              mb: `${ilhaTokens.space.sm}px`,
            }}
          >
            Tempo de resposta por tema
          </Typography>
          <Stack spacing={`${ilhaTokens.space.sm}px`}>
            {performanceByTheme.slice(0, 6).map((row) => {
              const share = maxTheme > 0 ? row.avgSeconds / maxTheme : 0;
              return (
                <Box key={row.theme}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: "4px" }}>
                    <Typography
                      sx={{
                        fontSize: ilhaTokens.font.body.size,
                        fontWeight: ilhaTokens.font.bodyStrong.weight,
                        color: ilhaTokens.color.textPrimary,
                      }}
                    >
                      {row.theme}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: ilhaTokens.font.caption.size,
                        color: ilhaTokens.color.textTertiary,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {formatSecondsPt(row.avgSeconds)} · {row.count} resp.
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      height: 4,
                      borderRadius: `${ilhaTokens.radius.pill}px`,
                      bgcolor: ilhaTokens.color.bgSubtle,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        width: `${share * 100}%`,
                        height: "100%",
                        bgcolor: ilhaTokens.color.accent,
                        transition: `width ${ilhaTokens.transition.slow}`,
                      }}
                    />
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Box>
      )}
    </IlhaCard>
  );
}
