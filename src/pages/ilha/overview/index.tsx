import { Box, CircularProgress, Typography, Grid } from "@mui/material";
import { useIlhaData } from "../hooks/useIlhaData";
import { HeroCard } from "./components/HeroCard";
import { LeadScoreRing } from "./components/LeadScoreRing";
import { ConversionFunnel } from "./components/ConversionFunnel";

export default function IlhaOverview() {
  const { data, isLoading, error } = useIlhaData();

  if (isLoading) {
    return <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}><CircularProgress /></Box>;
  }
  if (error || !data) {
    return <Typography color="error" sx={{ p: 4 }}>Erro: {error?.message}</Typography>;
  }
  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}><HeroCard data={data} /></Grid>
        <Grid item xs={12} md={4}><LeadScoreRing data={data} /></Grid>
        <Grid item xs={12}><ConversionFunnel data={data} /></Grid>
      </Grid>
    </Box>
  );
}
