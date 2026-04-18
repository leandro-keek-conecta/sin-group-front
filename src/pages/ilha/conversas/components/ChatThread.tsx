import { useEffect, useRef } from "react";
import { Box, Typography, Chip, Stack, Tooltip } from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import type { IlhaConversation, IlhaMessage } from "../../types";
import { formatMarkdown } from "../../utils/formatMarkdown";
import { titleize } from "../../utils/textHelpers";
import { AssistantTransferBadge } from "./AssistantTransferBadge";

interface Props {
  conversation: IlhaConversation | null;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateLabel(d: Date): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (sameDay(d, today)) return "Hoje";
  if (sameDay(d, yesterday)) return "Ontem";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

const SENTIMENT_LABEL: Record<NonNullable<IlhaMessage["sentiment"]>, string> = {
  positive: "Positivo",
  neutral: "Neutro",
  negative: "Negativo",
};
const SENTIMENT_BG: Record<NonNullable<IlhaMessage["sentiment"]>, string> = {
  positive: "rgba(93,145,97,0.18)",
  neutral: "rgba(0,0,0,0.05)",
  negative: "rgba(217,83,79,0.18)",
};
const SENTIMENT_FG: Record<NonNullable<IlhaMessage["sentiment"]>, string> = {
  positive: "#2F6E34",
  neutral: "rgba(0,0,0,0.65)",
  negative: "#A53F3B",
};

function bubbleStyles(from: IlhaMessage["from"]) {
  if (from === "user") {
    return {
      alignSelf: "flex-start",
      bgcolor: "#FFFFFF",
      borderRadius: "14px 14px 14px 2px",
    };
  }
  if (from === "assistant") {
    return {
      alignSelf: "flex-end",
      bgcolor: "rgba(255,122,1,0.12)",
      borderRadius: "14px 14px 2px 14px",
    };
  }
  return {
    alignSelf: "flex-end",
    bgcolor: "#DCF8C6",
    borderRadius: "14px 14px 2px 14px",
  };
}

export function ChatThread({ conversation }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.id]);

  if (!conversation) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "text.secondary" }}>
        Selecione uma conversa para visualizar as mensagens.
      </Box>
    );
  }

  type Item =
    | { kind: "date"; date: Date }
    | { kind: "transfer"; at: Date | null; name: string | null }
    | { kind: "msg"; msg: IlhaMessage };

  const items: Item[] = [];
  let lastDate: Date | null = null;
  let transferInserted = false;

  for (const msg of conversation.messages) {
    if (!lastDate || !sameDay(lastDate, msg.sentAt)) {
      items.push({ kind: "date", date: msg.sentAt });
      lastDate = msg.sentAt;
    }
    if (
      !transferInserted &&
      conversation.transferredToAssistant &&
      msg.from === "assistant"
    ) {
      items.push({ kind: "transfer", at: conversation.transferredAt, name: conversation.assistantName });
      transferInserted = true;
    }
    items.push({ kind: "msg", msg });
  }

  return (
    <Box
      ref={scrollRef}
      sx={{
        flex: 1,
        overflowY: "auto",
        px: 2,
        py: 1.5,
        display: "flex",
        flexDirection: "column",
        gap: 0.75,
        bgcolor: "#ECE5DD",
      }}
    >
      {items.map((it, i) => {
        if (it.kind === "date") {
          return (
            <Box key={`d-${i}`} sx={{ alignSelf: "center", my: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  px: 1.5,
                  py: 0.25,
                  bgcolor: "rgba(0,0,0,0.08)",
                  borderRadius: 2,
                  fontWeight: 600,
                }}
              >
                {formatDateLabel(it.date)}
              </Typography>
            </Box>
          );
        }
        if (it.kind === "transfer") {
          return (
            <AssistantTransferBadge
              key={`t-${i}`}
              assistantName={it.name}
              transferredAt={it.at}
              variant="divider"
            />
          );
        }
        const m = it.msg;
        const styles = bubbleStyles(m.from);
        const hasBotMeta = m.from === "bot" && (m.theme || m.intent || m.sentiment);
        return (
          <Box
            key={m.id}
            sx={{
              maxWidth: "72%",
              px: 1.25,
              py: 0.75,
              boxShadow: "0 1px 0.5px rgba(0,0,0,0.13)",
              position: "relative",
              ...styles,
              ...(m.isDuplicate
                ? {
                    borderLeft: "3px solid rgba(217,83,79,0.6)",
                    opacity: 0.75,
                  }
                : null),
            }}
          >
            {m.isDuplicate && (
              <Tooltip title="Mensagem repetida pelo usuário">
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.25 }}>
                  <ReplayIcon sx={{ fontSize: 12, color: "#D9534F" }} />
                  <Typography variant="caption" sx={{ fontSize: 10, color: "#D9534F", fontWeight: 600 }}>
                    Reenvio
                  </Typography>
                </Stack>
              </Tooltip>
            )}
            <Box
              dangerouslySetInnerHTML={{ __html: formatMarkdown(m.content) }}
              sx={{
                "& .md-list": { margin: 0, paddingLeft: 2.5 },
                "& strong": { fontWeight: 700 },
                fontSize: 14,
                lineHeight: 1.4,
              }}
            />
            {hasBotMeta && (
              <Stack
                direction="row"
                spacing={0.5}
                flexWrap="wrap"
                useFlexGap
                sx={{ mt: 0.5 }}
              >
                {m.theme && (
                  <Chip
                    label={titleize(m.theme)}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: 10,
                      bgcolor: "rgba(255,122,1,0.14)",
                      color: "#A85300",
                      fontWeight: 600,
                    }}
                  />
                )}
                {m.intent && (
                  <Chip
                    label={titleize(m.intent)}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: 10,
                      bgcolor: "rgba(0,0,0,0.06)",
                      color: "rgba(0,0,0,0.7)",
                      fontWeight: 600,
                    }}
                  />
                )}
                {m.sentiment && (
                  <Chip
                    label={SENTIMENT_LABEL[m.sentiment]}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: 10,
                      bgcolor: SENTIMENT_BG[m.sentiment],
                      color: SENTIMENT_FG[m.sentiment],
                      fontWeight: 600,
                    }}
                  />
                )}
              </Stack>
            )}
            <Typography
              variant="caption"
              sx={{ display: "block", textAlign: "right", color: "rgba(0,0,0,0.45)", mt: 0.25, fontSize: 10 }}
            >
              {m.sentAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
