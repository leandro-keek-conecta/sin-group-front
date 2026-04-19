import { useRef, useState } from "react";
import { Button, Menu, MenuItem, Snackbar, Alert } from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { ilhaTokens } from "../../theme/tokens";
import {
  currentMonth,
  nextThirtyDays,
  rollingSevenDays,
} from "../utils/eventFormatters";

type RangeKey = "week" | "month" | "thirty";

const OPTIONS: {
  key: RangeKey;
  label: string;
  resolve: () => { start: Date; end: Date };
}[] = [
  { key: "month", label: "Mês atual", resolve: () => currentMonth() },
  { key: "week", label: "Próximos 7 dias", resolve: () => rollingSevenDays() },
  { key: "thirty", label: "Próximos 30 dias", resolve: () => nextThirtyDays() },
];

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function ExportRangeButton() {
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [popupError, setPopupError] = useState(false);

  const handleSelect = (key: RangeKey) => {
    const option = OPTIONS.find((o) => o.key === key);
    if (!option) return;
    const { start, end } = option.resolve();
    const url = `/ilha/eventos/imprimir?start=${toIsoDate(start)}&end=${toIsoDate(end)}`;
    const win = window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
    if (!win) setPopupError(true);
  };

  return (
    <>
      <Button
        ref={anchorRef}
        variant="outlined"
        size="small"
        startIcon={<PrintIcon />}
        endIcon={<ArrowDropDownIcon />}
        onClick={() => setOpen((v) => !v)}
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
        Imprimir
      </Button>
      <Menu
        anchorEl={anchorRef.current}
        open={open}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              mt: "4px",
              borderRadius: `${ilhaTokens.radius.md}px`,
              border: `1px solid ${ilhaTokens.color.border}`,
              boxShadow: ilhaTokens.shadow.md,
              minWidth: 200,
            },
          },
        }}
      >
        {OPTIONS.map((o) => (
          <MenuItem
            key={o.key}
            onClick={() => handleSelect(o.key)}
            sx={{
              fontSize: ilhaTokens.font.body.size,
              color: ilhaTokens.color.textPrimary,
              "&:hover": {
                backgroundColor: ilhaTokens.color.bgSubtle,
              },
            }}
          >
            {o.label}
          </MenuItem>
        ))}
      </Menu>
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
