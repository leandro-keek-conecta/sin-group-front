import styles from "./projectRegister.module.css";
import Forms from "@/components/Forms";
import { Layout } from "@/components/Layout";
import { useForm } from "react-hook-form";
import { getProjectInputs, SelectOption } from "./inputProject/projectInputList";
import type { ProjectFormValues } from "./inputProject/projectInputList";
import { Box, Card, Typography, CircularProgress, Button } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { createProject, fetchProjects, ProjectDTO, updateProject, CreateProjectPayload } from "@/services/projetos/projetoService";
import { logout } from "@/services/auth/authService";
import CustomAlert from "@/components/Alert";
import { GenericDataTable } from "@/components/DataTable";
import { columnsProject } from "./colunsOfData/colunsProjectData";
import { ModalDelete } from "./modalDelete";
import { fetchUsers } from "@/services/user/userService";
import User from "@/@types/IUserType";

const toNumericId = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isNaN(value) ? null : value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
};

const extractProjectUserIds = (users: ProjectDTO["users"]): number[] => {
  if (!Array.isArray(users)) {
    return [];
  }

  return users
    .map((userEntry) => {
      if (!userEntry || typeof userEntry !== "object") {
        return toNumericId(userEntry);
      }

      const byUserId = toNumericId((userEntry as { userId?: unknown }).userId);

      if (byUserId !== null) {
        return byUserId;
      }

      const byNestedUser = toNumericId(
        (userEntry as { user?: { id?: unknown } }).user?.id
      );

      if (byNestedUser !== null) {
        return byNestedUser;
      }

      return toNumericId((userEntry as { id?: unknown }).id);
    })
    .filter((id): id is number => id !== null);
};

const mergeUserOptionsWithProjectUsers = (
  options: SelectOption[],
  users: ProjectDTO["users"]): SelectOption[] => {
  if (!Array.isArray(users) || users.length === 0) {
    return options;
  }

  const optionsMap = new Map(options.map((option) => [option.value, option]));
  let updated = false;

  users.forEach((userEntry) => {
    if (!userEntry || typeof userEntry !== "object") {
      return;
    }

    const id =
      toNumericId((userEntry as { userId?: unknown }).userId) ??
      toNumericId((userEntry as { user?: { id?: unknown } }).user?.id);

    if (id === null || optionsMap.has(id)) {
      return;
    }

    const user = (
      userEntry as {
        user?: { name?: string | null; email?: string | null };
      }
    ).user;

    let label = `Usuario ${id}`;

    if (user) {
      const name = typeof user.name === "string" ? user.name.trim() : "";
      if (name.length > 0) {
        label = name;
      } else if (typeof user.email === "string" && user.email.length > 0) {
        label = user.email;
      }
    }

    optionsMap.set(id, { label, value: id });
    updated = true;
  });

  return updated ? Array.from(optionsMap.values()) : options;
};

const defaultValues: ProjectFormValues = {
  name: "",
  logoUrl: "",
  reportId: "",
  groupId: "",
  corHex: "",
  users: [],
};

