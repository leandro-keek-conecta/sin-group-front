import type { EChartsOption } from "echarts";

export const ILHA_PALETTE = {
  primary: "#FF7A01",
  primarySoft: "rgba(255,122,1,0.18)",
  positive: "#5d9161",
  neutral: "#B0B0B0",
  negative: "#D9534F",
  text: "#2D2D2D",
  subtext: "#666",
  grid: "#E5E5E5",
};

export const baseChartOption = (): Partial<EChartsOption> => ({
  textStyle: {
    fontFamily: "Lato, sans-serif",
    color: ILHA_PALETTE.text,
  },
  grid: {
    top: 24,
    right: 16,
    bottom: 24,
    left: 24,
    containLabel: true,
  },
  tooltip: {
    backgroundColor: "rgba(255,255,255,0.98)",
    borderColor: ILHA_PALETTE.grid,
    borderWidth: 1,
    textStyle: { color: ILHA_PALETTE.text },
    extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-radius: 6px;",
  },
});

export const sentimentColor = (s: "positive" | "neutral" | "negative") =>
  s === "positive" ? ILHA_PALETTE.positive : s === "negative" ? ILHA_PALETTE.negative : ILHA_PALETTE.neutral;
