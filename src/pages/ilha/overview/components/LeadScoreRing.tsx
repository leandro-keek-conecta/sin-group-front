import ReactECharts from "echarts-for-react";
import { Box, Stack, Typography } from "@mui/material";
import type { IlhaResumo } from "../../types";
import { ILHA_PALETTE, baseChartOption } from "../../utils/echartsTheme";
import { IlhaCard } from "../../components/IlhaCard";
import { ilhaTokens, leadLabelColor } from "../../theme/tokens";

interface Props {
  data: IlhaResumo;
}

export function LeadScoreRing({ data }: Props) {
  const avgScore =
    data.users.length > 0
      ? Math.round(
          data.users.reduce((s, u) => s + u.leadScore.score, 0) /
            data.users.length,
        )
      : 0;
  const qualified = data.users.filter((u) => u.leadScore.qualified).length;
  const hot = data.users.filter((u) => u.leadScore.label === "Lead quente").length;
  const warm = data.users.filter((u) => u.leadScore.label === "Lead morno").length;
  const cold = data.users.filter((u) => u.leadScore.label === "Lead frio").length;

  const option = {
    ...baseChartOption(),
    series: [
      {
        type: "gauge",
        startAngle: 220,
        endAngle: -40,
        min: 0,
        max: 100,
        radius: "88%",
        progress: {
          show: true,
          width: 12,
          roundCap: true,
          itemStyle: { color: ILHA_PALETTE.primary },
        },
        axisLine: {
          lineStyle: {
            width: 12,
            color: [[1, ilhaTokens.color.bgSubtle]],
          },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: { show: false },
        anchor: { show: false },
        detail: {
          valueAnimation: true,
          fontSize: 32,
          fontWeight: 700,
          fontFamily: ilhaTokens.font.family,
          color: ilhaTokens.color.textPrimary,
          offsetCenter: [0, "-5%"],
          formatter: "{value}",
        },
        title: {
          offsetCenter: [0, "35%"],
          fontSize: ilhaTokens.font.micro.size,
          fontWeight: ilhaTokens.font.micro.weight,
          color: ilhaTokens.color.textTertiary,
        },
        data: [{ value: avgScore, name: "SCORE MÉDIO" }],
      },
    ],
  };

  const breakdown = [
    { label: "Lead quente", value: hot, key: "Lead quente" as const },
    { label: "Lead morno", value: warm, key: "Lead morno" as const },
    { label: "Lead frio", value: cold, key: "Lead frio" as const },
  ];

  return (
    <IlhaCard title="Score médio" subtitle={`${data.users.length} usuário${data.users.length === 1 ? "" : "s"} analisado${data.users.length === 1 ? "" : "s"}`}>
      <Box sx={{ height: 180 }}>
        <ReactECharts option={option} style={{ height: "100%", width: "100%" }} notMerge lazyUpdate />
      </Box>
      <Stack spacing={`${ilhaTokens.space.sm}px`} sx={{ mt: `${ilhaTokens.space.md}px` }}>
        {breakdown.map((b) => {
          const tone = leadLabelColor[b.key];
          return (
            <Stack
              key={b.key}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={`${ilhaTokens.space.sm}px`} alignItems="center">
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: tone.dot,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: ilhaTokens.font.body.size,
                    color: ilhaTokens.color.textSecondary,
                  }}
                >
                  {b.label}
                </Typography>
              </Stack>
              <Typography
                sx={{
                  fontSize: ilhaTokens.font.bodyStrong.size,
                  fontWeight: ilhaTokens.font.bodyStrong.weight,
                  color: ilhaTokens.color.textPrimary,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {b.value}
              </Typography>
            </Stack>
          );
        })}
        <Box
          sx={{
            mt: `${ilhaTokens.space.xs}px`,
            pt: `${ilhaTokens.space.sm}px`,
            borderTop: `1px solid ${ilhaTokens.color.border}`,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography
            sx={{
              fontSize: ilhaTokens.font.caption.size,
              color: ilhaTokens.color.textTertiary,
            }}
          >
            Qualificados
          </Typography>
          <Typography
            sx={{
              fontSize: ilhaTokens.font.bodyStrong.size,
              fontWeight: ilhaTokens.font.bodyStrong.weight,
              color: ilhaTokens.color.accent,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {qualified}
          </Typography>
        </Box>
      </Stack>
    </IlhaCard>
  );
}
