import type { EChartsOption } from "echarts";
import { ilhaTokens } from "../theme/tokens";

export const ILHA_PALETTE = {
  primary: ilhaTokens.color.accent,
  primaryHover: ilhaTokens.color.accentHover,
  primarySoft: ilhaTokens.color.accentSoft,
  positive: ilhaTokens.color.success,
  neutral: ilhaTokens.color.textTertiary,
  negative: ilhaTokens.color.danger,
  text: ilhaTokens.color.textPrimary,
  subtext: ilhaTokens.color.textSecondary,
  grid: ilhaTokens.color.border,
  surface: ilhaTokens.color.bgSurface,
};

export const baseChartOption = (): Partial<EChartsOption> => ({
  color: [
    ILHA_PALETTE.primary,
    ILHA_PALETTE.positive,
    ILHA_PALETTE.subtext,
    ILHA_PALETTE.negative,
    "#1E40AF",
    "#B45309",
  ],
  textStyle: {
    fontFamily: ilhaTokens.font.family,
    color: ILHA_PALETTE.subtext,
    fontSize: 12,
  },
  grid: {
    top: 20,
    right: 12,
    bottom: 24,
    left: 8,
    containLabel: true,
  },
  tooltip: {
    backgroundColor: ILHA_PALETTE.surface,
    borderColor: ILHA_PALETTE.grid,
    borderWidth: 1,
    textStyle: {
      color: ILHA_PALETTE.text,
      fontFamily: ilhaTokens.font.family,
      fontSize: 12,
    },
    extraCssText: `box-shadow: ${ilhaTokens.shadow.md}; border-radius: ${ilhaTokens.radius.md}px; padding: 8px 10px;`,
  },
  legend: {
    textStyle: {
      color: ILHA_PALETTE.subtext,
      fontFamily: ilhaTokens.font.family,
      fontSize: 12,
    },
    itemWidth: 10,
    itemHeight: 10,
    itemGap: 12,
  },
});

export const sentimentColor = (s: "positive" | "neutral" | "negative") =>
  s === "positive"
    ? ILHA_PALETTE.positive
    : s === "negative"
      ? ILHA_PALETTE.negative
      : ILHA_PALETTE.neutral;
