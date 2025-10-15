import User from "@/@types/IUserType";
import { api } from "../api/api";
import axios from "axios";
import { UpdateUserDTO } from "@/@types/IUpdateUserDTO";

interface CreateUserParams {
  email: string;
  name: string;
  password: string;
  profession: string;
  role: string;
  projetos: { id: number }[];
}

interface ApiResponse {
  message: string;
  data?: any;
}

export async function createUser(userData: CreateUserParams): Promise<ApiResponse> {
  try {
    const { data } = await api.post('/user/create', userData);
    return {
      message: data?.message ?? "Usu�rio criado com sucesso.",
      data: data?.data,
    };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const message = (err.response?.data as any)?.message || "Erro inesperado no servidor.";

      if (status === 401) {
        throw new Error("Usu�rio n�o autorizado. Verifique seu login.");
      }

      if (status === 403) {
        throw new Error("Voc� n�o tem permiss�o para criar usu�rios.");
      }

      if (status === 409) {
        throw new Error("O email informado j� est� cadastrado.");
      }

      if (status === 400) {
        const firstIssue = (err.response?.data as any)?.issues?.[0]?.message;
        throw new Error("Erro de valida��o: " + (firstIssue || message));
      }

      // Outros erros n�o mapeados especificamente
      throw new Error(message);
    }

    // Caso n�o seja um erro do Axios
    throw new Error("Erro inesperado. Tente novamente.");
  }
}

export async function deleteUser(id:number){
  const response= await api.delete(`/user/delete/${id}`);
  return response;
}

export async function fetchUsers(): Promise<User[]> {
  const response = await api.get("/user/list");
  return response.data.data; // ? acessa corretamente o array de projetos
}

export async function updateUser(data: UpdateUserDTO): Promise<User[]> {
  const response = await api.patch(`/user/update/${data.id}`, data);
  return response.data.data; // ? acessa corretamente o array de projetos
}
