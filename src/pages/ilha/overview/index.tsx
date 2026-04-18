import { Box, CircularProgress, Typography } from "@mui/material";
import { useIlhaData } from "../hooks/useIlhaData";
import { LeadScoreRing } from "./components/LeadScoreRing";
import { ConversionFunnel } from "./components/ConversionFunnel";
import { IlhaPageHeader } from "../components/IlhaPageHeader";
import { IlhaKpiStrip } from "../components/IlhaKpiStrip";
import { ilhaTokens } from "../theme/tokens";

export default function IlhaOverview() {
  const { data, isLoading, error } = useIlhaData();

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress sx={{ color: ilhaTokens.color.accent }} />
      </Box>
    );
  }
  if (error || !data) {
    return (
      <Typography sx={{ p: 4, color: ilhaTokens.color.danger }}>
        Erro: {error?.message}
      </Typography>
    );
  }

  const totalUsers = data.users.length;
  const subtitle = `${totalUsers} usuário${totalUsers === 1 ? "" : "s"} · ${data.aggregates.totalConversations} conversa${
    data.aggregates.totalConversations === 1 ? "" : "s"
  } · ${data.aggregates.totalMessages} mensagens`;

  return (
    <Box
      sx={{
        px: { xs: `${ilhaTokens.space.lg}px`, md: `${ilhaTokens.space["2xl"]}px` },
        pb: `${ilhaTokens.space["3xl"]}px`,
      }}
    >
      <IlhaPageHeader title="Visão geral" subtitle={subtitle} />

      <Box sx={{ mb: `${ilhaTokens.space["2xl"]}px` }}>
        <IlhaKpiStrip items={data.aggregates.kpis ?? []} />
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: `${ilhaTokens.space.lg}px`,
          gridTemplateColumns: {
            xs: "1fr",
            md: "2fr 1fr",
          },
          alignItems: "stretch",
        }}
      >
        <ConversionFunnel data={data} />
        <LeadScoreRing data={data} />
      </Box>
    </Box>
  );
}
