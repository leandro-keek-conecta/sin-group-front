import { Box, Typography } from "@mui/material";
import { ilhaTokens } from "../theme/tokens";
import type { IlhaKpi } from "../types";

interface Props {
  items: IlhaKpi[];
}

export function IlhaKpiStrip({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2, 1fr)",
          sm: "repeat(3, 1fr)",
          md: `repeat(${items.length}, 1fr)`,
        },
        bgcolor: ilhaTokens.color.bgSurface,
        border: `1px solid ${ilhaTokens.color.border}`,
        borderRadius: `${ilhaTokens.radius.md}px`,
        overflow: "hidden",
      }}
    >
      {items.map((kpi, i) => (
        <Box
          key={kpi.label}
          sx={{
            px: `${ilhaTokens.space.lg}px`,
            py: `${ilhaTokens.space.md}px`,
            borderLeft: {
              xs: "none",
              md: i > 0 ? `1px solid ${ilhaTokens.color.border}` : "none",
            },
            borderTop: {
              xs: i >= 2 ? `1px solid ${ilhaTokens.color.border}` : "none",
              sm: i >= 3 ? `1px solid ${ilhaTokens.color.border}` : "none",
              md: "none",
            },
            transition: `background-color ${ilhaTokens.transition.base}`,
            "&:hover": {
              bgcolor: ilhaTokens.color.bgSubtle,
            },
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
              mb: "4px",
            }}
          >
            {kpi.label}
          </Typography>
          <Typography
            sx={{
              fontSize: ilhaTokens.font.display.size,
              fontWeight: ilhaTokens.font.display.weight,
              lineHeight: 1.15,
              color: ilhaTokens.color.textPrimary,
            }}
          >
            {kpi.value}
          </Typography>
          {kpi.hint && (
            <Typography
              sx={{
                fontSize: ilhaTokens.font.caption.size,
                color: ilhaTokens.color.textTertiary,
                mt: "2px",
              }}
            >
              {kpi.hint}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
}
