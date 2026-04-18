import { Navigate, Outlet } from "react-router-dom";
import { useProject } from "@/context/projectContext";
import { Layout } from "@/components/Layout";
import { ILHA_PROJECT_ID } from "../constants";

export default function IlhaLayout() {
  const { projectId } = useProject();

  if (projectId !== ILHA_PROJECT_ID) {
    return <Navigate to="/home" replace />;
  }

  return (
    <Layout titulo="Ilha — Conversation Intelligence">
      <Outlet />
    </Layout>
  );
}
