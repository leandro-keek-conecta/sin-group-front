import { Box, Stack, Typography } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import type { IlhaResumo, Insight } from "../../types";
import { IlhaCard } from "../../components/IlhaCard";
import { ilhaTokens, toneColor } from "../../theme/tokens";

const TONE_ICON: Record<Insight["tone"], typeof TrendingUpIcon> = {
  sale: TrendingUpIcon,
  risk: WarningAmberIcon,
  ops: BuildCircleIcon,
  focus: CenterFocusStrongIcon,
  context: InfoOutlinedIcon,
};

export function InsightsList({ data }: { data: IlhaResumo }) {
  const items = data.aggregates.insights ?? [];

  return (
    <IlhaCard
      title="Insights automáticos"
      subtitle="Leituras geradas por regras sobre a amostra (venda, risco, operação, foco, contexto)"
    >
      {items.length === 0 ? (
        <Box
          sx={{
            p: `${ilhaTokens.space.xl}px`,
            textAlign: "center",
            color: ilhaTokens.color.textTertiary,
            border: `1px dashed ${ilhaTokens.color.border}`,
            borderRadius: `${ilhaTokens.radius.md}px`,
            fontSize: ilhaTokens.font.body.size,
          }}
        >
          Nenhum insight detectado nesta amostra.
        </Box>
      ) : (
        <Stack spacing={`${ilhaTokens.space.sm}px`}>
          {items.map((insight) => (
            <InsightRow key={insight.id} insight={insight} />
          ))}
        </Stack>
      )}
    </IlhaCard>
  );
}

function InsightRow({ insight }: { insight: Insight }) {
  const tone = toneColor[insight.tone];
  const Icon = TONE_ICON[insight.tone];
  return (
    <Box
      sx={{
        display: "flex",
        gap: `${ilhaTokens.space.md}px`,
        p: `${ilhaTokens.space.md}px ${ilhaTokens.space.lg}px`,
        border: `1px solid ${ilhaTokens.color.border}`,
        borderLeft: `3px solid ${tone.fg}`,
        borderRadius: `${ilhaTokens.radius.md}px`,
        bgcolor: ilhaTokens.color.bgSurface,
        transition: `border-color ${ilhaTokens.transition.base}, background-color ${ilhaTokens.transition.base}`,
        "&:hover": {
          bgcolor: ilhaTokens.color.bgSubtle,
          borderColor: ilhaTokens.color.borderStrong,
          borderLeftColor: tone.fg,
        },
      }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: `${ilhaTokens.radius.sm}px`,
          bgcolor: tone.bg,
          color: tone.fg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 16 }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={`${ilhaTokens.space.sm}px`}
          sx={{ mb: "2px" }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              height: 18,
              px: "6px",
              borderRadius: `${ilhaTokens.radius.sm}px`,
              bgcolor: tone.bg,
              color: tone.fg,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              fontFamily: ilhaTokens.font.family,
            }}
          >
            {insight.badge}
          </Box>
          <Typography
            sx={{
              fontSize: ilhaTokens.font.body.size,
              fontWeight: ilhaTokens.font.h2.weight,
              color: ilhaTokens.color.textPrimary,
            }}
          >
            {insight.title}
          </Typography>
        </Stack>
        <Typography
          sx={{
            fontSize: ilhaTokens.font.body.size,
            color: ilhaTokens.color.textSecondary,
            lineHeight: ilhaTokens.font.body.lineHeight,
          }}
        >
          {insight.description}
        </Typography>
      </Box>
    </Box>
  );
}
