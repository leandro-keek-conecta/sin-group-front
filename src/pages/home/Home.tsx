// ./pages/home.tsx
import { Layout } from "@/components/Layout";
import styles from "./home.module.css";
import EmbeddedReport from "../../components/Dashboard/PowerBIEmbed";
import { useEffect, useState } from "react";
import { getEmbedToken } from "@/services/powerBI/poweBIService";

export default function Home() {
  const [token, setToken] = useState("");
  const [user, setUser] = useState<any>({});

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  async function fetchToken() {
    try {
      const response = await getEmbedToken();
      setToken(response.data.access_token);
    } catch (error) {
      console.error("Erro ao atualizar token:", error);
    }
  }

  // Chamada inicial + a cada 80 minutos
  useEffect(() => {
    if (!user?.projeto?.reportId) return;

    fetchToken(); // Chamada inicial

    const intervalId = setInterval(() => {
      fetchToken();
    }, 80 * 60 * 1000); // 80 minutos em milissegundos

    return () => clearInterval(intervalId); // limpa ao desmontar
  }, [user?.projeto?.reportId]);

  const projeto = {
    reportId: user?.projeto?.reportId,
    groupId: `https://app.powerbi.com/reportEmbed?reportId=${user?.projeto?.reportId}&groupId=${user?.projeto?.groupId}`,
    token: token,
  };

  return (
    <Layout titulo="Apresentação e Introdução">
      {!user?.projeto?.dashUrl && (
        <EmbeddedReport
          reportId={projeto.reportId}
          groupId={projeto.groupId}
          accessToken={projeto.token}
        />
      )}
    </Layout>
  );
}