export default function ProjectRegister() {
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProjectFormValues>({ defaultValues });

  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [projectSelected, setProjectSelected] = useState<ProjectDTO | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectDTO | null>(null);
  const [userOptions, setUserOptions] = useState<SelectOption[]>([]);
  const [alert, setAlert] = useState<{
    show: boolean;
    category?: "success" | "error" | "info" | "warning";
    title?: string;
  }>({
    show: false,
    category: undefined,
    title: undefined,
  });

  const projectInputs = useMemo(
    () => getProjectInputs(userOptions),
    [userOptions]
  );

  useEffect(() => {
    loadProjects();
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const users = await fetchUsers();
      const options = (users || [])
        .filter(
          (user: User): user is User & { id: number } =>
            typeof user.id === "number"
        )
        .map((user) => ({
          label: user.name || user.email || `Usuario ${user.id}`,
          value: user.id as number,
        }));

      setUserOptions(options);
    } catch (error) {
      console.error("Erro ao buscar usuarios:", error);
    }
  }

  async function loadProjects() {
    try {
      const data = await fetchProjects();
      if (Array.isArray(data)) setProjects(data);
    } catch (error) {
      console.error("Erro ao buscar projetos:", error);
    }
  }

  function handlerCancelEdit() {
    reset(defaultValues);
    setIsEditing(false);
    setProjectSelected(null);
  }

  const normalizeUserId = (value: any): number | null => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  if (value && typeof value === "object") {
    return normalizeUserId(value.id ?? value.userId ?? null);
  }
  return null;
};


  async function onSubmit(data: ProjectFormValues) {
  const usersNormalized = data.users
      .map((u) => {
        const id = normalizeUserId(u);
        return id ? { id } : null;
      })
      .filter(Boolean) as { id: number }[];

  const projectData: CreateProjectPayload = {
    name: data.name,
    logoUrl: data.logoUrl,
    corHex: data.corHex,
    reportId: data.reportId,
    groupId: data.groupId,
    users: usersNormalized,
  };


    try {
      setLoading(true);

      if (isEditing && projectSelected) {
        const users = data.users.map((userId) => ({ id: userId }));
        await updateProject({
          id: projectSelected.id,
          ...projectData,
          users,
        });
        setAlert({
          show: true,
          category: "success",
          title: "Projeto atualizado com sucesso!",
        });
      } else {
        await createProject(projectData);
        setAlert({
          show: true,
          category: "success",
          title: "Projeto cadastrado com sucesso!",
        });
      }

      reset(defaultValues);
      setIsEditing(false);
      setProjectSelected(null);
      await loadProjects();
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error && typeof error.message === "string"
          ? error.message
          : "Erro desconhecido";

      setAlert({
        show: true,
        category: "error",
        title: `Erro: ${errorMsg}`,
      });

      if (
        errorMsg.includes("nao autorizado") ||
        errorMsg.includes("nao tem permissao")
      ) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(row: ProjectDTO) {
    setProjectSelected(row);
    setIsEditing(true);
    setValue("name", row.name);
    setValue("logoUrl", row.logoUrl || "");
    setValue("reportId", row.reportId || "");
    setValue("groupId", row.groupId || "");
    setValue("corHex", row.corHex || "");

    const relatedUsers = extractProjectUserIds(row.users);

    if (Array.isArray(row.users) && row.users.length > 0) {
      setUserOptions((prev) =>
        mergeUserOptionsWithProjectUsers(prev, row.users)
      );
    }

    setValue("users", relatedUsers);
  }

  return (
    <Layout titulo="Cadastro de Projetos">
      {alert.show && alert.title && (
        <CustomAlert
          category={alert.category}
          title={alert.title}
          onClose={() => setAlert({ show: false })}
          autoHideDuration={5000}
        />
      )}
      {projectToDelete && (
        <ModalDelete
          openModal={openDeleteModal}
          setOpenModal={setOpenDeleteModal}
          idProject={projectToDelete.id}
          onDeleted={async () => {
            setAlert({
              show: true,
              category: "success",
              title: "Projeto deletado com sucesso!",
            });
            setProjectToDelete(null);
            await loadProjects();
          }}
        />
      )}
      <Card sx={{ p: 2, m: 2 }}>
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ mb: 1, textAlign: "center", pb: "0.9rem" }}
        >
          {isEditing ? "Editar Projeto" : "Dados do Projeto"}
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.container}>
          <Forms<ProjectFormValues>
            inputsList={projectInputs}
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

      <Box>
        <Box
          sx={{ m: 2, mb: 0, textAlign: "center" }}
          className={`${styles.buttonContainer} ${
            isEditing ? styles.visible : styles.hidden
          }`}
        >
          <Button
            onClick={() => handlerCancelEdit()}
            className={styles.buttonContent}
          >
            Cancelar edicao
          </Button>
        </Box>
        <Card sx={{ m: 2, mb: 5, mt: 0 }}>
          <GenericDataTable
            rows={projects}
            columns={columnsProject}
            onEdit={handleEdit}
            onDelete={(row) => {
              setProjectToDelete(row);
              setOpenDeleteModal(true);
            }}
            hideActions={false}
          />
        </Card>
      </Box>
    </Layout>
  );
}
