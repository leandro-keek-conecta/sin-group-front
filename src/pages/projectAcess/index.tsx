// src/pages/projectAcess/index.tsx
import { Layout } from "@/components/Layout";
import { Box, CircularProgress, Fade, Typography, Button } from "@mui/material";
import { RocketLaunch, Assessment } from "@mui/icons-material";
import EmbeddedReport from "@/components/Dashboard/PowerBIEmbed";
import { useProject } from "@/context/projectContext";
import { useState } from "react";
import FolderSharedIcon from "@mui/icons-material/FolderShared";
import { usePowerBI } from "@/context/powerbiContext";

export default function ProjectAcess() {
  const { reportId, groupId, token, name } = useProject();
  const [loading, setLoading] = useState(false);
  const { setPages, setReportInstance } = usePowerBI();

  const isDashboardConfigured = reportId && groupId && token;

  return (
    <Layout titulo={name? name: "Dashboard em construção"} tituloIcon={<FolderSharedIcon fontSize="small" />}>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
          <CircularProgress />
        </Box>
      ) : isDashboardConfigured ? (
        <EmbeddedReport
          reportId={reportId}
          groupId={groupId}
          accessToken={token}
          onPagesLoaded={setPages}
          onReady={setReportInstance} // 👈 guarda o objeto para manipulação externa
        />
      ) : (
        <Fade in timeout={800}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="70vh"
            textAlign="center"
            sx={{ color: "#555" }}
          >
            <Assessment sx={{ fontSize: 80, color: "#1976d2", mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Seu dashboard está em construção 🚀
            </Typography>
            <Typography variant="body1" maxWidth={500} mb={3}>
              Em breve, você poderá acompanhar os principais indicadores e insights
              do seu projeto aqui.
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                borderRadius: 3,
                px: 4,
                backgroundColor: "#1976d2",
                textTransform: "none",
              }}
              startIcon={<RocketLaunch />}
              disabled
            >
              Em breve disponível
            </Button>
          </Box>
        </Fade>
      )}
    </Layout>
  );
}
