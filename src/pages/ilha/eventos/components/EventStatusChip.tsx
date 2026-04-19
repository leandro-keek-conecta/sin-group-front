import { Box } from "@mui/material";
import { ilhaTokens } from "../../theme/tokens";

interface Props {
  status: "active" | "canceled";
}

export function EventStatusChip({ status }: Props) {
  const active = status === "active";
  const fg = active ? ilhaTokens.color.success : ilhaTokens.color.danger;
  const bg = active ? ilhaTokens.color.successSoft : ilhaTokens.color.dangerSoft;

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        px: "8px",
        py: "2px",
        borderRadius: `${ilhaTokens.radius.pill}px`,
        bgcolor: bg,
        color: fg,
        fontSize: ilhaTokens.font.micro.size,
        fontWeight: ilhaTokens.font.micro.weight,
        letterSpacing: ilhaTokens.font.micro.letterSpacing,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      <Box
        component="span"
        sx={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          bgcolor: fg,
        }}
      />
      {active ? "Confirmado" : "Cancelado"}
    </Box>
  );
}
