import ReactECharts from "echarts-for-react";
import { Box } from "@mui/material";
import { ILHA_PALETTE, baseChartOption } from "../../utils/echartsTheme";
import type { IlhaResumo } from "../../types";
import { IlhaCard } from "../../components/IlhaCard";
import { ilhaTokens } from "../../theme/tokens";

export function SentimentDonut({ data }: { data: IlhaResumo }) {
  const d = data.aggregates.sentimentDistribution;
  const total = d.positive + d.neutral + d.negative;
  const option = {
    ...baseChartOption(),
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: {
      bottom: 0,
      textStyle: {
        color: ilhaTokens.color.textSecondary,
        fontFamily: ilhaTokens.font.family,
        fontSize: 12,
      },
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 16,
    },
    series: [
      {
        type: "pie",
        radius: ["58%", "78%"],
        center: ["50%", "45%"],
        avoidLabelOverlap: true,
        label: { show: false },
        itemStyle: {
          borderColor: ilhaTokens.color.bgSurface,
          borderWidth: 3,
        },
        data: [
          {
            value: d.positive,
            name: "Positivas",
            itemStyle: { color: ILHA_PALETTE.positive },
          },
          {
            value: d.neutral,
            name: "Neutras",
            itemStyle: { color: ILHA_PALETTE.neutral },
          },
          {
            value: d.negative,
            name: "Negativas",
            itemStyle: { color: ILHA_PALETTE.negative },
          },
        ],
      },
    ],
    graphic: {
      type: "text",
      left: "center",
      top: "40%",
      style: {
        text: `${total}\nmensagens`,
        textAlign: "center",
        fill: ilhaTokens.color.textPrimary,
        font: `700 18px ${ilhaTokens.font.family}`,
      },
    },
  };
  return (
    <IlhaCard title="Análise de sentimento" subtitle="Distribuição consolidada das mensagens" dense>
      <Box sx={{ height: 260 }}>
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
