import { Box, Stack, Typography } from "@mui/material";
import type { IlhaResumo } from "../../types";
import { IlhaCard } from "../../components/IlhaCard";
import { ilhaTokens } from "../../theme/tokens";
import { ILHA_PALETTE } from "../../utils/echartsTheme";

export function SentimentTrack({ data }: { data: IlhaResumo }) {
  const d = data.aggregates.sentimentDistribution;
  const total = d.positive + d.neutral + d.negative || 1;
  const segments = [
    { key: "positive", label: "Positivas", count: d.positive, color: ILHA_PALETTE.positive },
    { key: "neutral", label: "Neutras", count: d.neutral, color: ilhaTokens.color.textTertiary },
    { key: "negative", label: "Negativas", count: d.negative, color: ILHA_PALETTE.negative },
  ];

  return (
    <IlhaCard title="Distribuição em barra" subtitle="Participação de cada polaridade" dense>
      <Box
        sx={{
          display: "flex",
          height: 12,
          borderRadius: `${ilhaTokens.radius.pill}px`,
          overflow: "hidden",
          bgcolor: ilhaTokens.color.bgSubtle,
        }}
      >
        {segments.map((s) => (
          <Box
            key={s.key}
            sx={{
              width: `${(s.count / total) * 100}%`,
              bgcolor: s.color,
              transition: `width ${ilhaTokens.transition.slow}`,
            }}
          />
        ))}
      </Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ mt: `${ilhaTokens.space.md}px` }}
      >
        {segments.map((s) => {
          const percent = Math.round((s.count / total) * 100);
          return (
            <Stack key={s.key} direction="row" spacing={`${ilhaTokens.space.xs}px`} alignItems="center">
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: s.color,
                }}
              />
              <Typography
                sx={{
                  fontSize: ilhaTokens.font.caption.size,
                  color: ilhaTokens.color.textSecondary,
                }}
              >
                {s.label}
              </Typography>
              <Typography
                sx={{
                  fontSize: ilhaTokens.font.caption.size,
                  fontWeight: ilhaTokens.font.bodyStrong.weight,
                  color: ilhaTokens.color.textPrimary,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {percent}%
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </IlhaCard>
  );
}
