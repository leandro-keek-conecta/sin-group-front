import Projeto from "./IProjetoType";
import { Role } from "./IRoleType";

export interface ProjetoUserPivot {
  userId: number;
  projetoId: number;
  assignedAt: string;
  projeto: Projeto;
}

export default interface User {
  id?: number;
  email: string;
  password?: string; 
  name?: string;
  profession?: string;
  role?: Role;
  projetoId?: number;
  projeto?: Projeto; 
  projetos?: ProjetoUserPivot[]; // 👈 aqui é a pivot, não Projeto[]
}
