import { PowerBIEmbed } from "powerbi-client-react";
import styles from "./EmbeddedReport.module.css";
import { models, Embed } from "powerbi-client";

interface EmbeddedReportProps {
  reportId: string;
  groupId: string;
  accessToken: string;
  height?: string;
}

export default function EmbeddedReportCard({
  reportId,
  groupId,
  accessToken,
}: EmbeddedReportProps) {
  const embedConfig = {
    type: "report",
    id: reportId,
    groupId: groupId,
    accessToken: accessToken,
    tokenType: models.TokenType.Aad,
    settings: {
      panes: {
        filters: { visible: false },
        pageNavigation: { visible: false },
      },
      background: models.BackgroundType.Transparent,
    },
  };

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <PowerBIEmbed
        embedConfig={embedConfig}
        cssClassName={styles.pbiEmbed}
        getEmbeddedComponent={(embed: Embed) => {}}
      />
    </div>
  );
}
