import ReactECharts from "echarts-for-react";
import { Card, CardContent, Typography, Box, Stack, Chip } from "@mui/material";
import { ILHA_PALETTE, baseChartOption } from "../../utils/echartsTheme";
import type { IlhaResumo } from "../../types";

interface Props {
  data: IlhaResumo;
}

export function LeadScoreRing({ data }: Props) {
  const avgScore = data.users.length > 0 ? Math.round(data.users.reduce((s, u) => s + u.leadScore.score, 0) / data.users.length) : 0;
  const qualified = data.users.filter((u) => u.leadScore.qualified).length;
  const hot = data.users.filter((u) => u.leadScore.label === "Lead quente").length;

  const option = {
    ...baseChartOption(),
    series: [{
      type: "gauge",
      startAngle: 230,
      endAngle: -50,
      min: 0,
      max: 100,
      progress: { show: true, width: 18, itemStyle: { color: ILHA_PALETTE.primary } },
      axisLine: { lineStyle: { width: 18, color: [[1, ILHA_PALETTE.grid]] } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      pointer: { show: false },
      anchor: { show: false },
      detail: {
        valueAnimation: true,
        fontSize: 36,
        fontWeight: 700,
        color: ILHA_PALETTE.primary,
        offsetCenter: [0, 0],
        formatter: "{value}",
      },
      data: [{ value: avgScore }],
    }],
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">LEAD SCORE</Typography>
        <Typography variant="h6" fontWeight={700} mb={1}>Score médio</Typography>
        <Box sx={{ height: 200 }}>
          <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
          <Chip size="small" label={`${qualified} qualificado${qualified === 1 ? "" : "s"}`} sx={{ bgcolor: "rgba(255,122,1,0.12)", color: ILHA_PALETTE.primary, fontWeight: 600 }} />
          <Chip size="small" label={`${hot} quente${hot === 1 ? "" : "s"}`} variant="outlined" />
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Score médio dos {data.users.length} usuário{data.users.length === 1 ? "" : "s"} analisados.
        </Typography>
      </CardContent>
    </Card>
  );
}
