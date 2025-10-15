import {
  Autocomplete,
  CircularProgress,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Stack,
} from "@mui/material";
import { useFormContext } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { createProject, fetchProjects, ProjectDTO } from "@/services/projetos/projetoService";
import { Control } from "react-hook-form";

interface Props {
  control: Control<any>;
  name: string;
}

export default function ProjectSelector({ control, name }: Props) {
  const { setValue } = useFormContext(); // pega do contexto
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [typed, setTyped] = useState(""); // para saber o texto digitado

  /** ---------- Busca inicial ---------- */
  useEffect(() => {
    fetchProjects()
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  /** ---------- Memo p/ opções ---------- */
  const options = useMemo(
    () => projects.map((p) => ({ label: p.name, id: p.id })),
    [projects],
  );

  /** ---------- RHF Controller ---------- */
  return (
    <>
      <Controller
        control={control}
        name={name}
        rules={{ required: "Nome do projeto é obrigatório" }}
        render={({ field, fieldState }) => (
          <Autocomplete
            freeSolo
            options={options}
            loading={loading}
            onInputChange={(_, value) => setTyped(value)}
            noOptionsText={
              typed
                ? `Projeto "${typed}" não encontrado. Clique para criar.`
                : "Nenhum projeto encontrado"
            }
            onChange={(_, value) => {
              // value pode ser string (freeSolo) ou {label, id}
              if (!value) return;
              if (typeof value === "string") {
                /** Usuário clicou no "criar novo" (é a própria string) */
                setDialogOpen(true);
              } else {
                field.onChange(value.id); // salva só o id no form
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Projeto"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
            getOptionLabel={(opt) => (typeof opt === "string" ? opt : opt.label)}
            isOptionEqualToValue={(o, v) => o.id === (v as any).id}
          />
        )}
      />

      {/* ---------- Modal de criação ---------- */}
      {dialogOpen && (
        <CreateProjectDialog
          defaultName={typed}
          onClose={async (created) => {
            setDialogOpen(false);
            if (created) {
              // Atualiza lista e seleciona auto
              const newProj = await createProject(created);
              setProjects((prev) => [...prev, newProj]);
              // Selecionar no campo
              setValue(name, newProj.id); 
            }
          }}
        />
      )}
    </>
  );
}

/** ------------------------------------------------------------
 *    Dialog interno reaproveitado (poderia ir para outro arquivo)
 * ----------------------------------------------------------- */
interface DialogProps {
  defaultName: string;
  onClose: (created?: { name: string; logoUrl?: string }) => void;
}

function CreateProjectDialog({ defaultName, onClose }: DialogProps) {
  const { handleSubmit, register, formState } = useForm({
    defaultValues: { name: defaultName, logoUrl: "" },
  });

  return (
    <Dialog open onClose={() => onClose()}>
      <DialogTitle>Novo projeto</DialogTitle>
      <form
        onSubmit={handleSubmit((data) => onClose(data))}
        style={{ width: 400 }}
      >
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label="Nome"
              {...register("name", { required: "Nome é obrigatório" })}
              error={!!formState.errors.name}
              helperText={formState.errors.name?.message}
            />
            <TextField label="Logo URL (opcional)" {...register("logoUrl")} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onClose()}>Cancelar</Button>
          <Button type="submit" variant="contained">
            Criar projeto
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
