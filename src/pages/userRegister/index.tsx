import Forms from "@/components/Forms";
import styles from "./register.module.css";
import { Layout } from "@/components/Layout";
import { Box, Button, Card, CircularProgress, Typography } from "@mui/material";
import { getUserInputs } from "./inputs/userInput";
import { set, useForm } from "react-hook-form";
import { GenericDataTable } from "@/components/DataTable";
import { columnsUsers } from "./colunsOfUsers/colunsUserData";
import { useCallback, useEffect, useState } from "react";
import {
  createUser,
  fetchUsers,
  updateUser,
} from "@/services/user/userService";
import { fetchProjects } from "@/services/projetos/projetoService";
import User from "@/@types/IUserType";
import CustomAlert from "@/components/Alert";
import { ModalUserDelete } from "./modalDelete";
import { usePowerBI } from "@/context/powerbiContext";

export type FormValues = {
  id?: number; // opcional — útil para update
  projetos: { id: number }[];
  name: string;
  email: string;
  profession: string;
  password: string;
  passwordConfirm: string;
  role: "USER" | "ADMIN";
};

export default function UserRegister() {
  const {
    control,
    formState: { errors },
    reset: resetEdit,
    setValue,
    handleSubmit: handleCreate,
  } = useForm<FormValues>();
  const [users, setUsers] = useState([]);
  const [projectOptions, setProjectOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [alert, setAlert] = useState<{
    show: boolean;
    category?: "success" | "error" | "info" | "warning";
    title?: string;
  }>({
    show: false,
    category: undefined,
    title: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { setPages, setReportInstance } = usePowerBI();

  useEffect(() => {
    setPages([]);
    setReportInstance(null);
  }, [setPages, setReportInstance]);

  function handlerCancelEdit() {
    setIsEditing(false);
    resetEdit({
      id: undefined,
      name: "",
      email: "",
      profession: "",
      role: "USER",
      projetos: [],
    });
  }

  async function loadUsers() {
    try {
      const data = await fetchUsers();
      const usersWithProjects = data
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((item) => {
          const projectList = item.projetos ?? [];
          return {
            ...item,
            projetos: projectList,
            projectNames:
              item.projetos?.map((pivot) => pivot.projeto.name).join(", ") ||
              "",
          };
        });

      setUsers(usersWithProjects);
    } catch (error) {
      console.log(error);
    }
  }

  async function loadProjects() {
    try {
      const projects = await fetchProjects();
      const formatted = projects.map((p) => ({
        label: p.name,
        value: p.id,
      }));
      setProjectOptions(formatted);
    } catch (error) {
      console.error("Erro ao carregar projetos:", error);
    }
  }

  async function onSubmitEdit(data: FormValues) {
    setLoading(true);
    try {
      const { projetos, ...dataWithoutProjects } = data;

      // 🔹 Corrige qualquer profundidade (id, {id}, {id:{id}})
      const projetosLimpos = (projetos ?? [])
        .map((p) => {
          const id =
            typeof p === "number"
              ? p
              : typeof p === "object" && p !== null
              ? typeof (p as any).id === "number"
                ? (p as any).id
                : typeof (p as any).id?.id === "number"
                ? (p as any).id.id
                : null
              : null;
          return id ? { id } : null;
        })
        .filter(Boolean); // remove nulos

      // 🔹 Envia o nome correto esperado pelo backend
      const dataProject = {
        ...dataWithoutProjects,
        projetos: projetosLimpos,
      };

      await updateUser(dataProject);
      await loadUsers();
      handlerCancelEdit();
      setAlert({
        show: true,
        category: "success",
        title: "Usuario atualizado com sucesso!",
      });
    } catch (error: any) {
      const msg = error?.message || "Erro ao atualizar usuario";
      setAlert({ show: true, category: "error", title: msg });
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteUser = useCallback((row: any) => {
    setUserToDelete(row);
    setOpenDeleteModal(true);
  }, []);

  async function handleRegisterUser(data: FormValues) {
    try {
      setLoading(true);
      const { projetos, ...dataWithoutProjects } = data;

      // 🔹 Corrige qualquer profundidade (id, {id}, {id:{id}})
      const projetosLimpos = (projetos ?? [])
        .map((p) => {
          const id =
            typeof p === "number"
              ? p
              : typeof p === "object" && p !== null
              ? typeof (p as any).id === "number"
                ? (p as any).id
                : typeof (p as any).id?.id === "number"
                ? (p as any).id.id
                : null
              : null;
          return id ? { id } : null;
        })
        .filter(Boolean); // remove nulos

      // 🔹 Envia o nome correto esperado pelo backend
      const dataProject = {
        ...dataWithoutProjects,
        projetos: projetosLimpos,
      };
      const response = await createUser(dataProject);
      setAlert({
        show: true,
        category: "success",
        title: "Usuario cadastrado com sucesso!",
      });
      resetEdit();
      await loadUsers();
    } catch (error: any) {
      const errorMsg = error?.message || "Erro desconhecido";
      if (error.message === "O email informado j� est� cadastrado.") {
        setAlert({
          show: true,
          category: "error",
          title: `Error: Email já cadastrado`,
        });
      }
      if (
        typeof errorMsg === "string" &&
        (errorMsg.includes("nao autorizado") ||
          errorMsg.includes("nao tem permissao"))
      ) {
      }
    } finally {
      setLoading(false);
    }
  }

  async function OnChoiceAction(data: FormValues) {
    if (isEditing) {
      await onSubmitEdit(data);
    } else {
      await handleRegisterUser(data);
    }
  }

  function changeForEdit(user: User) {
    resetEdit({
      id: user.id,
      name: user.name,
      email: user.email,
      profession: user.profession,
      role: user.role,
      projetos: user.projetos?.map((pivot) => ({ id: pivot.projeto.id })) || [],
    });

    setIsEditing(true);
  }

  useEffect(() => {
    loadUsers();
    loadProjects();
  }, []);

  return (
    <Layout titulo="Cadastro de Usuário">
      {alert.show && alert.title && (
        <CustomAlert
          category={alert.category}
          title={alert.title}
          onClose={() => setAlert({ show: false })}
          autoHideDuration={5000}
        />
      )}
      {userToDelete && (
        <ModalUserDelete
          openModal={openDeleteModal}
          setOpenModal={setOpenDeleteModal}
          idUser={userToDelete.id}
          onDeleted={async () => {
            setAlert({
              show: true,
              category: "success",
              title: "Projeto deletado com sucesso!",
            });
            setUserToDelete(null);
            setOpenDeleteModal(false); // ⬅ fechar o modal aqui
            await loadUsers();
          }}
        />
      )}
      <Card sx={{ p: 2, m: 2 }}>
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ mb: 0, textAlign: "center", pb: "0.9rem" }}
        >
          {isEditing ? "Editar Usuário" : "Dados do Usuário"}
        </Typography>
        <form
          onSubmit={handleCreate(OnChoiceAction)}
          className={styles.container}
        >
          <Forms<FormValues>
            inputsList={getUserInputs(projectOptions, isEditing)}
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

      {/* Tabela */}
      <Box sx={{ m: 2 }}>
        <Box
          sx={{ mb: 0, textAlign: "center" }}
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
        <Card>
          <GenericDataTable
            columns={columnsUsers}
            rows={users}
            onEdit={changeForEdit}
            onDelete={(row) => {
              handleDeleteUser(row);
              setOpenDeleteModal(true);
            }}
          />
        </Card>
      </Box>
    </Layout>
  );
}
