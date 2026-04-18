import { Box, Stack, Typography } from "@mui/material";
import type { IlhaResumo } from "../../types";
import { IlhaCard } from "../../components/IlhaCard";
import { ilhaTokens } from "../../theme/tokens";

interface Props {
  data: IlhaResumo;
}

export function ConversionFunnel({ data }: Props) {
  const funnel = data.aggregates.funnel ?? [];
  const total = funnel[0]?.count ?? 0;

  const fallback = [
    "Iniciou conversa",
    "Tirou dúvida",
    "Pediu informação",
    "Pediu disponibilidade",
    "Transferido",
  ].map((label) => ({ label, count: 0 }));

  const rows = funnel.length > 0 ? funnel : fallback;

  return (
    <IlhaCard title="Funil de conversão" subtitle="Jornada consolidada dos usuários no intervalo">
      <Stack spacing={`${ilhaTokens.space.md}px`}>
        {rows.map((row, i) => {
          const share = total > 0 ? row.count / total : 0;
          const percent = Math.round(share * 100);
          const isFirst = i === 0;
          return (
            <Box key={row.label}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: "6px" }}
              >
                <Stack direction="row" spacing={`${ilhaTokens.space.sm}px`} alignItems="center">
                  <Box
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: `${ilhaTokens.radius.sm}px`,
                      bgcolor: ilhaTokens.color.bgSubtle,
                      color: ilhaTokens.color.textSecondary,
                      fontSize: ilhaTokens.font.micro.size,
                      fontWeight: ilhaTokens.font.micro.weight,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {i + 1}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: ilhaTokens.font.body.size,
                      fontWeight: ilhaTokens.font.bodyStrong.weight,
                      color: ilhaTokens.color.textPrimary,
                    }}
                  >
                    {row.label}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={`${ilhaTokens.space.md}px`} alignItems="center">
                  <Typography
                    sx={{
                      fontSize: ilhaTokens.font.caption.size,
                      color: ilhaTokens.color.textTertiary,
                      minWidth: 40,
                      textAlign: "right",
                    }}
                  >
                    {percent}%
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: ilhaTokens.font.bodyStrong.size,
                      fontWeight: ilhaTokens.font.bodyStrong.weight,
                      color: ilhaTokens.color.textPrimary,
                      minWidth: 40,
                      textAlign: "right",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {row.count}
                  </Typography>
                </Stack>
              </Stack>
              <Box
                sx={{
                  position: "relative",
                  height: 4,
                  borderRadius: `${ilhaTokens.radius.pill}px`,
                  bgcolor: ilhaTokens.color.bgSubtle,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: `${share * 100}%`,
                    bgcolor: isFirst ? ilhaTokens.color.accent : ilhaTokens.color.accentHover,
                    opacity: isFirst ? 1 : Math.max(0.45, 1 - i * 0.12),
                    transition: `width ${ilhaTokens.transition.slow}`,
                  }}
                />
              </Box>
            </Box>
          );
        })}
      </Stack>
    </IlhaCard>
  );
}
