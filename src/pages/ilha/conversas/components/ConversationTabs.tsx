import { Box, Tabs, Tab, IconButton, Collapse } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { IlhaConversation } from "../../types";

interface Props {
  conversations: IlhaConversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function ConversationTabs({ conversations, selectedId, onSelect, collapsed, onToggleCollapse }: Props) {
  if (conversations.length <= 1) return null;
  const activeLabel =
    conversations.find((c) => c.id === selectedId)?.startedAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) ?? "—";

  return (
    <Box sx={{ borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
      <Box
        onClick={onToggleCollapse}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1,
          cursor: "pointer",
          userSelect: "none",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <IconButton
          size="small"
          sx={{
            transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
            transition: "transform 180ms",
          }}
          aria-label={collapsed ? "expandir conversas" : "recolher conversas"}
        >
          <ExpandMoreIcon fontSize="small" />
        </IconButton>
        <Box sx={{ fontSize: 13, fontWeight: 600, color: "text.secondary" }}>
          {conversations.length} conversas · {activeLabel}
        </Box>
      </Box>
      <Collapse in={!collapsed}>
        <Tabs
          value={selectedId ?? false}
          onChange={(_, v) => onSelect(v)}
          variant="scrollable"
          scrollButtons="auto"
          TabIndicatorProps={{ style: { backgroundColor: "#FF7A01" } }}
        >
          {conversations.map((c) => (
            <Tab
              key={c.id}
              value={c.id}
              label={c.startedAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
              sx={{ minHeight: 44, textTransform: "none", "&.Mui-selected": { color: "#FF7A01" } }}
            />
          ))}
        </Tabs>
      </Collapse>
    </Box>
  );
}
