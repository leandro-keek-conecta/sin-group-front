import { Box, Typography, Stack } from "@mui/material";
import type { ReactNode } from "react";
import { ilhaTokens } from "../theme/tokens";

interface Props {
  title?: string;
  subtitle?: string;
  actionSlot?: ReactNode;
  footerSlot?: ReactNode;
  children: ReactNode;
  padded?: boolean;
  dense?: boolean;
}

export function IlhaCard({
  title,
  subtitle,
  actionSlot,
  footerSlot,
  children,
  padded = true,
  dense = false,
}: Props) {
  const hasHeader = Boolean(title || subtitle || actionSlot);
  return (
    <Box
      sx={{
        bgcolor: ilhaTokens.color.bgSurface,
        border: `1px solid ${ilhaTokens.color.border}`,
        borderRadius: `${ilhaTokens.radius.md}px`,
        transition: `border-color ${ilhaTokens.transition.base}`,
        "&:hover": {
          borderColor: ilhaTokens.color.borderStrong,
        },
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {hasHeader && (
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          sx={{
            px: `${ilhaTokens.space.xl}px`,
            pt: `${ilhaTokens.space.lg}px`,
            pb: dense ? `${ilhaTokens.space.sm}px` : `${ilhaTokens.space.md}px`,
            gap: 2,
          }}
        >
          <Box>
            {title && (
              <Typography
                sx={{
                  fontSize: ilhaTokens.font.h1.size,
                  fontWeight: ilhaTokens.font.h1.weight,
                  lineHeight: ilhaTokens.font.h1.lineHeight,
                  color: ilhaTokens.color.textPrimary,
                  m: 0,
                }}
              >
                {title}
              </Typography>
            )}
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
          {actionSlot && <Box sx={{ flexShrink: 0 }}>{actionSlot}</Box>}
        </Stack>
      )}
      <Box
        sx={{
          flex: 1,
          px: padded ? `${ilhaTokens.space.xl}px` : 0,
          pt: hasHeader ? `${ilhaTokens.space.sm}px` : padded ? `${ilhaTokens.space.lg}px` : 0,
          pb: padded ? `${ilhaTokens.space.xl}px` : 0,
        }}
      >
        {children}
      </Box>
      {footerSlot && (
        <Box
          sx={{
            px: `${ilhaTokens.space.xl}px`,
            py: `${ilhaTokens.space.md}px`,
            borderTop: `1px solid ${ilhaTokens.color.border}`,
          }}
        >
          {footerSlot}
        </Box>
      )}
    </Box>
  );
}
