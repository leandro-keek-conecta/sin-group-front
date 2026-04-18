import { Card, CardContent, Typography, Chip, Box, Stack } from "@mui/material";
import type { IlhaResumo, IlhaKpi } from "../../types";

interface Props {
  data: IlhaResumo;
}

export function HeroCard({ data }: Props) {
  const totalUsers = data.users.length;
  const kpis = data.aggregates.kpis ?? [];

  return (
    <Card
      sx={{
        bgcolor: "#2A2A2A",
        color: "white",
        overflow: "hidden",
        backgroundImage:
          "radial-gradient(circle at 100% 0%, rgba(255,122,1,0.18), transparent 40%), radial-gradient(circle at 0% 100%, rgba(255,122,1,0.08), transparent 40%)",
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Chip
          label="CONVERSATION INTELLIGENCE"
          size="small"
          sx={{
            bgcolor: "rgba(255,122,1,0.15)",
            color: "#FF7A01",
            fontWeight: 600,
            letterSpacing: 1,
            mb: 2,
          }}
        />
        <Typography variant="h3" fontWeight={700} fontFamily="Lato" mb={0.5}>
          Visão executiva
        </Typography>
        <Typography
          variant="h4"
          fontStyle="italic"
          color="rgba(255,255,255,0.75)"
          fontFamily="Lato"
          mb={2.5}
        >
          da jornada do lead.
        </Typography>
        <Typography sx={{ opacity: 0.85, maxWidth: 680, mb: 2.5 }}>
          {totalUsers} usuário{totalUsers === 1 ? "" : "s"} analisado
          {totalUsers === 1 ? "" : "s"} ·{" "}
          {data.aggregates.totalConversations} conversa
          {data.aggregates.totalConversations === 1 ? "" : "s"} ·{" "}
          {data.aggregates.totalMessages} mensagens.
        </Typography>

        <Stack direction="row" spacing={1} mb={3} flexWrap="wrap" useFlexGap>
          <Chip
            label={`${data.aggregates.sentimentDistribution.positive} positivas`}
            sx={{ bgcolor: "rgba(93,145,97,0.25)", color: "#9ED3A3" }}
          />
          <Chip
            label={`${data.aggregates.sentimentDistribution.neutral} neutras`}
            sx={{ bgcolor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)" }}
          />
          <Chip
            label={`${data.aggregates.sentimentDistribution.negative} negativas`}
            sx={{ bgcolor: "rgba(217,83,79,0.25)", color: "#F0A2A0" }}
          />
        </Stack>

        {kpis.length > 0 && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(3, 1fr)",
                md: "repeat(6, 1fr)",
              },
              gap: 1.5,
            }}
          >
            {kpis.map((kpi) => (
              <KpiCell key={kpi.label} kpi={kpi} />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function KpiCell({ kpi }: { kpi: IlhaKpi }) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1.5,
        bgcolor: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(4px)",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: "rgba(255,255,255,0.65)",
          fontWeight: 600,
          letterSpacing: 0.5,
          textTransform: "uppercase",
          fontSize: 10,
        }}
      >
        {kpi.label}
      </Typography>
      <Typography fontWeight={700} fontSize={22} lineHeight={1.15}>
        {kpi.value}
      </Typography>
      {kpi.hint && (
        <Typography
          variant="caption"
          sx={{ color: "rgba(255,255,255,0.55)", fontSize: 10 }}
        >
          {kpi.hint}
        </Typography>
      )}
    </Box>
  );
}
