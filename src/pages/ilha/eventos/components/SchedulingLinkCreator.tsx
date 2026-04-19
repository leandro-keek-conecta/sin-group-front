import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { ilhaTokens } from "../../theme/tokens";
import { useCalendlyEventTypes, useCreateSchedulingLink } from "../hooks/useCalendly";

export function SchedulingLinkCreator() {
  const { data: eventTypes = [], isLoading } = useCalendlyEventTypes();
  const createLink = useCreateSchedulingLink();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const activeTypes = eventTypes.filter((t) => t.active);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchor(e.currentTarget);
  const handleClose = () => setAnchor(null);

  const handleSelect = (eventTypeUri: string) => {
    handleClose();
    setGeneratedUrl(null);
    setCopied(false);
    createLink.mutate(
      { eventTypeUri },
      {
        onSuccess: (link) => setGeneratedUrl(link.bookingUrl),
      },
    );
  };

  const handleCopy = async () => {
    if (!generatedUrl) return;
    await navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Button
        variant="contained"
        size="small"
        startIcon={createLink.isPending ? <CircularProgress size={14} color="inherit" /> : <AddIcon />}
        onClick={handleOpen}
        disabled={isLoading || activeTypes.length === 0 || createLink.isPending}
        sx={{
          bgcolor: ilhaTokens.color.accent,
          textTransform: "none",
          fontWeight: ilhaTokens.font.h2.weight,
          "&:hover": { bgcolor: ilhaTokens.color.accentHover },
        }}
      >
        Novo agendamento
      </Button>

      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={handleClose}>
        {activeTypes.length === 0 ? (
          <MenuItem disabled>Nenhum tipo de evento ativo</MenuItem>
        ) : (
          activeTypes.map((type) => (
            <MenuItem key={type.uri} onClick={() => handleSelect(type.uri)}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: type.color || ilhaTokens.color.accent,
                  mr: 1,
                }}
              />
              <Typography component="span" sx={{ fontSize: ilhaTokens.font.body.size }}>
                {type.name}
              </Typography>
              <Typography
                component="span"
                sx={{
                  ml: 1,
                  fontSize: ilhaTokens.font.caption.size,
                  color: ilhaTokens.color.textTertiary,
                }}
              >
                {type.duration} min
              </Typography>
            </MenuItem>
          ))
        )}
      </Menu>

      {generatedUrl && (
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          sx={{
            px: `${ilhaTokens.space.sm}px`,
            py: "4px",
            borderRadius: `${ilhaTokens.radius.md}px`,
            border: `1px solid ${ilhaTokens.color.border}`,
            bgcolor: ilhaTokens.color.bgSurface,
            maxWidth: 320,
          }}
        >
          <Typography
            sx={{
              fontSize: ilhaTokens.font.caption.size,
              color: ilhaTokens.color.textSecondary,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
            }}
          >
            {generatedUrl}
          </Typography>
          <Button
            size="small"
            onClick={handleCopy}
            sx={{ minWidth: 0, p: "4px", color: ilhaTokens.color.textSecondary }}
            title="Copiar link"
          >
            <ContentCopyIcon sx={{ fontSize: 16 }} />
          </Button>
          <Button
            size="small"
            href={generatedUrl}
            target="_blank"
            rel="noreferrer"
            sx={{ minWidth: 0, p: "4px", color: ilhaTokens.color.accent }}
            title="Abrir link"
          >
            <OpenInNewIcon sx={{ fontSize: 16 }} />
          </Button>
        </Stack>
      )}
      {copied && (
        <Typography sx={{ fontSize: ilhaTokens.font.caption.size, color: ilhaTokens.color.success }}>
          Copiado!
        </Typography>
      )}
      {createLink.isError && (
        <Typography sx={{ fontSize: ilhaTokens.font.caption.size, color: ilhaTokens.color.danger }}>
          {createLink.error?.message ?? "Falha ao gerar link."}
        </Typography>
      )}
    </Stack>
  );
}
