import { Box, Typography } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { ilhaTokens } from "../../theme/tokens";

interface Props {
  assistantName: string | null;
  transferredAt: Date | null;
  variant?: "chip" | "divider";
}

export function AssistantTransferBadge({
  assistantName,
  transferredAt,
  variant = "chip",
}: Props) {
  const label = assistantName
    ? `Atendente: ${assistantName}`
    : "Transferido para atendente";
  const time = transferredAt
    ? transferredAt.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  if (variant === "divider") {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: `${ilhaTokens.space.sm}px`,
          my: `${ilhaTokens.space.md}px`,
          "&::before, &::after": {
            content: '""',
            flex: 1,
            height: 1,
            background: ilhaTokens.color.border,
          },
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: `${ilhaTokens.space.xs}px`,
            px: `${ilhaTokens.space.md}px`,
            py: "4px",
            borderRadius: `${ilhaTokens.radius.pill}px`,
            bgcolor: ilhaTokens.color.accentSoft,
            color: "#A85300",
            border: `1px solid ${ilhaTokens.color.accentStrong}`,
          }}
        >
          <PersonIcon sx={{ fontSize: 12 }} />
          <Typography
            sx={{
              fontSize: ilhaTokens.font.caption.size,
              fontWeight: ilhaTokens.font.bodyStrong.weight,
            }}
          >
            {label}
            {time ? ` · ${time}` : ""}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: `${ilhaTokens.space.xs}px`,
        px: `${ilhaTokens.space.sm}px`,
        py: "2px",
        borderRadius: `${ilhaTokens.radius.sm}px`,
        bgcolor: ilhaTokens.color.accentSoft,
        color: "#A85300",
        border: `1px solid ${ilhaTokens.color.accentStrong}`,
        fontSize: ilhaTokens.font.caption.size,
        fontWeight: ilhaTokens.font.bodyStrong.weight,
        fontFamily: ilhaTokens.font.family,
      }}
    >
      <PersonIcon sx={{ fontSize: 12 }} />
      {label}
    </Box>
  );
}
