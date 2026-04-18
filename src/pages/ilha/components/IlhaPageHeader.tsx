import { Box, Typography, Stack } from "@mui/material";
import type { ReactNode } from "react";
import { ilhaTokens } from "../theme/tokens";

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  dense?: boolean;
}

export function IlhaPageHeader({ title, subtitle, actions, dense = false }: Props) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems={dense ? "center" : "flex-end"}
      sx={{
        pb: dense ? `${ilhaTokens.space.md}px` : `${ilhaTokens.space.lg}px`,
        pt: `${ilhaTokens.space.xs}px`,
        mb: `${ilhaTokens.space.lg}px`,
        borderBottom: `1px solid ${ilhaTokens.color.border}`,
        gap: 2,
      }}
    >
      <Box>
        <Typography
          sx={{
            fontSize: ilhaTokens.font.display.size,
            fontWeight: ilhaTokens.font.display.weight,
            lineHeight: ilhaTokens.font.display.lineHeight,
            color: ilhaTokens.color.textPrimary,
            m: 0,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            sx={{
              fontSize: ilhaTokens.font.caption.size,
              color: ilhaTokens.color.textTertiary,
              mt: "2px",
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && <Box sx={{ flexShrink: 0 }}>{actions}</Box>}
    </Stack>
  );
}
