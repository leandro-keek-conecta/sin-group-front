import { useEffect, useRef } from "react";
import { Box, Typography, Stack, Tooltip } from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import type { IlhaConversation, IlhaMessage } from "../../types";
import { formatMarkdown } from "../../utils/formatMarkdown";
import { titleize } from "../../utils/textHelpers";
import { AssistantTransferBadge } from "./AssistantTransferBadge";
import { ilhaTokens } from "../../theme/tokens";

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
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const SENTIMENT_LABEL: Record<NonNullable<IlhaMessage["sentiment"]>, string> = {
  positive: "Positivo",
  neutral: "Neutro",
  negative: "Negativo",
};

const CHAT_WALLPAPER = "#ECE5DD";
const BUBBLE_SHADOW = "0 1px 0.5px rgba(0,0,0,0.13)";
const OUTGOING_BG = "#DCF8C6";
const INCOMING_BG = "#FFFFFF";
const CHAT_TEXT = "#111B21";

function bubbleStyles(from: IlhaMessage["from"]) {
  if (from === "user") {
    return {
      alignSelf: "flex-start",
      bgcolor: INCOMING_BG,
      color: CHAT_TEXT,
    };
  }
  return {
    alignSelf: "flex-end",
    bgcolor: OUTGOING_BG,
    color: CHAT_TEXT,
  };
}

function metaChipColor(_from: IlhaMessage["from"]) {
  return {
    bg: "rgba(0,0,0,0.05)",
    fg: "rgba(0,0,0,0.72)",
    border: "rgba(0,0,0,0.08)",
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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          color: ilhaTokens.color.textTertiary,
          fontSize: ilhaTokens.font.body.size,
          bgcolor: CHAT_WALLPAPER,
        }}
      >
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
      items.push({
        kind: "transfer",
        at: conversation.transferredAt,
        name: conversation.assistantName,
      });
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
        px: { xs: `${ilhaTokens.space.md}px`, md: `${ilhaTokens.space["2xl"]}px` },
        py: { xs: `${ilhaTokens.space.md}px`, md: `${ilhaTokens.space.lg}px` },
        display: "flex",
        flexDirection: "column",
        gap: `${ilhaTokens.space.sm}px`,
        bgcolor: CHAT_WALLPAPER,
      }}
    >
      {items.map((it, i) => {
        if (it.kind === "date") {
          return (
            <Box key={`d-${i}`} sx={{ alignSelf: "center", my: `${ilhaTokens.space.sm}px` }}>
              <Typography
                sx={{
                  px: `${ilhaTokens.space.md}px`,
                  py: "4px",
                  bgcolor: "#FFFFFF",
                  borderRadius: `${ilhaTokens.radius.pill}px`,
                  boxShadow: BUBBLE_SHADOW,
                  fontSize: ilhaTokens.font.caption.size,
                  fontWeight: ilhaTokens.font.bodyStrong.weight,
                  color: "rgba(0,0,0,0.55)",
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
        const metaColors = metaChipColor(m.from);
        return (
          <Box
            key={m.id}
            sx={{
              maxWidth: { xs: "82%", md: "68%" },
              px: "9px",
              py: "6px",
              borderRadius: "7.5px",
              boxShadow: BUBBLE_SHADOW,
              fontFamily: ilhaTokens.font.family,
              position: "relative",
              ...styles,
              ...(m.isDuplicate
                ? {
                    borderLeft: `3px solid ${ilhaTokens.color.danger}`,
                    opacity: 0.85,
                  }
                : null),
            }}
          >
            {m.isDuplicate && (
              <Tooltip title="Mensagem repetida pelo usuário">
                <Stack
                  direction="row"
                  spacing={0.5}
                  alignItems="center"
                  sx={{ mb: "2px" }}
                >
                  <ReplayIcon sx={{ fontSize: 12, color: ilhaTokens.color.danger }} />
                  <Typography
                    sx={{
                      fontSize: 10,
                      color: ilhaTokens.color.danger,
                      fontWeight: 600,
                      letterSpacing: "0.02em",
                    }}
                  >
                    REENVIO
                  </Typography>
                </Stack>
              </Tooltip>
            )}
            <Box
              dangerouslySetInnerHTML={{ __html: formatMarkdown(m.content) }}
              sx={{
                "& .md-list": { margin: 0, paddingLeft: 2.5 },
                "& strong": { fontWeight: 700 },
                "& a": { color: "inherit", textDecoration: "underline" },
                fontSize: ilhaTokens.font.body.size,
                lineHeight: ilhaTokens.font.body.lineHeight,
              }}
            />
            {hasBotMeta && (
              <Stack
                direction="row"
                spacing={`${ilhaTokens.space.xs}px`}
                flexWrap="wrap"
                useFlexGap
                sx={{ mt: `${ilhaTokens.space.xs}px` }}
              >
                {m.theme && (
                  <MetaChip label={titleize(m.theme)} colors={metaColors} />
                )}
                {m.intent && (
                  <MetaChip label={titleize(m.intent)} colors={metaColors} />
                )}
                {m.sentiment && (
                  <MetaChip
                    label={SENTIMENT_LABEL[m.sentiment]}
                    colors={metaColors}
                  />
                )}
              </Stack>
            )}
            <Typography
              sx={{
                display: "block",
                textAlign: "right",
                color: "rgba(0,0,0,0.45)",
                mt: "2px",
                fontSize: 10,
              }}
            >
              {m.sentAt.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

function MetaChip({
  label,
  colors,
}: {
  label: string;
  colors: { bg: string; fg: string; border: string };
}) {
  return (
    <Box
      sx={{
        height: 18,
        px: "6px",
        display: "inline-flex",
        alignItems: "center",
        borderRadius: `${ilhaTokens.radius.sm}px`,
        bgcolor: colors.bg,
        color: colors.fg,
        border: `1px solid ${colors.border}`,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.02em",
      }}
    >
      {label}
    </Box>
  );
}
