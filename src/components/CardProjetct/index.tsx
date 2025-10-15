import { useNavigate } from "react-router-dom";
import styles from "./cardProject.module.css";
import { Card, Box, Typography, Button } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import { useProject } from "@/context/projectContext";
import { usePowerBI } from "@/context/powerbiContext";
import EmbeddedReportCard from "./Dashboard/PowerBIEmbed";
import FolderIcon from '@mui/icons-material/Folder';

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type CardProjectProps = {
  id: number;
  name: string;
  logoUrl?: string;
  users?: User[];            // pode vir undefined da API
  mentions?: number;
  chartImgUrl?: string;
  groupId?: string;
  reportId?: string;
  token: string;
};

function EmptyState() {
  return (
    <Box className={styles.emptyState}>
      {/* SVG simples com animação via CSS */}
      <svg
        className={styles.emptyIcon}
        viewBox="0 0 64 64"
        aria-hidden="true"
        role="img"
      >
        <g fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="10" y="14" width="44" height="36" rx="4" ry="4" />
          <path d="M10 22h44" />
          <rect x="18" y="30" width="6" height="14" className={styles.bar1} />
          <rect x="29" y="26" width="6" height="18" className={styles.bar2} />
          <rect x="40" y="34" width="6" height="10" className={styles.bar3} />
        </g>
      </svg>
      <Typography variant="body2" sx={{ mt: 1, color: "#888", textAlign: "center" }}>
        Dashboard ainda não configurado
      </Typography>
      <Typography variant="caption" sx={{ color: "#aaa", textAlign: "center" }}>
        Mas não se Preocupe, estamos trabalhando nisso!
      </Typography>
    </Box>
  );
}

export default function CardProject({
  id,
  name,
  logoUrl,
  users = [],        // garante array
  groupId,
  reportId,
  token,
}: CardProjectProps) {
  const navigate = useNavigate();
  const { setgroupId, setReportId, setToken, setName } = useProject();
  const { setPages, setReportInstance } = usePowerBI();

  const handleSelect = () => {
    setPages([]);
    setReportInstance(null);
    setgroupId(groupId || "");
    setReportId(reportId || "");
    setToken(token || "");
    setName(name || "");
    navigate("/projeto");
  };

  const hasDashboard = Boolean(reportId && groupId);

  return (
    <Card className={styles.card}>
      <Box className={styles.header}>
        <FolderIcon sx={{ width: "20px", height: "20px", color: "#bdbdbd"}} />
        <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 500, }}>
          {name} 
        </Typography>
      </Box>

      <Box className={styles.content}>
        {hasDashboard ? (
          <div className={styles.embedBox}>
            <EmbeddedReportCard
              reportId={reportId as string}
              groupId={groupId as string}
              accessToken={token}
            />
          </div>
        ) : (
          <EmptyState />
        )}
      </Box>

      <Box className={styles.footer}>
        <Box className={styles.avatars}>
          {(users || []).slice(0, 3).map((user, idx) => (
            <Avatar
              key={user.id}
              sx={{
                width: 28,
                height: 28,
                ml: idx > 0 ? -1 : 0,
                border: "2px solid white",
              }}
            >
              {user?.name?.[0] ?? "?"}
            </Avatar>
          ))}
          {users.length > 3 && (
            <Avatar sx={{ width: 28, height: 28, ml: -1, bgcolor: "#ccc" }}>
              +{users.length - 3}
            </Avatar>
          )}
        </Box>

        <Button variant="contained" color="success" onClick={handleSelect}>
          Selecionar
        </Button>
      </Box>
    </Card>
  );
}
