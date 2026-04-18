import ReactECharts from "echarts-for-react";
import { Box } from "@mui/material";
import { baseChartOption } from "../../utils/echartsTheme";
import type { IlhaResumo } from "../../types";
import { IlhaCard } from "../../components/IlhaCard";
import { ilhaTokens } from "../../theme/tokens";

export function ThemeIntentMatrix({ data }: { data: IlhaResumo }) {
  const matrix = data.aggregates.themeIntentMatrix;
  const themes = Array.from(new Set(matrix.map(([t]) => t)));
  const intents = Array.from(new Set(matrix.map(([, i]) => i)));
  const maxVal = matrix.reduce((m, [, , v]) => Math.max(m, v), 0);

  const option = {
    ...baseChartOption(),
    tooltip: {
      position: "top",
      backgroundColor: ilhaTokens.color.bgSurface,
      borderColor: ilhaTokens.color.border,
      borderWidth: 1,
      textStyle: {
        color: ilhaTokens.color.textPrimary,
        fontFamily: ilhaTokens.font.family,
        fontSize: 12,
      },
      formatter: (p: any) =>
        `${themes[p.value[1]]} × ${intents[p.value[0]]}: <b>${p.value[2]}</b>`,
    },
    grid: { top: 12, left: 120, right: 24, bottom: 72, containLabel: false },
    xAxis: {
      type: "category",
      data: intents,
      splitArea: { show: true, areaStyle: { color: ["transparent", ilhaTokens.color.bgSubtle] } },
      axisLabel: {
        rotate: 30,
        color: ilhaTokens.color.textSecondary,
        fontSize: 11,
        fontFamily: ilhaTokens.font.family,
      },
      axisLine: { lineStyle: { color: ilhaTokens.color.border } },
      axisTick: { show: false },
    },
    yAxis: {
      type: "category",
      data: themes,
      splitArea: { show: true, areaStyle: { color: ["transparent", ilhaTokens.color.bgSubtle] } },
      axisLabel: {
        color: ilhaTokens.color.textSecondary,
        fontSize: 11,
        fontFamily: ilhaTokens.font.family,
      },
      axisLine: { lineStyle: { color: ilhaTokens.color.border } },
      axisTick: { show: false },
    },
    visualMap: {
      min: 0,
      max: maxVal,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: 8,
      textStyle: {
        color: ilhaTokens.color.textTertiary,
        fontFamily: ilhaTokens.font.family,
        fontSize: 11,
      },
      inRange: {
        color: [ilhaTokens.color.bgSubtle, ilhaTokens.color.accentSoft, ilhaTokens.color.accent],
      },
    },
    series: [
      {
        name: "Ocorrências",
        type: "heatmap",
        data: matrix.map(([theme, intent, v]) => [
          intents.indexOf(intent),
          themes.indexOf(theme),
          v,
        ]),
        label: {
          show: true,
          fontFamily: ilhaTokens.font.family,
          fontSize: 11,
          color: ilhaTokens.color.textPrimary,
        },
        itemStyle: {
          borderColor: ilhaTokens.color.bgSurface,
          borderWidth: 1,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 8,
            shadowColor: "rgba(16,24,40,0.12)",
          },
        },
      },
    ],
  };

  return (
    <IlhaCard title="Tema × intenção" subtitle="Ocorrências cruzadas no intervalo">
      <Box sx={{ height: 40 * Math.max(themes.length, 3) + 120 }}>
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
