import CustomAlert from "@/components/Alert";
import { resetPassword } from "@/services/restorePassword/restorePassword";
import {
  ArrowBack,
  LockOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  Fade,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import logoDefault from "@/assets/sin-logo.png";

type AlertState = {
  show: boolean;
  category?: "success" | "error" | "info" | "warning";
  title?: string;
};

const containerSx = {
  position: "relative",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  padding: { xs: 3, md: 6 },
  background: "linear-gradient(140deg, #f5f5f5 0%, #e3e3e3 100%)",
};

const cardSx = {
  width: "100%",
  maxWidth: 460,
  borderRadius: "28px",
  overflow: "hidden",
  backgroundColor: "#ececec",
  border: "1px solid rgba(17, 24, 39, 0.12)",
  boxShadow: "18px 22px 48px rgba(15, 23, 42, 0.15)",
};

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px",
    backgroundColor: "#f7f8fd",
    "& fieldset": {
      borderColor: "rgba(17,24,39,0.15)",
    },
    "&:hover fieldset": {
      borderColor: "#1f2937",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#1f2937",
      borderWidth: 1.5,
    },
  },
  "& .MuiInputBase-input": {
    paddingTop: 1.5,
    paddingBottom: 1.5,
  },
};

const submitButtonSx = {
  py: 1.25,
  fontWeight: 700,
  fontSize: "1rem",
  textTransform: "none",
  borderRadius: "14px",
  backgroundColor: "#1f2937",
  color: "#ffffff",
  boxShadow: "0 16px 24px rgba(15, 23, 42, 0.2)",
  "&:hover": {
    backgroundColor: "#111827",
  },
  "&.Mui-disabled": {
    backgroundColor: "rgba(15,23,42,0.4)",
    color: "rgba(255,255,255,0.75)",
  },
};

export default function ChangePassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token") ?? "";
  const uid = searchParams.get("uid") ?? "";

  const [mostraSenha, setMostraSenha] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>({ show: false });
  const [isMounted, setIsMounted] = useState(false);

  const redirectTimeout = useRef<number | null>(null);

  useEffect(() => {
    const mountTimeout = window.setTimeout(() => setIsMounted(true), 80);

    return () => {
      if (redirectTimeout.current) {
        clearTimeout(redirectTimeout.current);
      }
      window.clearTimeout(mountTimeout);
    };
  }, []);

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  }

  function toggleMostraSenha() {
    setMostraSenha((prev) => !prev);
  }

  function closeAlert() {
    setAlert({ show: false });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAlert({ show: false });

    if (redirectTimeout.current) {
      clearTimeout(redirectTimeout.current);
      redirectTimeout.current = null;
    }

    if (password !== confirm) {
      setAlert({
        show: true,
        category: "error",
        title: "As senhas nao coincidem.",
      });
      return;
    }

    if (!token || !uid) {
      setAlert({
        show: true,
        category: "error",
        title: "Link de redefinicao invalido ou expirado.",
      });
      return;
    }

    try {
      setLoading(true);
      await resetPassword(token, uid, password);

      setAlert({
        show: true,
        category: "success",
        title: "Senha alterada com sucesso! Voce sera redirecionado...",
      });

      setPassword("");
      setConfirm("");

      redirectTimeout.current = window.setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Falha ao redefinir senha. Tente novamente.";

      setAlert({
        show: true,
        category: "error",
        title: message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box component="section" sx={containerSx}>
      <IconButton
        aria-label="Voltar"
        onClick={handleBack}
        sx={{
          position: "absolute",
          top: { xs: 20, md: 28 },
          left: { xs: 20, md: 32 },
          backgroundColor: "rgba(255,255,255,0.85)",
          border: "1px solid rgba(17,24,39,0.1)",
          boxShadow: "0 10px 24px rgba(15,23,42,0.15)",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: "#ffffff",
            transform: "translateX(-2px)",
          },
        }}
      >
        <ArrowBack />
      </IconButton>

      {alert.show && alert.title && (
        <CustomAlert
          category={alert.category}
          title={alert.title}
          onClose={closeAlert}
          autoHideDuration={alert.category === "success" ? 3000 : 5000}
        />
      )}

      <Fade in={isMounted} timeout={600}>
        <Card elevation={0} sx={cardSx}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f6f6f6",
              borderBottom: "1px solid rgba(17, 24, 39, 0.12)",
              py: { xs: 3, md: 4 },
            }}
          >
            <Box
              component="img"
              src={logoDefault}
              alt="SIN Group"
              sx={{ height: { xs: 56, md: 64 } }}
            />
          </Box>

          <Box
            sx={{
              p: { xs: 4, md: 5 },
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <Box>
              <Typography
                variant="overline"
                sx={{ letterSpacing: 1.2, color: "rgba(17,24,39,0.6)" }}
              >
                Recuperar acesso
              </Typography>
              <Typography
                variant="h4"
                component="h1"
                fontWeight={700}
                sx={{ mt: 0.5, color: "#0f172a" }}
              >
                Redefinir senha
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Escolha uma nova senha forte para manter sua conta segura.
              </Typography>
            </Box>

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                fullWidth
                label="Sua senha"
                type={mostraSenha ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                InputProps={{
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
                  sx: { fontWeight: 600, color: "#1f2937" },
                }}
                sx={textFieldSx}
              />

              <TextField
                fullWidth
                label="Confirme a senha"
                type={mostraSenha ? "text" : "password"}
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Tooltip
                        title="Digite sua senha novamente"
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
                  sx: { fontWeight: 600, color: "#1f2937" },
                }}
                sx={textFieldSx}
              />

              <Button
                type="submit"
                variant="contained"
                disableElevation
                fullWidth
                disabled={loading}
                sx={submitButtonSx}
              >
                {loading ? "Enviando..." : "Atualizar senha"}
              </Button>
            </Box>
          </Box>
        </Card>
      </Fade>
    </Box>
  );
}
