import { Box, CircularProgress, Typography } from "@mui/material";
import { useIlhaData } from "../hooks/useIlhaData";
import { TopIntentsBars } from "./components/TopIntentsBars";
import { TopThemesBars } from "./components/TopThemesBars";
import { SentimentDonut } from "./components/SentimentDonut";
import { SentimentTrack } from "./components/SentimentTrack";
import { BotPerformance } from "./components/BotPerformance";
import { ThemeIntentMatrix } from "./components/ThemeIntentMatrix";
import { IlhaPageHeader } from "../components/IlhaPageHeader";
import { ilhaTokens } from "../theme/tokens";

export default function IlhaAnalytics() {
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
        title="Análises"
        subtitle="Classificação, sentimento e performance da operação"
      />

      <Box
        sx={{
          display: "grid",
          gap: `${ilhaTokens.space.lg}px`,
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          alignItems: "stretch",
        }}
      >
        <TopIntentsBars data={data} />
        <TopThemesBars data={data} />
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: `${ilhaTokens.space.lg}px`,
          gridTemplateColumns: { xs: "1fr", md: "7fr 5fr" },
          mt: `${ilhaTokens.space.lg}px`,
          alignItems: "stretch",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: `${ilhaTokens.space.lg}px`,
          }}
        >
          <SentimentDonut data={data} />
          <SentimentTrack data={data} />
        </Box>
        <BotPerformance data={data} />
      </Box>

      <Box sx={{ mt: `${ilhaTokens.space.lg}px` }}>
        <ThemeIntentMatrix data={data} />
      </Box>
    </Box>
  );
}
