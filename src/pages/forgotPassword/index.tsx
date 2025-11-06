import {
  Alert,
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
import { ArrowBack, MailOutline } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendEmail } from "@/services/restorePassword/restorePassword";
import logoDefault from "@/assets/sin-logo.png";

type FeedbackState = {
  type: "success" | "error";
  message: string;
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

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsMounted(true), 80);
    return () => window.clearTimeout(timeoutId);
  }, []);

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setFeedback({
        type: "error",
        message: "Informe um email valido.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await sendEmail(trimmedEmail);
      setFeedback({
        type: "success",
        message:
          "Email enviado! Se encontrarmos este endereco, voce recebera as instrucoes para redefinir a senha.",
      });
      setEmail("");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Nao foi possivel enviar o pedido. Tente novamente.";
      setFeedback({
        type: "error",
        message,
      });
    } finally {
      setIsSubmitting(false);
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
                Esqueci minha senha
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Informe o email cadastrado para receber um link seguro e
                redefinir sua senha com tranquilidade.
              </Typography>
            </Box>

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                fullWidth
                type="email"
                label="Email corporativo"
                placeholder="nome.sobrenome@empresa.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Tooltip
                        title="Email cadastrado"
                        placement="top"
                        arrow
                        enterTouchDelay={0}
                      >
                        <MailOutline
                          sx={{ fontSize: "1.1rem", color: "text.secondary" }}
                        />
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{
                  shrink: true,
                  sx: { fontWeight: 600, color: "#1f2937" },
                }}
                sx={{
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
                }}
              />

              <Button
                type="submit"
                variant="contained"
                disableElevation
                fullWidth
                disabled={isSubmitting}
                sx={{
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
                }}
              >
                {isSubmitting ? "Enviando..." : "Enviar link de recuperacao"}
              </Button>
            </Box>

            {feedback && (
              <Alert
                severity={feedback.type}
                sx={{
                  borderRadius: "12px",
                  backgroundColor: "rgba(255,255,255,0.85)",
                }}
              >
                {feedback.message}
              </Alert>
            )}
          </Box>
        </Card>
      </Fade>
    </Box>
  );
}
