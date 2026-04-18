import { Box, CircularProgress, Typography, Grid } from "@mui/material";
import { useIlhaData } from "../hooks/useIlhaData";
import { TopIntentsBars } from "./components/TopIntentsBars";
import { TopThemesBars } from "./components/TopThemesBars";
import { SentimentDonut } from "./components/SentimentDonut";
import { SentimentTrack } from "./components/SentimentTrack";
import { BotPerformance } from "./components/BotPerformance";
import { ThemeIntentMatrix } from "./components/ThemeIntentMatrix";

export default function IlhaAnalytics() {
  const { data, isLoading, error } = useIlhaData();
  if (isLoading) return <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}><CircularProgress /></Box>;
  if (error || !data) return <Typography color="error" sx={{ p: 4 }}>Erro: {error?.message}</Typography>;
  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}><TopIntentsBars data={data} /></Grid>
        <Grid item xs={12} md={6}><TopThemesBars data={data} /></Grid>
        <Grid item xs={12} md={7}>
          <SentimentDonut data={data} />
          <Box sx={{ mt: 2 }}><SentimentTrack data={data} /></Box>
        </Grid>
        <Grid item xs={12} md={5}><BotPerformance data={data} /></Grid>
        <Grid item xs={12}><ThemeIntentMatrix data={data} /></Grid>
      </Grid>
    </Box>
  );
}
