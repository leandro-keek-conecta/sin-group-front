import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Box, Button, Card, CircularProgress, Typography } from "@mui/material";

import { Layout } from "@/components/Layout";
import Forms from "@/components/Forms";
import CustomAlert from "@/components/Alert";
import SelectButton from "@/components/selectButtom";
import { GenericDataTable } from "@/components/DataTable";

import styles from "./automationChat.module.css";
import {
  AutomationChatFormValues,
  getAutomationChatInputs,
  SelectOption,
} from "./inputs/automationChatInputList";
import {
  createAutomationChat,
  fetchAutomationChats,
  updateAutomationChat,
} from "@/services/automationChat/automationChat";
import { fetchProjects } from "@/services/projetos/projetoService";
import AutomationChat from "@/@types/IAutomationChat";
import { columnsAutomationChats } from "./colunsOfChats";
import { ModalAutomationChatDelete } from "./modalDelete";
import { useProject } from "@/context/projectContext";

type AutomationChatRow = AutomationChat & { projectNames: string };

const defaultValues: AutomationChatFormValues = {
  id: undefined,
  slug: "",
  title: "",
  description: "",
  url: "",
  isActive: true,
  projetoId: undefined,
};

const getChatProjetoId = (chat: AutomationChat): number | undefined => {
  if (typeof chat.projetoId === "number") return chat.projetoId;
  if (typeof chat.projeto?.id === "number") return chat.projeto.id;
  const pivot = chat.projetos?.find(
    (item) => typeof item?.projetoId === "number"
  );
  return pivot?.projetoId;
};

const resolveProjectName = (
  chat: AutomationChat,
  options: SelectOption[]
): string => {
  const chatProjectId = getChatProjetoId(chat);
  if (chatProjectId) {
    const option = options.find((opt) => opt.value === chatProjectId);
    if (option?.label) {
      return option.label;
    }
  }

  return (
    chat.projeto?.name ??
    chat.projetos?.find((pivot) => pivot?.projeto?.name)?.projeto?.name ??
    ""
  );
};

