export const ilhaTokens = {
  color: {
    bgCanvas: "#F7F8FA",
    bgSurface: "#FFFFFF",
    bgSubtle: "#F3F4F6",
    border: "#E4E7EB",
    borderStrong: "#D0D5DD",
    textPrimary: "#1F2937",
    textSecondary: "#4B5563",
    textTertiary: "#6B7280",
    textDisabled: "#9CA3AF",
    accent: "#FF7A01",
    accentHover: "#E66D00",
    accentSoft: "rgba(255,122,1,0.10)",
    accentSofter: "rgba(255,122,1,0.04)",
    accentStrong: "rgba(255,122,1,0.16)",
    success: "#047857",
    successSoft: "rgba(4,120,87,0.10)",
    warning: "#B45309",
    warningSoft: "rgba(180,83,9,0.10)",
    danger: "#B91C1C",
    dangerSoft: "rgba(185,28,28,0.10)",
    info: "#1E40AF",
    infoSoft: "rgba(30,64,175,0.10)",
  },
  font: {
    family: '"Lato", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    display: { size: 20, weight: 700, lineHeight: 1.3 },
    h1: { size: 16, weight: 700, lineHeight: 1.4 },
    h2: { size: 14, weight: 600, lineHeight: 1.4 },
    body: { size: 13, weight: 400, lineHeight: 1.5 },
    bodyStrong: { size: 13, weight: 600, lineHeight: 1.5 },
    caption: { size: 12, weight: 400, lineHeight: 1.4 },
    micro: { size: 11, weight: 600, lineHeight: 1.3, letterSpacing: "0.05em" },
  },
  space: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
    "3xl": 32,
    "4xl": 48,
  },
  radius: {
    sm: 4,
    md: 6,
    lg: 8,
    pill: 999,
  },
  shadow: {
    sm: "0 1px 2px rgba(16,24,40,0.04)",
    md: "0 1px 3px rgba(16,24,40,0.08), 0 1px 2px rgba(16,24,40,0.04)",
    lg: "0 4px 12px rgba(16,24,40,0.10)",
  },
  transition: {
    base: "150ms ease-out",
    slow: "240ms ease-out",
  },
  layout: {
    topBarHeight: 56,
    tabBarHeight: 42,
    conversationsListWidth: 340,
    userInfoPanelWidth: 360,
  },
};

export type IlhaTokens = typeof ilhaTokens;

export const toneColor: Record<string, { fg: string; bg: string; border: string }> = {
  sale: {
    fg: ilhaTokens.color.success,
    bg: ilhaTokens.color.successSoft,
    border: "rgba(4,120,87,0.30)",
  },
  risk: {
    fg: ilhaTokens.color.danger,
    bg: ilhaTokens.color.dangerSoft,
    border: "rgba(185,28,28,0.30)",
  },
  ops: {
    fg: ilhaTokens.color.warning,
    bg: ilhaTokens.color.warningSoft,
    border: "rgba(180,83,9,0.30)",
  },
  focus: {
    fg: "#A85300",
    bg: ilhaTokens.color.accentSoft,
    border: "rgba(255,122,1,0.30)",
  },
  context: {
    fg: ilhaTokens.color.info,
    bg: ilhaTokens.color.infoSoft,
    border: "rgba(30,64,175,0.30)",
  },
};

export const leadLabelColor: Record<string, { fg: string; bg: string; dot: string }> = {
  "Lead quente": {
    fg: "#A85300",
    bg: ilhaTokens.color.accentSoft,
    dot: ilhaTokens.color.accent,
  },
  "Lead morno": {
    fg: ilhaTokens.color.warning,
    bg: ilhaTokens.color.warningSoft,
    dot: "#D98B0B",
  },
  "Lead frio": {
    fg: ilhaTokens.color.textTertiary,
    bg: ilhaTokens.color.bgSubtle,
    dot: ilhaTokens.color.textTertiary,
  },
};
