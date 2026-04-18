import { Box, Collapse, IconButton, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { IlhaConversation } from "../../types";
import { ilhaTokens } from "../../theme/tokens";

interface Props {
  conversations: IlhaConversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

function formatLabel(c: IlhaConversation): string {
  return c.startedAt.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

export function ConversationTabs({
  conversations,
  selectedId,
  onSelect,
  collapsed,
  onToggleCollapse,
}: Props) {
  if (conversations.length <= 1) return null;

  const activeLabel =
    conversations.find((c) => c.id === selectedId)?.startedAt.toLocaleDateString(
      "pt-BR",
      { day: "2-digit", month: "short" },
    ) ?? "—";

  return (
    <Box
      sx={{
        borderBottom: `1px solid ${ilhaTokens.color.border}`,
        bgcolor: ilhaTokens.color.bgSurface,
      }}
    >
      <Box
        onClick={onToggleCollapse}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: `${ilhaTokens.space.sm}px`,
          px: `${ilhaTokens.space["2xl"]}px`,
          py: `${ilhaTokens.space.sm}px`,
          cursor: "pointer",
          userSelect: "none",
          "&:hover": { bgcolor: ilhaTokens.color.bgSubtle },
        }}
      >
        <IconButton
          size="small"
          sx={{
            transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
            transition: `transform ${ilhaTokens.transition.base}`,
            color: ilhaTokens.color.textTertiary,
          }}
          aria-label={collapsed ? "expandir conversas" : "recolher conversas"}
        >
          <ExpandMoreIcon fontSize="small" />
        </IconButton>
        <Typography
          sx={{
            fontSize: ilhaTokens.font.caption.size,
            fontWeight: ilhaTokens.font.bodyStrong.weight,
            color: ilhaTokens.color.textSecondary,
          }}
        >
          {conversations.length} conversas · atual {activeLabel}
        </Typography>
      </Box>
      <Collapse in={!collapsed}>
        <Box
          sx={{
            display: "flex",
            gap: `${ilhaTokens.space.xs}px`,
            px: `${ilhaTokens.space["2xl"]}px`,
            pb: `${ilhaTokens.space.sm}px`,
            overflowX: "auto",
            "&::-webkit-scrollbar": { height: 4 },
            "&::-webkit-scrollbar-thumb": {
              background: ilhaTokens.color.border,
              borderRadius: 2,
            },
          }}
        >
          {conversations.map((c) => {
            const active = c.id === selectedId;
            return (
              <Box
                key={c.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(c.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(c.id);
                  }
                }}
                sx={{
                  px: `${ilhaTokens.space.md}px`,
                  py: "6px",
                  borderRadius: `${ilhaTokens.radius.md}px`,
                  border: `1px solid ${active ? ilhaTokens.color.accent : ilhaTokens.color.border}`,
                  bgcolor: active
                    ? ilhaTokens.color.accentSoft
                    : ilhaTokens.color.bgSurface,
                  color: active ? "#A85300" : ilhaTokens.color.textSecondary,
                  fontSize: ilhaTokens.font.caption.size,
                  fontWeight: ilhaTokens.font.bodyStrong.weight,
                  fontFamily: ilhaTokens.font.family,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  transition: `all ${ilhaTokens.transition.base}`,
                  "&:hover": {
                    borderColor: ilhaTokens.color.accent,
                  },
                }}
              >
                {formatLabel(c)}
              </Box>
            );
          })}
        </Box>
      </Collapse>
    </Box>
  );
}
