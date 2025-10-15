import { deleteProject } from "@/services/projetos/projetoService";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material";
interface ModalProps {
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
  idProject: number;
  onDeleted?: () => void;
}

export function ModalDelete({
  openModal,
  setOpenModal,
  idProject,
  onDeleted,
}: ModalProps) {
  async function handleDeleteProject(id: number) {
    try {
      await deleteProject(id);
      if (onDeleted) onDeleted(); // Chama callback de atualização
      setOpenModal(false);
    } catch (error) {
      console.error("Erro ao deletar projeto:", error);
    }
  }

  return (
    <Dialog
      open={openModal}
      onClose={() => setOpenModal(false)}
      maxWidth="sm"
      fullWidth
    >
      <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", width: '100%', gap: 1 }}>
        <DialogTitle>
          Excluir projeto?
        </DialogTitle>
      </Box>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="body1">
            Cuidado! Ao excluir um projeto, você removerá seus dados e
            desvinculará os usuários relacionados ao projeto e ao respectivo
            dashboard.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => handleDeleteProject(idProject)}
        >
          Deletar Projeto
        </Button>
      </DialogActions>
    </Dialog>
  );
}
