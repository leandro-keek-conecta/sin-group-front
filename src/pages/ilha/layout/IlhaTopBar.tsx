import { Box, Stack } from "@mui/material";
import { NavLink, useLocation } from "react-router-dom";
import { ilhaTokens } from "../theme/tokens";

const tabs = [
  { to: "/ilha/visao-geral", label: "Visão geral" },
  { to: "/ilha/conversas", label: "Conversas" },
  { to: "/ilha/eventos", label: "Eventos" },
  { to: "/ilha/analises", label: "Análises" },
  { to: "/ilha/insights", label: "Insights" },
];

export function IlhaTopBar() {
  const { pathname } = useLocation();
  const isIndex = pathname === "/ilha" || pathname === "/ilha/";

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 5,
        bgcolor: ilhaTokens.color.bgSurface,
        borderBottom: `1px solid ${ilhaTokens.color.border}`,
        display: { xs: "block", md: "none" },
        overflowX: "auto",
        overflowY: "hidden",
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      <Stack
        direction="row"
        alignItems="stretch"
        sx={{
          height: `${ilhaTokens.layout.tabBarHeight}px`,
          px: `${ilhaTokens.space.sm}px`,
          width: "max-content",
        }}
      >
        {tabs.map((tab) => {
          const active = isIndex
            ? tab.to === "/ilha/visao-geral"
            : pathname.startsWith(tab.to);
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              style={{ textDecoration: "none", flexShrink: 0 }}
            >
              <Box
                sx={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                  px: `${ilhaTokens.space.md}px`,
                  fontFamily: ilhaTokens.font.family,
                  fontSize: ilhaTokens.font.h2.size,
                  fontWeight: active
                    ? ilhaTokens.font.h1.weight
                    : ilhaTokens.font.h2.weight,
                  color: active
                    ? ilhaTokens.color.textPrimary
                    : ilhaTokens.color.textSecondary,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  transition: `color ${ilhaTokens.transition.base}`,
                  cursor: "pointer",
                  "&:hover": {
                    color: ilhaTokens.color.textPrimary,
                  },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    left: `${ilhaTokens.space.md}px`,
                    right: `${ilhaTokens.space.md}px`,
                    bottom: 0,
                    height: "2px",
                    bgcolor: active ? ilhaTokens.color.accent : "transparent",
                    borderRadius: "2px",
                    transition: `background-color ${ilhaTokens.transition.base}`,
                  },
                }}
              >
                {tab.label}
              </Box>
            </NavLink>
          );
        })}
      </Stack>
    </Box>
  );
}
