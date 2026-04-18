import { Box, InputBase, List, ListItemButton, Avatar, Typography, Chip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import type { IlhaUser } from "../../types";

interface Props {
  users: IlhaUser[];
  allUsersCount: number;
  search: string;
  onSearchChange: (v: string) => void;
  selectedUserId: string | null;
  onSelect: (id: string) => void;
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

function formatRelativeTime(d: Date): string {
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffMin < 60 * 24) return `${Math.floor(diffMin / 60)}h`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function ConversationsList({
  users,
  allUsersCount,
  search,
  onSearchChange,
  selectedUserId,
  onSelect,
}: Props) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", borderRight: "1px solid", borderColor: "divider" }}>
      <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={700}>Usuários</Typography>
          <Typography variant="caption" color="text.secondary">
            {search ? `${users.length} de ${allUsersCount}` : `${allUsersCount}`}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 0.75, bgcolor: "action.hover", borderRadius: 2 }}>
          <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
          <InputBase
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Pesquisar conversas"
            sx={{ flex: 1, fontSize: 14 }}
            inputProps={{ "aria-label": "pesquisar conversas" }}
          />
        </Box>
      </Box>
      <List sx={{ flex: 1, overflowY: "auto", p: 0 }}>
        {users.map((u) => {
          const latest = u.conversations[0];
          const lastMsg = latest?.messages[latest.messages.length - 1];
          const isActive = u.id === selectedUserId;
          const hasAssistant = latest?.transferredToAssistant;
          return (
            <ListItemButton
              key={u.id}
              selected={isActive}
              onClick={() => onSelect(u.id)}
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: "1px solid",
                borderColor: "divider",
                "&.Mui-selected": {
                  backgroundColor: "rgba(255,122,1,0.08)",
                  "&:hover": { backgroundColor: "rgba(255,122,1,0.12)" },
                },
              }}
            >
              <Avatar sx={{ mr: 1.5, width: 40, height: 40, bgcolor: "#FF7A01" }}>{initials(u.nome)}</Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                  <Typography noWrap fontWeight={600}>{u.nome}</Typography>
                  {lastMsg && (
                    <Typography variant="caption" color="text.secondary">
                      {formatRelativeTime(lastMsg.sentAt)}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.25 }}>
                  <Typography variant="body2" color="text.secondary" noWrap sx={{ flex: 1 }}>
                    {lastMsg?.content ?? u.latestStatus}
                  </Typography>
                  {u.leadScore.qualified && (
                    <Chip
                      label={u.leadScore.score}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: 10,
                        fontWeight: 700,
                        bgcolor: u.leadScore.label === "Lead quente" ? "rgba(255,122,1,0.18)" : "rgba(224,168,0,0.18)",
                        color: u.leadScore.label === "Lead quente" ? "#A85300" : "#9A6700",
                      }}
                    />
                  )}
                  {hasAssistant && <Chip label="ATENDENTE" size="small" sx={{ height: 18, fontSize: 10, bgcolor: "rgba(255,122,1,0.12)", color: "#FF7A01" }} />}
                </Box>
              </Box>
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