export default function AutomationChatPage() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AutomationChatFormValues>({ defaultValues });

  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [projectOptions, setProjectOptions] = useState<SelectOption[]>([]);
  const { projectId: storedProjectId, setProjectId: persistProjectId } =
    useProject();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    typeof storedProjectId === "number" ? storedProjectId : null
  );
  const [automationChats, setAutomationChats] = useState<AutomationChatRow[]>(
    []
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<AutomationChatRow | null>(
    null
  );
  const [alert, setAlert] = useState<{
    show: boolean;
    category?: "success" | "error" | "info" | "warning";
    title?: string;
  }>({
    show: false,
  });
  const latestRequestRef = useRef(0);

  const automationChatInputs = useMemo(
    () => getAutomationChatInputs(projectOptions),
    [projectOptions]
  );
  const updateSelectedProject = useCallback(
    (value: number | null) => {
      setSelectedProjectId(value);
      persistProjectId(value);
    },
    [persistProjectId]
  );

  const loadAutomationChats = useCallback(
    async (projectId: number) => {
      setAutomationChats([]);
      setTableLoading(true);
      const requestId = latestRequestRef.current + 1;
      latestRequestRef.current = requestId;

      try {
        const data = await fetchAutomationChats(projectId);
        if (latestRequestRef.current !== requestId) return;

        const formatted = data.map<AutomationChatRow>((chat) => ({
          ...chat,
          projectNames: resolveProjectName(chat, projectOptions),
        }));

        setAutomationChats(formatted);
      } catch (error) {
        if (latestRequestRef.current !== requestId) return;

        const message =
          error instanceof Error
            ? error.message
            : "Erro ao carregar automacoes.";
      } finally {
        if (latestRequestRef.current !== requestId) return;
        setTableLoading(false);
      }
    },
    [projectOptions]
  );

  useEffect(() => {
    async function loadProjects() {
      try {
        const fetchedProjects = await fetchProjects();
        const formatted = [...fetchedProjects]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((project) => ({ label: project.name, value: project.id }));
        setProjectOptions(formatted);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Erro ao carregar projetos.";
        setAlert({
          show: true,
          category: "error",
          title: message,
        });
      }
    }

    loadProjects();
  }, []);

  useEffect(() => {
    if (projectOptions.length === 0) return;
    if (
      typeof storedProjectId === "number" &&
      projectOptions.some((option) => option.value === storedProjectId)
    ) {
      updateSelectedProject(storedProjectId);
      return;
    }
    if (
      typeof selectedProjectId === "number" &&
      projectOptions.some((option) => option.value === selectedProjectId)
    ) {
      return;
    }
    const fallback = projectOptions[0]?.value ?? null;
    updateSelectedProject(fallback ?? null);
  }, [
    projectOptions,
    storedProjectId,
    selectedProjectId,
    updateSelectedProject,
  ]);

  useEffect(() => {
    if (typeof storedProjectId === "number") {
      setSelectedProjectId((current) =>
        current === storedProjectId ? current : storedProjectId
      );
    }
  }, [storedProjectId]);

  useEffect(() => {
    if (selectedProjectId != null) {
      loadAutomationChats(selectedProjectId);
    } else {
      setAutomationChats([]);
    }
  }, [selectedProjectId, loadAutomationChats]);

  function handleAssignForm(chat: AutomationChatRow) {
    const chatProjectId = getChatProjetoId(chat);

    reset({
      id: chat.id,
      slug: chat.slug,
      title: chat.title,
      description: chat.description,
      url: chat.url,
      isActive: chat.isActive,
      projetoId:
        chatProjectId ??
        (typeof selectedProjectId === "number" ? selectedProjectId : undefined),
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    reset(defaultValues);
    setIsEditing(false);
  }

  async function onSubmit(data: AutomationChatFormValues) {
    setLoading(true);
    const resolvedProjetoId =
      typeof data.projetoId === "number"
        ? data.projetoId
        : typeof selectedProjectId === "number"
        ? selectedProjectId
        : undefined;

    if (typeof resolvedProjetoId !== "number") {
      setAlert({
        show: true,
        category: "error",
        title: "Selecione um projeto para vincular a automacao.",
      });
      setLoading(false);
      return;
    }

    const payload = {
      slug: data.slug,
      title: data.title,
      description: data.description,
      url: data.url,
      isActive: data.isActive,
      projetoId: resolvedProjetoId,
    };

    try {
      if (isEditing && data.id) {
        await updateAutomationChat({
          id: data.id,
          ...payload,
        });
        setAlert({
          show: true,
          category: "success",
          title: "Automacao atualizada com sucesso!",
        });
      } else {
        await createAutomationChat(payload);
        setAlert({
          show: true,
          category: "success",
          title: "Automacao cadastrada com sucesso!",
        });
      }

      reset(defaultValues);
      setIsEditing(false);

      if (selectedProjectId != null) {
        await loadAutomationChats(selectedProjectId);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao salvar os dados da automacao.";
      setAlert({
        show: true,
        category: "error",
        title: message,
      });
    } finally {
      setLoading(false);
    }
  }

  function handleDeleteAutomationChat(row: AutomationChatRow) {
    setChatToDelete(row);
    setDeleteModalOpen(true);
  }

  return (
    <Layout titulo="Cadastro de Automacoes">
      {alert.show && alert.title && (
        <CustomAlert
          category={alert.category}
          title={alert.title}
          onClose={() => setAlert({ show: false })}
          autoHideDuration={5000}
        />
      )}

      {chatToDelete && (
        <ModalAutomationChatDelete
          openModal={deleteModalOpen}
          setOpenModal={(value) => {
            setDeleteModalOpen(value);
            if (!value) {
              setChatToDelete(null);
            }
          }}
          automationChatId={chatToDelete.id}
          automationChatTitle={chatToDelete.title}
          onDeleted={async () => {
            setAlert({
              show: true,
              category: "success",
              title: "Automacao deletada com sucesso!",
            });
            setChatToDelete(null);
            setDeleteModalOpen(false);
            if (selectedProjectId != null) {
              await loadAutomationChats(selectedProjectId);
            }
          }}
        />
      )}

      <Card sx={{ p: 2, m: 2 }}>
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ mb: 1, textAlign: "center", pb: "0.9rem" }}
        >
          {isEditing ? "Editar automacao" : "Dados da automacao"}
        </Typography>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className={styles.container}
          noValidate
        >
          <Forms<AutomationChatFormValues>
            inputsList={automationChatInputs}
            control={control}
            errors={errors}
          />

          <Box sx={{ mt: 2 }} className={styles.bottonContainer}>
            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : isEditing ? (
                "Atualizar"
              ) : (
                "Cadastrar"
              )}
            </button>
          </Box>
        </form>
      </Card>

      <Box sx={{ m: 2 }}>
        <Box
          sx={{ mb: 0, textAlign: "center" }}
          className={`${styles.buttonContainer} ${
            isEditing ? styles.visible : styles.hidden
          }`}
        >
          <Button
            onClick={handleCancelEdit}
            className={styles.buttonContent}
          >
            Cancelar edicao
          </Button>
        </Box>

        <Card sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              mb: 2,
              alignItems: { xs: "stretch", sm: "center" },
              justifyContent: "space-between",
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              Automacoes cadastradas
            </Typography>
            {projectOptions.length > 0 && (
              <Box sx={{ minWidth: { xs: "100%", sm: 280 } }}>
                <SelectButton
                  label="Filtrar por projeto"
                  placeholder="Selecione um projeto"
                  options={projectOptions}
                  value={selectedProjectId}
                  onChange={(value) => {
                    if (typeof value === "number") {
                      updateSelectedProject(value);
                    } else {
                      updateSelectedProject(null);
                    }
                  }}
                />
              </Box>
            )}
          </Box>

          {tableLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 200,
              }}
            >
              <CircularProgress />
            </Box>
          ) : selectedProjectId == null ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography variant="body1">
                Selecione um projeto para visualizar as automacoes.
              </Typography>
            </Box>
          ) : (
            <GenericDataTable
              columns={columnsAutomationChats}
              rows={automationChats}
              onEdit={handleAssignForm}
              onDelete={handleDeleteAutomationChat}
            />
          )}
        </Card>
      </Box>
    </Layout>
  );
}
