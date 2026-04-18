import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useIlhaData } from "../hooks/useIlhaData";
import { InsightsList } from "./components/InsightsList";
import { JourneyTimeline } from "./components/JourneyTimeline";
import { IlhaPageHeader } from "../components/IlhaPageHeader";
import { ilhaTokens } from "../theme/tokens";

export default function IlhaInsights() {
  const { data, isLoading, error } = useIlhaData();
  if (isLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress sx={{ color: ilhaTokens.color.accent }} />
      </Box>
    );
  if (error || !data)
    return (
      <Typography sx={{ p: 4, color: ilhaTokens.color.danger }}>
        Erro: {error?.message}
      </Typography>
    );
  return (
    <Box
      sx={{
        px: { xs: `${ilhaTokens.space.lg}px`, md: `${ilhaTokens.space["2xl"]}px` },
        pb: `${ilhaTokens.space["3xl"]}px`,
      }}
    >
      <IlhaPageHeader
        title="Insights"
        subtitle="Leituras automáticas e jornada das últimas conversas"
      />
      <Stack spacing={`${ilhaTokens.space.lg}px`}>
        <InsightsList data={data} />
        <JourneyTimeline data={data} />
      </Stack>
    </Box>
  );
}
