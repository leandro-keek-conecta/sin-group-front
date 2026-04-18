import ReactECharts from "echarts-for-react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { ILHA_PALETTE, baseChartOption } from "../../utils/echartsTheme";

interface Props {
  kicker: string;
  title: string;
  items: { label: string; count: number }[];
  max?: number;
}

export function HorizontalBars({ kicker, title, items, max = 8 }: Props) {
  const top = items.slice(0, max);
  const option = {
    ...baseChartOption(),
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    xAxis: { type: "value", axisLine: { show: false }, splitLine: { lineStyle: { color: ILHA_PALETTE.grid } } },
    yAxis: { type: "category", data: top.map((i) => i.label).reverse(), axisTick: { show: false } },
    series: [{
      type: "bar",
      data: top.map((i) => i.count).reverse(),
      itemStyle: { color: ILHA_PALETTE.primary, borderRadius: [0, 4, 4, 0] },
      label: { show: true, position: "right", color: ILHA_PALETTE.text },
    }],
  };
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">{kicker}</Typography>
        <Typography variant="h6" fontWeight={700} mb={1}>{title}</Typography>
        <Box sx={{ height: 32 * top.length + 40 }}>
          <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
        </Box>
      </CardContent>
    </Card>
  );
}
