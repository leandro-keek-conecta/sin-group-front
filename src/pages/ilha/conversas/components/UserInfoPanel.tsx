import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  IconButton,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import CallIcon from "@mui/icons-material/Call";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import NotesIcon from "@mui/icons-material/Notes";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import type { IlhaUser, IlhaConversation } from "../../types";
import { AssistantTransferBadge } from "./AssistantTransferBadge";
import {
  formatDateTime,
  formatDuration,
  formatClockTime,
} from "../../utils/intervals";
import { formatPercent, getInitials } from "../../utils/textHelpers";
import { ilhaTokens, leadLabelColor } from "../../theme/tokens";

interface Props {
  user: IlhaUser | null;
  conversation: IlhaConversation | null;
}

export function UserInfoPanel({ user, conversation }: Props) {
  const [snack, setSnack] = useState<string | null>(null);

  const otherConversations = useMemo(() => {
    if (!user || !conversation) return [];
    return user.conversations.filter((c) => c.id !== conversation.id);
  }, [user, conversation]);

  const recentEvents = useMemo(() => {
    if (!conversation) return [];
    return [...conversation.events]
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
      .slice(0, 5);
  }, [conversation]);

  if (!user) {
    return (
      <Box
        sx={{
          p: `${ilhaTokens.space.xl}px`,
          color: ilhaTokens.color.textTertiary,
          fontSize: ilhaTokens.font.body.size,
          borderLeft: `1px solid ${ilhaTokens.color.border}`,
          bgcolor: ilhaTokens.color.bgSurface,
          height: "100%",
        }}
      >
        Nenhum usuário selecionado.
      </Box>
    );
  }

  const score = user.leadScore;
  const leadTone = leadLabelColor[score.label];

  const handleStub = (label: string) => {
    setSnack(`${label} — ação em breve.`);
  };

  return (
    <Box
      sx={{
        height: "100%",
        overflowY: "auto",
        borderLeft: `1px solid ${ilhaTokens.color.border}`,
        bgcolor: ilhaTokens.color.bgSurface,
      }}
    >
      <Box
        sx={{
          px: `${ilhaTokens.space.xl}px`,
          pt: `${ilhaTokens.space.xl}px`,
          pb: `${ilhaTokens.space.lg}px`,
          borderBottom: `1px solid ${ilhaTokens.color.border}`,
        }}
      >
        <Stack direction="row" spacing={`${ilhaTokens.space.md}px`} alignItems="center">
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              bgcolor: ilhaTokens.color.bgSubtle,
              color: ilhaTokens.color.textSecondary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: ilhaTokens.font.family,
              fontSize: ilhaTokens.font.h1.size,
              fontWeight: ilhaTokens.font.h1.weight,
              flexShrink: 0,
            }}
          >
            {getInitials(user.nome)}
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                fontSize: ilhaTokens.font.h1.size,
                fontWeight: ilhaTokens.font.h1.weight,
                color: ilhaTokens.color.textPrimary,
                lineHeight: 1.25,
              }}
              noWrap
            >
              {user.nome}
            </Typography>
            <Typography
              sx={{
                fontSize: ilhaTokens.font.caption.size,
                color: ilhaTokens.color.textTertiary,
              }}
            >
              {user.maskedPhone || "Telefone indisponível"}
            </Typography>
            <Typography
              sx={{
                fontSize: ilhaTokens.font.caption.size,
                color: ilhaTokens.color.textSecondary,
                mt: "2px",
              }}
            >
              {user.latestStatus}
            </Typography>
          </Box>
        </Stack>

        <ActionStrip onClick={handleStub} />
      </Box>

      <Section title="Lead score">
        <Box
          sx={{
            mt: `${ilhaTokens.space.sm}px`,
            p: `${ilhaTokens.space.md}px`,
            border: `1px solid ${ilhaTokens.color.border}`,
            borderRadius: `${ilhaTokens.radius.md}px`,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="baseline">
            <Stack direction="row" spacing={`${ilhaTokens.space.sm}px`} alignItems="center">
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: leadTone.dot,
                }}
              />
              <Typography
                sx={{
                  fontSize: ilhaTokens.font.body.size,
                  fontWeight: ilhaTokens.font.bodyStrong.weight,
                  color: leadTone.fg,
                }}
              >
                {score.label}
              </Typography>
            </Stack>
            <Typography
              sx={{
                fontSize: ilhaTokens.font.h1.size,
                fontWeight: ilhaTokens.font.h1.weight,
                color: ilhaTokens.color.textPrimary,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {score.score}
              <Box
                component="span"
                sx={{
                  fontSize: ilhaTokens.font.caption.size,
                  fontWeight: ilhaTokens.font.body.weight,
                  color: ilhaTokens.color.textTertiary,
                  ml: "2px",
                }}
              >
                /100
              </Box>
            </Typography>
          </Stack>
          <Box
            sx={{
              mt: `${ilhaTokens.space.sm}px`,
              height: 6,
              borderRadius: `${ilhaTokens.radius.pill}px`,
              bgcolor: ilhaTokens.color.bgSubtle,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: `${score.score}%`,
                height: "100%",
                bgcolor: leadTone.dot,
                transition: `width ${ilhaTokens.transition.slow}`,
              }}
            />
          </Box>
          <Typography
            sx={{
              fontSize: ilhaTokens.font.caption.size,
              color: ilhaTokens.color.textSecondary,
              mt: `${ilhaTokens.space.sm}px`,
              lineHeight: 1.4,
            }}
          >
            {score.caption}
          </Typography>
          {score.reasons.length > 0 && (
            <Box component="ul" sx={{ m: 0, pl: `${ilhaTokens.space.lg}px`, mt: `${ilhaTokens.space.sm}px` }}>
              {score.reasons.map((r, i) => (
                <Typography
                  key={i}
                  component="li"
                  sx={{
                    fontSize: ilhaTokens.font.caption.size,
                    color: ilhaTokens.color.textSecondary,
                    lineHeight: 1.45,
                  }}
                >
                  {r}
                </Typography>
              ))}
            </Box>
          )}
        </Box>
      </Section>

      <Section title="Histórico do usuário">
        <StatGrid
          rows={[
            ["Interações", String(user.qtdInteracoes)],
            ["Conversas", String(user.conversations.length)],
            ["Eventos", String(user.totalEventos)],
            ["Primeiro contato", formatDateTime(user.primeiroContato)],
            ["Último contato", formatDateTime(user.ultimoContato)],
            [
              "Retorno após",
              user.returnGapMs > 0 ? formatDuration(user.returnGapMs) : "—",
            ],
          ]}
        />
      </Section>

      {conversation && (
        <Section title="Conversa atual">
          <StatGrid
            rows={[
              ["Início", formatDateTime(conversation.startedAt)],
              ["Duração", formatDuration(conversation.duration)],
              ["Mensagens", String(conversation.messages.length)],
              ["Recebidas", String(conversation.receivedCount)],
              ["Processadas", String(conversation.processedCount)],
              [
                "Duplicadas",
                `${conversation.duplicateInputsCount}${
                  conversation.receivedCount > 0
                    ? ` (${formatPercent(conversation.duplicateInputsCount, conversation.receivedCount)})`
                    : ""
                }`,
              ],
            ]}
          />
          {conversation.transferredToAssistant && (
            <Box sx={{ mt: `${ilhaTokens.space.md}px` }}>
              <AssistantTransferBadge
                assistantName={conversation.assistantName}
                transferredAt={conversation.transferredAt}
              />
            </Box>
          )}
        </Section>
      )}

      {conversation &&
        (conversation.dominantTheme ||
          conversation.dominantIntent ||
          conversation.dominantSentiment) && (
          <Section title="Sinais dominantes">
            <Stack spacing={`${ilhaTokens.space.sm}px`}>
              {conversation.dominantTheme && (
                <SignalRow
                  label="Tema"
                  value={conversation.dominantTheme.label}
                  share={conversation.dominantTheme.share}
                />
              )}
              {conversation.dominantIntent && (
                <SignalRow
                  label="Intenção"
                  value={conversation.dominantIntent.label}
                  share={conversation.dominantIntent.share}
                />
              )}
              {conversation.dominantSentiment && (
                <SignalRow
                  label="Sentimento"
                  value={conversation.dominantSentiment.label}
                  share={conversation.dominantSentiment.share}
                />
              )}
            </Stack>
          </Section>
        )}

      {conversation &&
        (conversation.topThemes.length > 0 || conversation.topIntents.length > 0) && (
          <Section title="Tags">
            {conversation.topThemes.length > 0 && (
              <Box sx={{ mb: `${ilhaTokens.space.sm}px` }}>
                <TagLabel>Temas</TagLabel>
                <TagRow items={conversation.topThemes} />
              </Box>
            )}
            {conversation.topIntents.length > 0 && (
              <Box>
                <TagLabel>Intenções</TagLabel>
                <TagRow items={conversation.topIntents} />
              </Box>
            )}
          </Section>
        )}

      {recentEvents.length > 0 && (
        <Section title="Eventos recentes">
          <Stack spacing={`${ilhaTokens.space.sm}px`}>
            {recentEvents.map((e) => (
              <Stack
                key={e.id}
                direction="row"
                spacing={`${ilhaTokens.space.sm}px`}
                alignItems="flex-start"
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: ilhaTokens.color.accent,
                    mt: "6px",
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: ilhaTokens.font.caption.size,
                      fontWeight: ilhaTokens.font.bodyStrong.weight,
                      color: ilhaTokens.color.textPrimary,
                    }}
                  >
                    {e.type}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: ilhaTokens.font.caption.size,
                      color: ilhaTokens.color.textTertiary,
                    }}
                  >
                    {formatClockTime(e.occurredAt)}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Section>
      )}

      {otherConversations.length > 0 && (
        <Section title="Outras conversas">
          <Stack spacing={`${ilhaTokens.space.sm}px`}>
            {otherConversations.slice(0, 4).map((c) => (
              <Box
                key={c.id}
                sx={{
                  p: `${ilhaTokens.space.sm}px`,
                  border: `1px solid ${ilhaTokens.color.border}`,
                  borderRadius: `${ilhaTokens.radius.md}px`,
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography
                    sx={{
                      fontSize: ilhaTokens.font.caption.size,
                      fontWeight: ilhaTokens.font.bodyStrong.weight,
                      color: ilhaTokens.color.textPrimary,
                    }}
                  >
                    {formatDateTime(c.startedAt)}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: ilhaTokens.font.caption.size,
                      color: ilhaTokens.color.textTertiary,
                    }}
                  >
                    {c.messages.length} msg
                  </Typography>
                </Stack>
                {c.dominantTheme && (
                  <Typography
                    sx={{
                      fontSize: ilhaTokens.font.caption.size,
                      color: ilhaTokens.color.textSecondary,
                      mt: "2px",
                    }}
                  >
                    Tema: {c.dominantTheme.label}
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
        </Section>
      )}

      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={2500}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity="info"
          variant="filled"
          sx={{
            bgcolor: ilhaTokens.color.accent,
            color: "#fff",
            fontFamily: ilhaTokens.font.family,
          }}
        >
          {snack}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        px: `${ilhaTokens.space.xl}px`,
        py: `${ilhaTokens.space.lg}px`,
        borderBottom: `1px solid ${ilhaTokens.color.border}`,
      }}
    >
      <Typography
        sx={{
          fontSize: ilhaTokens.font.micro.size,
          fontWeight: ilhaTokens.font.micro.weight,
          lineHeight: ilhaTokens.font.micro.lineHeight,
          letterSpacing: ilhaTokens.font.micro.letterSpacing,
          color: ilhaTokens.color.textTertiary,
          textTransform: "uppercase",
          mb: `${ilhaTokens.space.sm}px`,
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function StatGrid({ rows }: { rows: Array<[string, string]> }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 0,
        border: `1px solid ${ilhaTokens.color.border}`,
        borderRadius: `${ilhaTokens.radius.md}px`,
        overflow: "hidden",
      }}
    >
      {rows.map(([label, value], i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        return (
          <Box
            key={label}
            sx={{
              p: `${ilhaTokens.space.sm}px ${ilhaTokens.space.md}px`,
              borderLeft:
                col === 1 ? `1px solid ${ilhaTokens.color.border}` : "none",
              borderTop: row > 0 ? `1px solid ${ilhaTokens.color.border}` : "none",
            }}
          >
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: ilhaTokens.color.textTertiary,
                display: "block",
              }}
            >
              {label}
            </Typography>
            <Typography
              sx={{
                fontSize: ilhaTokens.font.body.size,
                fontWeight: ilhaTokens.font.bodyStrong.weight,
                color: ilhaTokens.color.textPrimary,
                mt: "1px",
              }}
            >
              {value}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

function SignalRow({
  label,
  value,
  share,
}: {
  label: string;
  value: string;
  share: number;
}) {
  const percent = Math.round(share * 100);
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline">
        <Typography
          sx={{
            fontSize: ilhaTokens.font.caption.size,
            color: ilhaTokens.color.textTertiary,
          }}
        >
          {label}
        </Typography>
        <Stack direction="row" spacing={`${ilhaTokens.space.sm}px`} alignItems="baseline">
          <Typography
            sx={{
              fontSize: ilhaTokens.font.body.size,
              fontWeight: ilhaTokens.font.bodyStrong.weight,
              color: ilhaTokens.color.textPrimary,
            }}
          >
            {value}
          </Typography>
          <Typography
            sx={{
              fontSize: ilhaTokens.font.caption.size,
              color: ilhaTokens.color.textSecondary,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {percent}%
          </Typography>
        </Stack>
      </Stack>
      <Box
        sx={{
          mt: "4px",
          height: 3,
          borderRadius: `${ilhaTokens.radius.pill}px`,
          bgcolor: ilhaTokens.color.bgSubtle,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: `${percent}%`,
            height: "100%",
            bgcolor: ilhaTokens.color.accent,
          }}
        />
      </Box>
    </Box>
  );
}

function TagLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        color: ilhaTokens.color.textTertiary,
        mb: `${ilhaTokens.space.xs}px`,
        display: "block",
      }}
    >
      {children}
    </Typography>
  );
}

function TagRow({ items }: { items: string[] }) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: `${ilhaTokens.space.xs}px` }}>
      {items.map((t) => (
        <Box
          key={t}
          sx={{
            px: `${ilhaTokens.space.sm}px`,
            height: 20,
            display: "inline-flex",
            alignItems: "center",
            borderRadius: `${ilhaTokens.radius.sm}px`,
            border: `1px solid ${ilhaTokens.color.border}`,
            bgcolor: ilhaTokens.color.bgSurface,
            fontSize: ilhaTokens.font.caption.size,
            color: ilhaTokens.color.textSecondary,
            fontFamily: ilhaTokens.font.family,
          }}
        >
          {t}
        </Box>
      ))}
    </Box>
  );
}

