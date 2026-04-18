import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import { useProject } from "@/context/projectContext";
import { Layout } from "@/components/Layout";
import { ILHA_PROJECT_ID } from "../constants";
import { ilhaTokens } from "../theme/tokens";
import { IlhaTopBar } from "./IlhaTopBar";

const routeTitles: Record<string, string> = {
  "/ilha": "Ilha — Visão geral",
  "/ilha/": "Ilha — Visão geral",
  "/ilha/visao-geral": "Ilha — Visão geral",
  "/ilha/conversas": "Ilha — Conversas",
  "/ilha/analises": "Ilha — Análises",
  "/ilha/insights": "Ilha — Insights",
};

export default function IlhaLayout() {
  const { projectId } = useProject();
  const { pathname } = useLocation();

  if (projectId !== ILHA_PROJECT_ID) {
    return <Navigate to="/home" replace />;
  }

  const titulo = routeTitles[pathname] ?? "Ilha — Conversation Intelligence";

  return (
    <Layout titulo={titulo}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100%",
          bgcolor: ilhaTokens.color.bgCanvas,
          fontFamily: ilhaTokens.font.family,
        }}
      >
        <IlhaTopBar />
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <Outlet />
        </Box>
      </Box>
    </Layout>
  );
}
