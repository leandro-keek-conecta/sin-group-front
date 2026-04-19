import { useState } from "react";
import { Button, Snackbar, Alert } from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import { ilhaTokens } from "../../theme/tokens";
import { rollingSevenDays } from "../utils/eventFormatters";

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function ExportWeekButton() {
  const [popupError, setPopupError] = useState(false);

  const handleClick = () => {
    const { start, end } = rollingSevenDays();
    const url = `/ilha/eventos/imprimir?start=${toIsoDate(start)}&end=${toIsoDate(end)}`;
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (!win) {
      setPopupError(true);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<PrintIcon />}
        onClick={handleClick}
        sx={{
          color: ilhaTokens.color.accent,
          borderColor: ilhaTokens.color.accent,
          textTransform: "none",
          fontWeight: ilhaTokens.font.h2.weight,
          "&:hover": {
            borderColor: ilhaTokens.color.accentHover,
            color: ilhaTokens.color.accentHover,
            backgroundColor: ilhaTokens.color.accentSoft,
          },
        }}
      >
        Imprimir 7 dias
      </Button>
      <Snackbar
        open={popupError}
        autoHideDuration={4000}
        onClose={() => setPopupError(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="warning"
          onClose={() => setPopupError(false)}
          sx={{ width: "100%" }}
        >
          Permita popups nesta página para gerar o PDF.
        </Alert>
      </Snackbar>
    </>
  );
}
