import { Chip, Box } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

interface Props {
  assistantName: string | null;
  transferredAt: Date | null;
  variant?: "chip" | "divider";
}

export function AssistantTransferBadge({ assistantName, transferredAt, variant = "chip" }: Props) {
  const label = assistantName ? `Atendente: ${assistantName}` : "Transferido para atendente";
  const time = transferredAt
    ? transferredAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "";

  if (variant === "divider") {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          my: 1.5,
          px: 2,
          "&::before, &::after": {
            content: '""',
            flex: 1,
            height: 1,
            background: "rgba(255,122,1,0.25)",
          },
        }}
      >
        <Chip
          icon={<PersonIcon />}
          label={`${label}${time ? ` · ${time}` : ""}`}
          size="small"
          sx={{
            backgroundColor: "rgba(255,122,1,0.12)",
            color: "#FF7A01",
            fontWeight: 600,
            border: "1px solid rgba(255,122,1,0.4)",
          }}
        />
      </Box>
    );
  }

  return (
    <Chip
      icon={<PersonIcon />}
      label={label}
      size="small"
      sx={{
        backgroundColor: "rgba(255,122,1,0.12)",
        color: "#FF7A01",
        fontWeight: 600,
        border: "1px solid rgba(255,122,1,0.4)",
      }}
    />
  );
}
