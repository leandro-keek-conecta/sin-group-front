import { Card, CardContent, Typography, Box, Stack, Chip } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import type { IlhaResumo, Insight } from "../../types";

const TONE_CONFIG: Record<
  Insight["tone"],
  { color: string; bg: string; border: string; icon: typeof TrendingUpIcon }
> = {
  sale: {
    color: "#2F6E34",
    bg: "rgba(93,145,97,0.12)",
    border: "rgba(93,145,97,0.5)",
    icon: TrendingUpIcon,
  },
  risk: {
    color: "#A53F3B",
    bg: "rgba(217,83,79,0.12)",
    border: "rgba(217,83,79,0.5)",
    icon: WarningAmberIcon,
  },
  ops: {
    color: "#9A6700",
    bg: "rgba(224,168,0,0.15)",
    border: "rgba(224,168,0,0.5)",
    icon: BuildCircleIcon,
  },
  focus: {
    color: "#A85300",
    bg: "rgba(255,122,1,0.12)",
    border: "rgba(255,122,1,0.5)",
    icon: CenterFocusStrongIcon,
  },
  context: {
    color: "#3A5A7A",
    bg: "rgba(58,90,122,0.12)",
    border: "rgba(58,90,122,0.5)",
    icon: InfoOutlinedIcon,
  },
};

export function InsightsList({ data }: { data: IlhaResumo }) {
  const items = data.aggregates.insights ?? [];

  return (
    <Card>
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          07 — LEITURAS
        </Typography>
        <Typography variant="h6" fontWeight={700} mb={0.5}>
          Insights automáticos
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Gerados por regras sobre os eventos da amostra — prioridade: venda, risco, operação, foco, contexto.
        </Typography>

        {items.length === 0 ? (
          <Box
            sx={{
              p: 3,
              textAlign: "center",
              color: "text.secondary",
              bgcolor: "action.hover",
              borderRadius: 1,
            }}
          >
            Nenhum insight detectado nesta amostra.
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {items.map((insight) => (
              <InsightRow key={insight.id} insight={insight} />
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

function InsightRow({ insight }: { insight: Insight }) {
  const cfg = TONE_CONFIG[insight.tone];
  const Icon = cfg.icon;
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        p: 2,
        bgcolor: cfg.bg,
        borderRadius: 1,
        borderLeft: `3px solid ${cfg.border}`,
      }}
    >
      <Icon sx={{ color: cfg.color, mt: 0.25 }} />
      <Box sx={{ flex: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
          <Chip
            label={insight.badge}
            size="small"
            sx={{
              height: 20,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 0.5,
              color: cfg.color,
              bgcolor: "rgba(255,255,255,0.6)",
              border: `1px solid ${cfg.border}`,
            }}
          />
          <Typography fontWeight={700} sx={{ color: cfg.color }}>
            {insight.title}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {insight.description}
        </Typography>
      </Box>
    </Box>
  );
}
