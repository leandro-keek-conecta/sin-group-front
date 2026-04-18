import { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Divider,
  Stack,
  Button,
  LinearProgress,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import CallIcon from "@mui/icons-material/Call";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import NotesIcon from "@mui/icons-material/Notes";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CircleIcon from "@mui/icons-material/Circle";
import type { IlhaUser, IlhaConversation } from "../../types";
import { AssistantTransferBadge } from "./AssistantTransferBadge";
import {
  formatDateTime,
  formatDuration,
  formatClockTime,
} from "../../utils/intervals";
import { formatPercent, getInitials } from "../../utils/textHelpers";

interface Props {
  user: IlhaUser | null;
  conversation: IlhaConversation | null;
}

const LEAD_COLOR: Record<IlhaUser["leadScore"]["label"], string> = {
  "Lead quente": "#FF7A01",
  "Lead morno": "#E0A800",
  "Lead frio": "#8A8A8A",
};

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
      <Box sx={{ p: 3, color: "text.secondary" }}>
        Nenhum usuário selecionado.
      </Box>
    );
  }

  const score = user.leadScore;
  const scoreColor = LEAD_COLOR[score.label];

  const handleStub = (label: string) => {
    setSnack(`${label} — ação em breve.`);
  };

  return (
    <Box
      sx={{
        height: "100%",
        overflowY: "auto",
        p: 2.5,
        borderLeft: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      {/* 1. Profile header */}
      <Stack alignItems="center" spacing={1} mb={2}>
        <Avatar
          sx={{
            width: 72,
            height: 72,
            bgcolor: "#FF7A01",
            fontSize: 26,
            fontWeight: 700,
          }}
        >
          {getInitials(user.nome)}
        </Avatar>
        <Typography fontWeight={700} fontSize={16} align="center">
          {user.nome}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user.maskedPhone || "Telefone indisponível"}
        </Typography>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <CircleIcon sx={{ fontSize: 8, color: scoreColor }} />
          <Typography variant="caption" color="text.secondary">
            {user.latestStatus}
          </Typography>
        </Stack>
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* 2. Lead score + reasons */}
      <SectionTitle>Lead Score</SectionTitle>
      <Box
        sx={{
          mt: 1,
          p: 1.5,
          borderRadius: 1,
          bgcolor: "action.hover",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ position: "relative", flex: 1 }}>
            <Stack direction="row" justifyContent="space-between" mb={0.5}>
              <Typography variant="caption" color="text.secondary">
                {score.label}
              </Typography>
              <Typography variant="caption" fontWeight={700} sx={{ color: scoreColor }}>
                {score.score}/100
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={score.score}
              sx={{
                height: 8,
                borderRadius: 4,
                "& .MuiLinearProgress-bar": { bgcolor: scoreColor },
              }}
            />
          </Box>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
          {score.caption}
        </Typography>
        {score.reasons.length > 0 && (
          <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2, mt: 1 }}>
            {score.reasons.map((r, i) => (
              <Typography
                key={i}
                component="li"
                variant="caption"
                color="text.secondary"
                sx={{ lineHeight: 1.4 }}
              >
                {r}
              </Typography>
            ))}
          </Stack>
        )}
      </Box>

      {/* 3. User stats */}
      <SectionTitle sx={{ mt: 2 }}>Histórico do usuário</SectionTitle>
      <StatGrid
        rows={[
          ["Interações totais", String(user.qtdInteracoes)],
          ["Conversas", String(user.conversations.length)],
          ["Eventos", String(user.totalEventos)],
          ["Primeiro contato", formatDateTime(user.primeiroContato)],
          ["Último contato", formatDateTime(user.ultimoContato)],
          user.returnGapMs > 0
            ? ["Retorno após", formatDuration(user.returnGapMs)]
            : ["Retorno após", "—"],
        ]}
      />

      {/* 4. Current conversation stats */}
      {conversation && (
        <>
          <SectionTitle sx={{ mt: 2 }}>Conversa atual</SectionTitle>
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

          {/* Transfer */}
          {conversation.transferredToAssistant && (
            <Box sx={{ mt: 1.5 }}>
              <AssistantTransferBadge
                assistantName={conversation.assistantName}
                transferredAt={conversation.transferredAt}
              />
            </Box>
          )}
        </>
      )}

      {/* 5. Dominant signals */}
      {conversation && (conversation.dominantTheme || conversation.dominantIntent || conversation.dominantSentiment) && (
        <>
          <SectionTitle sx={{ mt: 2 }}>Sinais dominantes</SectionTitle>
          <Stack spacing={0.75} mt={1}>
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
        </>
      )}

      {/* Top signals chips */}
      {conversation && (conversation.topThemes.length > 0 || conversation.topIntents.length > 0) && (
        <Box sx={{ mt: 1.5 }}>
          {conversation.topThemes.length > 0 && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Temas
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
                {conversation.topThemes.map((t) => (
                  <Chip key={t} label={t} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>
          )}
          {conversation.topIntents.length > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Intenções
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
                {conversation.topIntents.map((i) => (
                  <Chip key={i} label={i} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* 6. Recent events */}
      {recentEvents.length > 0 && (
        <>
          <SectionTitle sx={{ mt: 2 }}>Eventos recentes</SectionTitle>
          <Stack spacing={0.75} mt={1}>
            {recentEvents.map((e) => (
              <Stack key={e.id} direction="row" spacing={1} alignItems="flex-start">
                <CircleIcon sx={{ fontSize: 6, mt: 0.75, color: "#FF7A01" }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" fontWeight={600}>
                    {e.type}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    {formatClockTime(e.occurredAt)}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </>
      )}

      {/* 7. Other conversations */}
      {otherConversations.length > 0 && (
        <>
          <SectionTitle sx={{ mt: 2 }}>Outras conversas</SectionTitle>
          <Stack spacing={0.75} mt={1}>
            {otherConversations.slice(0, 4).map((c) => (
              <Box
                key={c.id}
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: "action.hover",
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" fontWeight={600}>
                    {formatDateTime(c.startedAt)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {c.messages.length} msg
                  </Typography>
                </Stack>
                {c.dominantTheme && (
                  <Typography variant="caption" color="text.secondary">
                    Tema: {c.dominantTheme.label}
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
        </>
      )}

      {/* 8. Actions */}
      <Divider sx={{ my: 2 }} />
      <SectionTitle>Ações comerciais</SectionTitle>
      <Stack spacing={1} mt={1}>
        <Button
          size="small"
          variant="contained"
          startIcon={<WhatsAppIcon />}
          onClick={() => handleStub("Abrir conversa no WhatsApp")}
          sx={{ bgcolor: "#FF7A01", "&:hover": { bgcolor: "#E66D00" }, justifyContent: "flex-start" }}
        >
          Abrir no WhatsApp
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<CallIcon />}
          onClick={() => handleStub("Registrar ligação")}
          sx={{ justifyContent: "flex-start" }}
        >
          Registrar ligação
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AssignmentIndIcon />}
          onClick={() => handleStub("Atribuir a um responsável")}
          sx={{ justifyContent: "flex-start" }}
        >
          Atribuir responsável
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<BookmarkAddIcon />}
          onClick={() => handleStub("Marcar como oportunidade")}
          sx={{ justifyContent: "flex-start" }}
        >
          Marcar oportunidade
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<NotesIcon />}
          onClick={() => handleStub("Adicionar nota")}
          sx={{ justifyContent: "flex-start" }}
        >
          Adicionar nota
        </Button>
        <Tooltip title="Mais ações">
          <IconButton
            size="small"
            onClick={() => handleStub("Mais ações")}
            sx={{ alignSelf: "flex-start" }}
          >
            <MoreHorizIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={2500}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="info" variant="filled" sx={{ bgcolor: "#FF7A01" }}>
          {snack}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function SectionTitle({
  children,
  sx,
}: {
  children: React.ReactNode;
  sx?: React.ComponentProps<typeof Typography>["sx"];
}) {
  return (
    <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0.8, ...sx }}>
      {children}
    </Typography>
  );
}

function StatGrid({ rows }: { rows: Array<[string, string]> }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 1,
        mt: 1,
      }}
    >
      {rows.map(([label, value]) => (
        <Box
          key={label}
          sx={{
            p: 1,
            borderRadius: 1,
            bgcolor: "action.hover",
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
            {label}
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {value}
          </Typography>
        </Box>
      ))}
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
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Stack direction="row" spacing={0.75} alignItems="center">
        <Typography variant="body2" fontWeight={600}>
          {value}
        </Typography>
        <Chip
          label={`${Math.round(share * 100)}%`}
          size="small"
          sx={{ height: 20, fontSize: 11 }}
        />
      </Stack>
    </Box>
  );
}
