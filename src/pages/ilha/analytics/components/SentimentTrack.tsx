import { Box, Typography } from "@mui/material";
import { ILHA_PALETTE } from "../../utils/echartsTheme";
import type { IlhaResumo } from "../../types";

export function SentimentTrack({ data }: { data: IlhaResumo }) {
  const d = data.aggregates.sentimentDistribution;
  const total = d.positive + d.neutral + d.negative || 1;
  const pct = (n: number) => `${(n / total) * 100}%`;
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">Distribuição</Typography>
      <Box sx={{ display: "flex", mt: 0.5, height: 10, borderRadius: 5, overflow: "hidden", bgcolor: ILHA_PALETTE.grid }}>
        <Box sx={{ width: pct(d.positive), bgcolor: ILHA_PALETTE.positive }} />
        <Box sx={{ width: pct(d.neutral), bgcolor: ILHA_PALETTE.neutral }} />
        <Box sx={{ width: pct(d.negative), bgcolor: ILHA_PALETTE.negative }} />
      </Box>
    </Box>
  );
}
