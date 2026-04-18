import { Box, CircularProgress, Typography, Stack } from "@mui/material";
import { useIlhaData } from "../hooks/useIlhaData";
import { InsightsList } from "./components/InsightsList";
import { JourneyTimeline } from "./components/JourneyTimeline";

export default function IlhaInsights() {
  const { data, isLoading, error } = useIlhaData();
  if (isLoading) return <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}><CircularProgress /></Box>;
  if (error || !data) return <Typography color="error" sx={{ p: 4 }}>Erro: {error?.message}</Typography>;
  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <InsightsList data={data} />
        <JourneyTimeline data={data} />
      </Stack>
    </Box>
  );
}
