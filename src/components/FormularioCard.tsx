import { ReactNode, FormEvent } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  InputLabel,
  TextField,
} from "@mui/material";
import Grid from "@mui/material/Grid";

// Interface para propriedades do componente FormularioCard
interface PropriedadesFormularioCard {
  titulo: string;
  children: ReactNode;
  className?: string;
  aoEnviar?: (e: FormEvent) => void;
  mostrarBotaoEnviar?: boolean;
}

export function FormularioCard({
  titulo,
  children,
  className,
  aoEnviar,
  mostrarBotaoEnviar = false,
}: PropriedadesFormularioCard) {
  return (
    <Card
      sx={{
        p: 3,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        bgcolor: "white",
        mb: 3,
        width: "100%", // <= isso garante expansão
        maxWidth: "1000px", // <= opcional, mas limita um máximo
        margin: "0 auto", // <= centraliza o card
      }}
    >
      <Typography
        variant="h5"
        component="h2"
        align="center"
        sx={{ mb: 3, fontWeight: 500 }}
      >
        {titulo}
      </Typography>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          aoEnviar && aoEnviar(e);
        }}
      >
        <Box sx={{ "& > *": { mb: 3 } }}>{children}</Box>
        {mostrarBotaoEnviar && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: "#FF7A01",
                "&:hover": { bgcolor: "EE8552" },
              }}
            >
              Enviar
            </Button>
          </Box>
        )}
      </form>
    </Card>
  );
}

// Interface para propriedades do componente LinhaFormulario
interface PropriedadesLinhaFormulario {
  children: ReactNode;
  className?: string;
}

export function LinhaFormulario({
  children,
  className,
}: PropriedadesLinhaFormulario) {
  return (
    <Grid container spacing={2}>
      {children}
    </Grid>
  );
}

// Interface para propriedades do componente CampoFormulario
interface PropriedadesCampoFormulario {
  rotulo: string;
  nome: string;
  tipo?: string;
  placeholder?: string;
  valor?: string;
  aoMudar?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  obrigatorio?: boolean;
  mascara?: string;
  className?: string;
  largura?: number; // <- ajustado aqui
}

export function CampoFormulario({
  rotulo,
  nome,
  tipo = "text",
  placeholder = "",
  valor,
  aoMudar,
  obrigatorio = false,
  largura = 4,
}: PropriedadesCampoFormulario) {
  return (
    <Grid item xs={12} sm={12} md={largura}>
      <InputLabel
        htmlFor={nome}
        sx={{ mb: 1, fontSize: "0.875rem", fontWeight: 500 }}
      >
        {rotulo}
      </InputLabel>
      <TextField
        type={tipo}
        id={nome}
        name={nome}
        placeholder={placeholder}
        value={valor}
        onChange={aoMudar}
        required={obrigatorio}
        fullWidth
        size="small"
        variant="outlined"
      />
    </Grid>
  );
}
