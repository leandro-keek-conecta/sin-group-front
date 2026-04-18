import ReactECharts from "echarts-for-react";
import { Box } from "@mui/material";
import { ILHA_PALETTE, baseChartOption } from "../../utils/echartsTheme";
import { IlhaCard } from "../../components/IlhaCard";
import { ilhaTokens } from "../../theme/tokens";

interface Props {
  title: string;
  subtitle?: string;
  items: { label: string; count: number }[];
  max?: number;
}

export function HorizontalBars({ title, subtitle, items, max = 8 }: Props) {
  const top = items.slice(0, max);
  const option = {
    ...baseChartOption(),
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { top: 12, right: 24, bottom: 24, left: 8, containLabel: true },
    xAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: ilhaTokens.color.border, type: "dashed" } },
      axisLabel: { color: ilhaTokens.color.textTertiary, fontSize: 11 },
    },
    yAxis: {
      type: "category",
      data: top.map((i) => i.label).reverse(),
      axisTick: { show: false },
      axisLine: { lineStyle: { color: ilhaTokens.color.border } },
      axisLabel: { color: ilhaTokens.color.textSecondary, fontSize: 12 },
    },
    series: [
      {
        type: "bar",
        barMaxWidth: 14,
        data: top.map((i) => i.count).reverse(),
        itemStyle: {
          color: ILHA_PALETTE.primary,
          borderRadius: [0, 4, 4, 0],
        },
        label: {
          show: true,
          position: "right",
          color: ilhaTokens.color.textPrimary,
          fontFamily: ilhaTokens.font.family,
          fontSize: 11,
          fontWeight: 600,
        },
        emphasis: {
          itemStyle: { color: ILHA_PALETTE.primaryHover },
        },
      },
    ],
  };
  return (
    <IlhaCard title={title} subtitle={subtitle} dense>
      <Box sx={{ height: Math.max(28 * top.length + 32, 180) }}>
        <ReactECharts
          option={option}
          style={{ height: "100%", width: "100%" }}
          notMerge
          lazyUpdate
        />
      </Box>
    </IlhaCard>
  );
}
