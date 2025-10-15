import { api } from "../api/api";

export interface ProjectUserDTO {
  userId: number;
  projetoId: number;
  assignedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    password: string;
    profession: string | null;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface ProjectDTO {
  id: number;
  name: string;
  logoUrl?: string | null;
  reportId?: string | null;
  groupId?: string | null;
  corHex?: string | null;
  createdAt?: string;
  updatedAt?: string;
  users?: ProjectUserDTO[];
}

export interface CreateProjectPayload {
  name: string;
  logoUrl?: string | null;
  reportId?: string | null;
  groupId?: string | null;
  corHex?: string | null;
  users: {id: number}[];
}

export interface UpdateProjectPayload extends CreateProjectPayload {
  id: number;
}

/** GET /projetos " lista todos */
export async function fetchProjects(): Promise<ProjectDTO[]> {
  const response = await api.get("/projeto/list");
  return response.data.data;
}

/** POST /projetos " cria novo */
export async function createProject(payload: CreateProjectPayload): Promise<ProjectDTO> {
  const { data } = await api.post<ProjectDTO>("/projeto/create", payload);
  return data;
}

export async function updateProject(payload: UpdateProjectPayload) {
  const response = await api.patch<ProjectDTO>(`/projeto/update/${payload.id}`, payload);
  return response.data;
}

export async function deleteProject(id: number) {
  const response = await api.delete(`/projeto/delete/${id}`);
  return response.data;
}
