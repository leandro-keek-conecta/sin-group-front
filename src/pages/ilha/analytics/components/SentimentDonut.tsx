import ReactECharts from "echarts-for-react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { ILHA_PALETTE, baseChartOption } from "../../utils/echartsTheme";
import type { IlhaResumo } from "../../types";

export function SentimentDonut({ data }: { data: IlhaResumo }) {
  const d = data.aggregates.sentimentDistribution;
  const total = d.positive + d.neutral + d.negative;
  const option = {
    ...baseChartOption(),
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    series: [{
      type: "pie",
      radius: ["55%", "80%"],
      avoidLabelOverlap: true,
      label: { show: false },
      itemStyle: { borderColor: "#fff", borderWidth: 2 },
      data: [
        { value: d.positive, name: "Positivas", itemStyle: { color: ILHA_PALETTE.positive } },
        { value: d.neutral, name: "Neutras", itemStyle: { color: ILHA_PALETTE.neutral } },
        { value: d.negative, name: "Negativas", itemStyle: { color: ILHA_PALETTE.negative } },
      ],
    }],
    graphic: {
      type: "text",
      left: "center",
      top: "center",
      style: { text: `${total}\nmensagens`, textAlign: "center", fill: ILHA_PALETTE.text, font: "700 18px Lato" },
    },
  };
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">04 — QUALITATIVO</Typography>
        <Typography variant="h6" fontWeight={700} mb={1}>Análise de sentimento</Typography>
        <Box sx={{ height: 280 }}>
          <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
        </Box>
      </CardContent>
    </Card>
  );
}
