import ReactECharts from "echarts-for-react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { ILHA_PALETTE, baseChartOption } from "../../utils/echartsTheme";
import type { IlhaResumo } from "../../types";

export function ThemeIntentMatrix({ data }: { data: IlhaResumo }) {
  const matrix = data.aggregates.themeIntentMatrix;
  const themes = Array.from(new Set(matrix.map(([t]) => t)));
  const intents = Array.from(new Set(matrix.map(([, i]) => i)));
  const maxVal = matrix.reduce((m, [, , v]) => Math.max(m, v), 0);

  const option = {
    ...baseChartOption(),
    tooltip: { position: "top", formatter: (p: any) => `${themes[p.value[1]]} × ${intents[p.value[0]]}: ${p.value[2]}` },
    grid: { top: 40, left: 100, right: 20, bottom: 60, containLabel: false },
    xAxis: { type: "category", data: intents, splitArea: { show: true }, axisLabel: { rotate: 30 } },
    yAxis: { type: "category", data: themes, splitArea: { show: true } },
    visualMap: {
      min: 0,
      max: maxVal,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: 5,
      inRange: { color: ["#FFE8D4", ILHA_PALETTE.primary] },
    },
    series: [{
      name: "Ocorrências",
      type: "heatmap",
      data: matrix.map(([theme, intent, v]) => [intents.indexOf(intent), themes.indexOf(theme), v]),
      label: { show: true },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.5)" } },
    }],
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="overline" color="text.secondary">06 — CRUZAMENTO</Typography>
        <Typography variant="h6" fontWeight={700} mb={1}>Tema × intenção</Typography>
        <Box sx={{ height: 40 * Math.max(themes.length, 3) + 100 }}>
          <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
        </Box>
      </CardContent>
    </Card>
  );
}
