import { login, logout } from "@/services/auth/authService";
import {
  Visibility,
  VisibilityOff,
  PersonOutline,
  LockOutlined,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Link,
  InputAdornment,
  IconButton,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import styles from "./Login.module.css";
import logoBayeux from "@/assets/bayeux-white.png";
import logoDefault from "@/assets/logo-padrao.png";
import gugaPet from "@/assets/guga-pet.png";
import cmjp from "@/assets/CMJP-PB.png";
import padPb from "@/assets/padPb.png";
import { ThemeProvider } from "@mui/material/styles";
import { themeMap, tema } from "../../theme.tsx"; // Nome correto
import { useEffect, useState } from "react";
import UserLogin from "@/@types/userLogin";
import { useLocation, useNavigate } from "react-router-dom";
import CustomAlert from "@/components/Alert";
import { useAuth } from "@/context/AuthContext";
import { useDynamicTheme } from "@/context/ThemeContext.tsx";

export default function Login() {
  const [mostraSenha, setMostraSenha] = useState(false);
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const { pathname } = useLocation();
  const { updateThemeColor } = useDynamicTheme();

  const logoMap: Record<string, string> = {
    "/bayeux": logoBayeux,
    "/guga-pet": gugaPet,
    "/conecta-cmjp": cmjp,
    "/pad-pb": padPb,
  };

  const logoSrc = logoMap[pathname.toLowerCase()] || logoDefault;
  const temaAtual = themeMap[pathname.toLowerCase()] || tema;
  const whiteColor = pathname === "/pad-pb" || "/" ? "white" : "black";
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => {
    logout(); // limpa com segurança, sem hooks fora de componente
    setFormData({ email: "", password: "" });
  }, [logout]);

  const [alert, setAlert] = useState<{
    show: boolean;
    category?: "success" | "error" | "info" | "warning";
    title?: string;
  }>({
    show: false,
    category: undefined,
    title: undefined,
  });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const data: UserLogin = {
      email: formData.email,
      password: formData.password,
    };
    try {
      const response = await login(data, updateThemeColor);
      if (response.status === 200) {
        const user = response.data.response.user;
        setUser(user);

        setAlert({
          show: true,
          category: "success",
          title: "Login Feito Com Sucesso!",
        });
        console.log("userRole", user.projetos.length);
        if (user.role === "ADMIN") {
          navigate("/projetos");
        } else if (user.role === "USER") {
          console.log("Aqui")
          console.log("length" , user.projetos.length )
          if (!user.projetos || user.projetos.length <= 1) {
            console.log("Dentro do if de lengh")
            navigate("/projeto");
          } else {
            navigate("/projetos");
          }
        }
      }
    } catch (error) {
      setAlert({
        show: true,
        category: "error",
        title: "Login ou Senha Incorretos!",
      });
      setTimeout(() => {
        setAlert({
          show: false,
        });
      }, 3000);
    }
    setLoading(false);
  }

  const toggleMostraSenha = () => setMostraSenha(!mostraSenha);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <ThemeProvider theme={temaAtual}>
      <Box className={styles.loginContainer}>
        {alert.show && alert.title && (
          <CustomAlert category={alert.category} title={alert.title} />
        )}

        <Box className={styles.loginForm}>
          <Box className={styles.titleForm}>
            <Box
              className={styles.logo}
              style={{ backgroundColor: temaAtual.palette.primary.main }}
              sx={{ mb: 2, pt: 1, pb: 1, minHeight: "5.5rem" }}
            >
              <img
                src={logoSrc}
                alt="Logo"
                style={{ width: "auto", height: "5rem" }}
              />
            </Box>
          </Box>
          <form className={styles.form} onSubmit={onSubmit}>
            <TextField
              fullWidth
              label="Seu e-mail"
              type="email"
              margin="normal"
              name="email"
              variant="outlined"
              size="medium"
              value={formData.email}
              onChange={handleChange}
              onFocus={(e) => e.target.setAttribute("autocomplete", "email")}
              autoComplete="off"
              sx={{ backgroundColor: "white", borderRadius: "4px" }}
              InputProps={{
                style: { color: "#333" },
                startAdornment: (
                  <InputAdornment position="start">
                    <Tooltip
                      title="Preencha com seu e-mail"
                      placement="top"
                      arrow
                      enterTouchDelay={0}
                    >
                      <PersonOutline
                        sx={{ fontSize: "1rem", color: "text.secondary" }}
                      />
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{
                shrink: true,
                style: {
                  color: "#333",
                  fontSize: "1rem",
                  fontWeight: 500,
                  borderRadius: "8px",
                },
              }}
            />

            <TextField
              fullWidth
              label="Sua senha"
              type={mostraSenha ? "text" : "password"}
              name="password"
              margin="normal"
              variant="outlined"
              size="medium"
              value={formData.password}
              onChange={handleChange}
              sx={{ backgroundColor: "white", borderRadius: "4px" }}
              InputProps={{
                style: { color: "#333" },
                startAdornment: (
                  <InputAdornment position="start">
                    <Tooltip
                      title="Digite sua senha"
                      placement="top"
                      arrow
                      enterTouchDelay={0}
                    >
                      <LockOutlined
                        sx={{ fontSize: "1rem", color: "text.secondary" }}
                      />
                    </Tooltip>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip
                      title={mostraSenha ? "Ocultar senha" : "Mostrar senha"}
                      placement="top"
                      arrow
                      enterTouchDelay={0}
                    >
                      <IconButton
                        onClick={toggleMostraSenha}
                        edge="end"
                        aria-label={
                          mostraSenha ? "Ocultar senha" : "Mostrar senha"
                        }
                      >
                        {mostraSenha ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{
                shrink: true,
                style: {
                  color: "#333",
                  fontSize: "1rem",
                  fontWeight: 500,
                  borderRadius: "8px",
                },
              }}
            />

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={1}
              mb={2}
            >
              <FormControlLabel
                control={<Checkbox size="small" />}
                sx={{ fontSize: "0.7rem" }}
                label="lembre de mim"
              />
              <Link
                href="#"
                fontSize="0.7rem"
                color="#FFFFF"
                sx={{
                  textDecoration: "none",
                  fontSize: "0.9rem",
                }}
              >
                Esqueceu a senha?
              </Link>
            </Box>

            <Button
              variant="contained"
              fullWidth
              style={{ backgroundColor: temaAtual.palette.primary.main }}
              sx={{ py: 1.2 }}
              type="submit"
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                <p style={{ color: `${whiteColor}`, fontSize: "1rem" }}>
                  Acessar
                </p>
              )}
            </Button>
          </form>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