function ActionStrip({ onClick }: { onClick: (label: string) => void }) {
  const actions = [
    { icon: <WhatsAppIcon sx={{ fontSize: 16 }} />, label: "WhatsApp", stubLabel: "Abrir no WhatsApp", primary: true },
    { icon: <CallIcon sx={{ fontSize: 16 }} />, label: "Ligar", stubLabel: "Registrar ligação" },
    { icon: <AssignmentIndIcon sx={{ fontSize: 16 }} />, label: "Atribuir", stubLabel: "Atribuir responsável" },
    { icon: <BookmarkAddIcon sx={{ fontSize: 16 }} />, label: "Marcar", stubLabel: "Marcar oportunidade" },
    { icon: <NotesIcon sx={{ fontSize: 16 }} />, label: "Nota", stubLabel: "Adicionar nota" },
  ];
  return (
    <Stack
      direction="row"
      spacing={`${ilhaTokens.space.xs}px`}
      sx={{ mt: `${ilhaTokens.space.md}px`, flexWrap: "wrap", useFlexGap: true, gap: `${ilhaTokens.space.xs}px` }}
      useFlexGap
    >
      {actions.map((a) => (
        <Box
          key={a.label}
          role="button"
          tabIndex={0}
          onClick={() => onClick(a.stubLabel)}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            height: 28,
            px: `${ilhaTokens.space.sm}px`,
            borderRadius: `${ilhaTokens.radius.md}px`,
            border: `1px solid ${a.primary ? ilhaTokens.color.accent : ilhaTokens.color.border}`,
            bgcolor: a.primary ? ilhaTokens.color.accent : ilhaTokens.color.bgSurface,
            color: a.primary ? "#fff" : ilhaTokens.color.textSecondary,
            fontSize: ilhaTokens.font.caption.size,
            fontWeight: ilhaTokens.font.bodyStrong.weight,
            fontFamily: ilhaTokens.font.family,
            cursor: "pointer",
            transition: `all ${ilhaTokens.transition.base}`,
            "&:hover": {
              bgcolor: a.primary ? ilhaTokens.color.accentHover : ilhaTokens.color.bgSubtle,
              borderColor: a.primary ? ilhaTokens.color.accentHover : ilhaTokens.color.borderStrong,
            },
          }}
        >
          {a.icon}
          {a.label}
        </Box>
      ))}
      <Tooltip title="Mais ações">
        <IconButton
          size="small"
          onClick={() => onClick("Mais ações")}
          sx={{
            width: 28,
            height: 28,
            border: `1px solid ${ilhaTokens.color.border}`,
            borderRadius: `${ilhaTokens.radius.md}px`,
            color: ilhaTokens.color.textSecondary,
          }}
        >
          <MoreHorizIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
