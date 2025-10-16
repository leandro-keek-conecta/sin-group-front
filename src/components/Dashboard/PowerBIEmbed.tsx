import { PowerBIEmbed } from "powerbi-client-react";
import { Embed, models, Report } from "powerbi-client";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "../../pages/home/home.module.css";
import { useProject } from "@/context/projectContext";

interface EmbeddedReportProps {
  reportId: string;
  groupId: string;
  accessToken: string;
  onPagesLoaded?: (pages: { name: string; displayName: string }[]) => void;
  onReady?: (report: Report) => void;
}

export default function EmbeddedReport({
  reportId,
  groupId,
  accessToken,
  onPagesLoaded,
  onReady,
}: EmbeddedReportProps) {
  const reportRef = useRef<Report | null>(null);
  const pagesCallbackRef = useRef<typeof onPagesLoaded>();
  const readyCallbackRef = useRef<typeof onReady>();
  const { name } = useProject();
  const [backgroundActive, setBackgroundActive] = useState(true);

  useEffect(() => {
    pagesCallbackRef.current = onPagesLoaded;
  }, [onPagesLoaded]);

  useEffect(() => {
    setBackgroundActive(name === "Tarefas e Projetos");
    console.log(backgroundActive)
    console.log(name)
  }, [name]);

  useEffect(() => {
    readyCallbackRef.current = onReady;
  }, [onReady]);

  const handleLoaded = useCallback(async () => {
    const report = reportRef.current;
    if (!report) return;

    try {
      const pages = await report.getPages();
      const simplified = pages.map((page) => ({
        name: page.name,
        displayName: page.displayName,
      }));

      pagesCallbackRef.current?.(simplified);
    } catch (error) {
      console.error("Erro ao buscar paginas do relatorio:", error);
    }
  }, []);

  const handleRendered = useCallback(() => {
    const report = reportRef.current;
    if (!report) return;

    readyCallbackRef.current?.(report);
  }, []);

  useEffect(() => {
    return () => {
      if (!reportRef.current) return;

      try {
        reportRef.current.off("loaded", handleLoaded);
        reportRef.current.off("rendered", handleRendered);
      } catch {
        // ignore cleanup errors
      } finally {
        reportRef.current = null;
      }
    };
  }, [handleLoaded, handleRendered]);

  return (
    <div className={styles.iframe}>
      <PowerBIEmbed
        embedConfig={{
          type: "report",
          id: reportId,
          embedUrl: `https://app.powerbi.com/reportEmbed?reportId=${reportId}&groupId=${groupId}`,
          accessToken,
          tokenType: models.TokenType.Aad,
          settings: {
            panes: {
              filters: { visible: false },
              pageNavigation: { visible: false },
            },
            background: models.BackgroundType.Default,
          },
        }}
        getEmbeddedComponent={(embeddedReport: Embed) => {
          if (!embeddedReport) return;

          if (reportRef.current) {
            try {
              reportRef.current.off("loaded", handleLoaded);
              reportRef.current.off("rendered", handleRendered);
            } catch {
              // ignore detach errors
            }
          }

          const report = embeddedReport as Report;
          reportRef.current = report;
          pagesCallbackRef.current?.([]);

          try {
            report.on("loaded", handleLoaded);
            report.on("rendered", handleRendered);
          } catch (error) {
            console.error("Erro ao vincular eventos do relatorio:", error);
          }
        }}
        cssClassName={styles.powerbiEmbed}
      />
    </div>
  );
}
