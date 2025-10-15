import { useState } from "react";
import { styled } from "@mui/material/styles";
import LogoutIcon from "@mui/icons-material/Logout";
import Logo from "../assets/logo-horizontal-n.png";
import {
  AppBar,
  Avatar,
  Box,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import { ChevronLeft, ChevronRight, Menu } from "@mui/icons-material";
import { Sidebar } from "./sidebar/Sidebar";
import SplitButton from "./SplitButton";
import { useNavigate } from "react-router-dom";
import { logout } from "@/services/auth/authService";
import FolderSharedIcon from "@mui/icons-material/FolderShared";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
// Interface para propriedades do componente Layout
interface PropriedadesLayout {
  children: React.ReactNode;
  titulo?: string;
  mostrarSidebar?: boolean;
  tituloIcon?: React.ReactNode; // Nova propriedade para controlar a exibição da sidebar
}

// Estilo para o cabeçalho
const CabecalhoEstilizado = styled(AppBar)(({ theme }) => ({
  backgroundColor: "white",
  color: "#333333",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  zIndex: theme.zIndex.drawer + 1,
}));

// Estilo para a barra lateral
const BarraLateralEstilizada = styled(Box)(({ theme }) => ({
  backgroundColor: "#ffffff", // Verde similar ao sinGroup
  color: "white",
  height: "100%",
}));

export function Layout({
  children,
  titulo,
  mostrarSidebar = true,
  tituloIcon,
}: PropriedadesLayout) {
  const APPBAR_H = "3rem";
  const navigate = useNavigate();
  const [barraLateralAberta, setBarraLateralAberta] = useState(true);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdminOrMore = user?.role === "ADMIN" ? true : false;
  const userNameFiltered = user.name
    .split(" ") // Divide o nome completo por espaços
    .filter((palavra) => palavra.length > 2) // Remove palavras com 2 caracteres ou menos
    .slice(0, 2) // Limita o resultado para até 3 palavras
    .join(" "); // Junta as palavras novamente
  const color = user.projeto.corHex;
  // Se não deve mostrar a sidebar, renderiza apenas o conteúdo principal
  if (!mostrarSidebar) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f5f5" }}>
        {children}
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      {/* Barra lateral para desktop */}
      <Box
        component="aside"
        sx={{
          position: "fixed",
          left: 0,
          top: 0,
          height: "100vh",
          overflowY: "hidden", // Scroll inicialmente escondido
          overflowX: "hidden",
          width: barraLateralAberta ? "13.281vw" : "50px",
          bgcolor: "#ffffff",
          transition: "all 0.3s ease-in-out",
          zIndex: 20,
          display: { xs: "none", md: "block" },
          "&:hover": {
            overflowY: "auto", // Mostra scroll ao passar o mouse
          },
          // Estilização personalizada para a barra de rolagem
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#888",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#555",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "3rem",
            p: 0.5,
            px: 2,
            borderBottom: "1px solid black",
            borderRight: "1px solid #00000014",
            position: "sticky", // ← fixa no topo
            top: 0, // ← topo
            zIndex: 1, // ← acima do scroll
            backgroundColor: "#fff", // ← evita “vazar” conteúdo por baixo
          }}
        >
          <img
            src={Logo}
            alt="sinGroup"
            style={{ height: "2.5rem", width: "auto" }}
          />
        </Box>

        <Sidebar estaAberta={barraLateralAberta} />
      </Box>

      {/* Drawer para mobile */}
      <Drawer
        anchor="left"
        open={menuMobileAberto}
        onClose={() => setMenuMobileAberto(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: "60vw",
            bgcolor: `${color}`,
          },
          display: { xs: "block", md: "none" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            height: "50px",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <img
              src={user.projeto.url ? user.projeto.url : Logo}
              alt="sinGroup"
              style={{ height: "32px", width: "32px", borderRadius: "50%" }}
            />
            <Typography
              variant="subtitle1"
              sx={{
                ml: 1,
                fontWeight: "bold",
                color: "white",
                fontSize: "0.9rem",
              }}
            >
              {user.projeto.nome}
            </Typography>
          </Box>
          <IconButton
            onClick={() => setMenuMobileAberto(false)}
            sx={{ color: "white" }}
          >
            <ChevronLeft />
          </IconButton>
        </Box>
        <BarraLateralEstilizada>
          <Sidebar
            estaAberta={true}
            isMobile={true}
            aoFechar={() => setMenuMobileAberto(false)}
          />
        </BarraLateralEstilizada>
      </Drawer>

      {/* Conteúdo principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: "3rem",
          ml: { xs: 0, md: barraLateralAberta ? "13.281vw" : "50px" },
          transition: "all 0.3s ease-in-out",
          overflowX: "hidden",
        }}
      >
        <CabecalhoEstilizado
          position="fixed"
          sx={{
            height: APPBAR_H,
            // NÃO coloque zIndex: 0 aqui
            left: { xs: 0, md: barraLateralAberta ? "13.281vw" : "50px" },
            width: {
              xs: "100%",
              md: `calc(100% - ${barraLateralAberta ? "13.281vw" : "50px"})`,
            },
            borderBottom: "0.5px solid black",
            display: "flex",
            top: 0,
            justifyContent: "center",
          }}
        >
          <Toolbar sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setMenuMobileAberto(true)}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              <Menu />
            </IconButton>
            {titulo && (
              <Box
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1, // espaço entre ícone e texto
                  minWidth: 0, // evita quebra estranha
                }}
              >
                {tituloIcon && (
                  <Box
                    aria-hidden
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      lineHeight: 0,
                    }}
                  >
                    {tituloIcon}
                  </Box>
                )}
                <Typography
                  variant="h6"
                  component="h1"
                  sx={{
                    fontSize: "1.2rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={titulo}
                >
                  {titulo}
                </Typography>
              </Box>
            )}

            {isAdminOrMore ? (
              <SplitButton
                avatar={{ fallback: user.name.slice(0, 2).toUpperCase() }}
                options={[
                  {
                    label: "Todos os projetos",
                    icone: <FolderSharedIcon />,
                    onClick: () => navigate("/projetos"),
                  },
                  {
                    label: "Cadastro de Usuário",
                    icone: <PersonAddAlt1Icon />,
                    onClick: () => navigate("/cadastro-usuario"),
                  },
                  {
                    label: "Cadastro de projeto",
                    icone: <AddBusinessIcon />,
                    onClick: () => navigate("/cadastro-projeto"),
                  },
                  {
                    label: "Sair",
                    icone: <LogoutIcon />,
                    onClick: () => {
                      logout();

                      navigate("/");
                    },
                  },
                ]}
              />
            ) : (
              <SplitButton
                avatar={{
                  src: user.photoUrl,
                  fallback: user.name.slice(0, 2).toUpperCase(),
                }}
                options={[
                  {
                    label: "Todos os projetos",
                    icone: <FolderSharedIcon />,
                    onClick: () => navigate("/projetos"),
                  },
                  {
                    label: "Sair",
                    icone: <LogoutIcon />,
                    onClick: () => {
                      logout();

                      navigate("/");
                    },
                  },
                ]}
              />
            )}
          </Toolbar>
        </CabecalhoEstilizado>
        <Box
          sx={{
            /* p: { xs: 2 }, */
            mx: "auto",
            width: "100%",
            maxWidth: "100%",
            transition: "all 0.3s ease-in-out",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
