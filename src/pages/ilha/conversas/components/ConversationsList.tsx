import { Box, InputBase, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import type { IlhaUser } from "../../types";
import { ilhaTokens, leadLabelColor } from "../../theme/tokens";

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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRight: `1px solid ${ilhaTokens.color.border}`,
        bgcolor: ilhaTokens.color.bgSurface,
      }}
    >
      <Box
        sx={{
          px: `${ilhaTokens.space.lg}px`,
          pt: `${ilhaTokens.space.md}px`,
          pb: `${ilhaTokens.space.sm}px`,
          borderBottom: `1px solid ${ilhaTokens.color.border}`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            mb: `${ilhaTokens.space.sm}px`,
          }}
        >
          <Typography
            sx={{
              fontSize: ilhaTokens.font.h2.size,
              fontWeight: ilhaTokens.font.h1.weight,
              color: ilhaTokens.color.textPrimary,
            }}
          >
            Conversas
          </Typography>
          <Typography
            sx={{
              fontSize: ilhaTokens.font.caption.size,
              color: ilhaTokens.color.textTertiary,
            }}
          >
            {search ? `${users.length} de ${allUsersCount}` : `${allUsersCount}`}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: `${ilhaTokens.space.sm}px`,
            px: `${ilhaTokens.space.md}px`,
            py: "6px",
            border: `1px solid ${ilhaTokens.color.border}`,
            borderRadius: `${ilhaTokens.radius.md}px`,
            transition: `border-color ${ilhaTokens.transition.base}`,
            "&:focus-within": {
              borderColor: ilhaTokens.color.accent,
            },
          }}
        >
          <SearchIcon sx={{ fontSize: 16, color: ilhaTokens.color.textTertiary }} />
          <InputBase
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Pesquisar por nome ou telefone"
            sx={{
              flex: 1,
              fontSize: ilhaTokens.font.body.size,
              fontFamily: ilhaTokens.font.family,
              color: ilhaTokens.color.textPrimary,
            }}
            inputProps={{ "aria-label": "pesquisar conversas" }}
          />
        </Box>
      </Box>
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {users.map((u) => {
          const latest = u.conversations[0];
          const lastMsg = latest?.messages[latest.messages.length - 1];
          const isActive = u.id === selectedUserId;
          const hasAssistant = latest?.transferredToAssistant;
          const leadTone = leadLabelColor[u.leadScore.label];
          return (
            <Box
              key={u.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(u.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(u.id);
                }
              }}
              sx={{
                display: "flex",
                gap: `${ilhaTokens.space.md}px`,
                px: `${ilhaTokens.space.lg}px`,
                py: `${ilhaTokens.space.md}px`,
                borderBottom: `1px solid ${ilhaTokens.color.border}`,
                borderLeft: "3px solid transparent",
                cursor: "pointer",
                bgcolor: isActive
                  ? ilhaTokens.color.accentSofter
                  : ilhaTokens.color.bgSurface,
                borderLeftColor: isActive ? ilhaTokens.color.accent : "transparent",
                transition: `background-color ${ilhaTokens.transition.base}`,
                "&:hover": {
                  bgcolor: isActive
                    ? ilhaTokens.color.accentSoft
                    : ilhaTokens.color.bgSubtle,
                },
              }}
            >
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  bgcolor: ilhaTokens.color.bgSubtle,
                  color: ilhaTokens.color.textSecondary,
                  fontSize: ilhaTokens.font.bodyStrong.size,
                  fontWeight: ilhaTokens.font.bodyStrong.weight,
                  fontFamily: ilhaTokens.font.family,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {initials(u.nome)}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: `${ilhaTokens.space.sm}px`,
                    alignItems: "baseline",
                  }}
                >
                  <Typography
                    noWrap
                    sx={{
                      fontSize: ilhaTokens.font.body.size,
                      fontWeight: ilhaTokens.font.bodyStrong.weight,
                      color: ilhaTokens.color.textPrimary,
                    }}
                  >
                    {u.nome}
                  </Typography>
                  {lastMsg && (
                    <Typography
                      sx={{
                        fontSize: ilhaTokens.font.caption.size,
                        color: ilhaTokens.color.textTertiary,
                        flexShrink: 0,
                      }}
                    >
                      {formatRelativeTime(lastMsg.sentAt)}
                    </Typography>
                  )}
                </Box>
                <Typography
                  noWrap
                  sx={{
                    fontSize: ilhaTokens.font.caption.size,
                    color: ilhaTokens.color.textSecondary,
                    mt: "2px",
                  }}
                >
                  {lastMsg?.content ?? u.latestStatus}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: `${ilhaTokens.space.xs}px`,
                    mt: "6px",
                  }}
                >
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      height: 18,
                      px: "6px",
                      borderRadius: `${ilhaTokens.radius.sm}px`,
                      bgcolor: leadTone.bg,
                      color: leadTone.fg,
                    }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: leadTone.dot,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {u.leadScore.score}
                    </Typography>
                  </Box>
                  {hasAssistant && (
                    <Box
                      sx={{
                        height: 18,
                        px: "6px",
                        borderRadius: `${ilhaTokens.radius.sm}px`,
                        bgcolor: ilhaTokens.color.accentSoft,
                        color: "#A85300",
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: "0.03em",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      ATENDENTE
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
