import CardProject from "@/components/CardProjetct";
import Logo from "../../assets/logo-horizontal-n.png";
import { Layout } from "@/components/Layout";
import { getEmbedToken } from "@/services/powerBI/poweBIService";
import { fetchProjects as fetchAllProjects } from "@/services/projetos/projetoService";
import {
  Box,
  Grid,
  CircularProgress,
  styled,
  AppBar,
  Toolbar,
  IconButton,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Menu } from "@mui/icons-material";
import LogoutIcon from "@mui/icons-material/Logout";
import FolderSharedIcon from "@mui/icons-material/FolderShared";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import { usePowerBI } from "@/context/powerbiContext";
import SplitButton from "@/components/SplitButton";
import { logout } from "@/services/auth/authService";
import { useNavigate } from "react-router-dom";

const CabecalhoEstilizado = styled(AppBar)(({ theme }) => ({
  backgroundColor: "white",
  color: "#333333",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  zIndex: theme.zIndex.drawer + 1,
}));

export default function Projects() {
  const [projetos, setProjetos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [user, setUser] = useState<any>(null);
  const { setPages, setReportInstance } = usePowerBI();
  const navigate = useNavigate();

  // Carrega o usuario do localStorage e limpa o estado do embed
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      console.log("Usuario logado:", parsed);
      setUser(parsed);
    }

    setPages([]);
    setReportInstance(null);
  }, [setPages, setReportInstance]);

  const avatarFallback = useMemo(() => {
    if (!user) return "U";
    if (user.initials) return user.initials;
    if (user.name) {
      return (
        user.name
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((part: string) => part[0]?.toUpperCase() ?? "")
          .join("") || "U"
      );
    }
    return "U";
  }, [user]);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/");
  }, [navigate]);

  const menuOptions = useMemo(() => {
    if (!user) {
      return [
        {
          label: "Sair",
          icone: <LogoutIcon />,
          onClick: handleLogout,
        },
      ];
    }

    if (user.role === "ADMIN") {
      return [
        {
          label: "Cadastro de Usuario",
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
          onClick: handleLogout,
        },
      ];
    }

    return [
      {
        label: "Sair",
        icone: <LogoutIcon />,
        onClick: handleLogout,
      },
    ];
  }, [handleLogout, navigate, user]);

  // Busca token de embed do Power BI
  async function fetchToken() {
    try {
      const response = await getEmbedToken();
      setToken(response.data.access_token);
    } catch (error) {
      console.error("Erro ao atualizar token:", error);
    }
  }

  // Carrega projetos de acordo com o tipo de usuario
  async function loadProjects() {
    try {
      setLoading(true);

      if (user?.role !== "ADMIN") {
        console.log(
          "Usuario comum, carregando projetos do objeto de usuario..."
        );
        const { projetos }: any = user;
        if (projetos?.length) {
          console.log(projetos);
          setProjetos(projetos.filter((item: any) => item.id !== 1));
        } else {
          setProjetos([]);
        }
      } else {
        console.log("Usuario ADMIN, buscando todos os projetos...");
        const response = await fetchAllProjects();
        console.log(response);
        const treatedList = response.filter((item: any) => item.id !== 1);
        setProjetos(treatedList);
      }
    } catch (error) {
      console.error("Erro ao carregar projetos:", error);
    } finally {
      setLoading(false);
    }
  }

  // Executa assim que `user` estiver disponivel
  useEffect(() => {
    if (user) {
      fetchToken();
      loadProjects();
    }
  }, [user]);

  return (
    <Layout titulo="Tela de Projetos" mostrarSidebar={false}>
      <Box padding={0} sx={{ width: "100%" }}>
        <CabecalhoEstilizado
          position="relative"
          sx={{
            zIndex: 0,
            height: "3rem",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Toolbar
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              gap: 2,
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              sx={{ display: { xs: "block", md: "none" } }}
            >
              <Menu />
            </IconButton>
            <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
              <img
                src={Logo}
                alt="sinGroup"
                style={{ height: "2.5rem", width: "auto" }}
              />
            </Box>
            <SplitButton
              avatar={{ src: user?.photoUrl, fallback: avatarFallback }}
              options={menuOptions}
            />
          </Toolbar>
        </CabecalhoEstilizado>

        <Box padding={2} sx={{ width: "100%" }}>
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="300px"
            >
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {projetos.map((project) => (
                <Grid item xs={12} md={6} key={project.id}>
                  <CardProject
                    id={project.id}
                    name={project.nome ? project.nome : project.name}
                    logoUrl={project.url}
                    reportId={project.reportId}
                    groupId={project.groupId}
                    token={token}
                    users={user ? [user] : []}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>
    </Layout>
  );
}
