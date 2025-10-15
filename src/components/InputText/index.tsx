import { TextField } from "@mui/material";
import { useMediaQuery } from "@mui/material"; // Importa o hook

interface InputTexProps {
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "Date" | "inputFile"; // Tipos de input
  value?: string | number; // Valor do input
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // Manipulador de evento
  error?: boolean; // Indica se há erro
  helperText?: string; // Mensagem de erro ou ajuda
}

export default function InputTex({
  label,
  placeholder = "",
  type = "text",
  value,
  onChange,
  error = false,
  helperText = "",
}: InputTexProps) {
  const isMobile = useMediaQuery("(max-width:768px)");
  const size = isMobile ? "2.7rem" : "2.7rem";
  return (
    <TextField
      label={label}
      variant="outlined"
      placeholder={placeholder}
      type={type}
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      fullWidth
      InputLabelProps={{
        shrink: true,
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          height: size, // Altura do input
        },
        "& .MuiInputBase-input": {
          padding: "12px 14px",
          borderRadius: "8px",
          fontSize: "16px",
        },
      }}
    />
  );
}
