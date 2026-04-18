import { useState } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

import { deleteAutomationChat } from "@/services/automationChat/automationChat";

interface ModalProps {
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
  automationChatId: number;
  automationChatTitle?: string;
  onDeleted?: () => Promise<void> | void;
}

export function ModalAutomationChatDelete({
  openModal,
  setOpenModal,
  automationChatId,
  automationChatTitle,
  onDeleted,
}: ModalProps) {
  const [loading, setLoading] = useState(false);

  async function handleDeleteAutomation() {
    try {
      setLoading(true);
      await deleteAutomationChat(automationChatId);
      if (onDeleted) {
        await onDeleted();
      }
      setOpenModal(false);
    } catch (error) {
      console.error("Erro ao deletar automacao:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={openModal}
      onClose={() => setOpenModal(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Excluir automacao?</DialogTitle>
      <DialogContent dividers>
        <Typography>
          Tem certeza de que deseja excluir{" "}
          <strong>{automationChatTitle ?? "esta automacao"}</strong>? Essa acao
          nao pode ser desfeita.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenModal(false)} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleDeleteAutomation}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={20} sx={{ color: "white" }} />
          ) : (
            "Deletar automacao"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
