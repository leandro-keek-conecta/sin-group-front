export interface UpdateUserDTO {
  id?: number;
  email?: string;
  password?: string;
  name?: string;
  role?: string;
  profession?: string;
  projetos?: { id: number }[];
}
