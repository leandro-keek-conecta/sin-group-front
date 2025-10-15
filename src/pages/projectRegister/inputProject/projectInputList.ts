import type { InputType } from "@/components/Forms";

export interface ProjectFormValues {
  name: string;
  logoUrl: string;
  reportId: string;
  groupId: string;
  corHex: string;
  users: number[];
}

export type SelectOption = { label: string; value: number };

export const getProjectInputs = (
  userOptions: SelectOption[] = []
): InputType<ProjectFormValues>[] => [
  {
    name: "name",
    title: "Nome",
    placeholder: "Digite o nome do projeto",
    type: "text",
    colSpan: 6,
    rules: { required: "Nome do projeto e obrigatorio" },
  },
  {
    name: "corHex",
    title: "Cor Padrao do Projeto",
    placeholder: "Informe a cor em formato hexadecimal (ex: #FF7A01)",
    type: "text",
    colSpan: 6,
    rules: { required: "A cor padrao e obrigatoria" },
  },
  {
    name: "logoUrl",
    title: "Logo",
    placeholder: "Digite a URL da logo do projeto",
    type: "text",
    colSpan: 6,
    rules: { required: "A URL da logo e obrigatoria" },
  },
  {
    name: "reportId",
    title: "Report ID",
    placeholder: "Informe o Report ID do Power BI",
    type: "text",
    colSpan: 6,
    rules: { required: "O Report ID e obrigatorio" },
  },
  {
    name: "groupId",
    title: "Group ID",
    placeholder: "Informe o Group ID (Workspace) do Power BI",
    type: "text",
    colSpan: 6,
    rules: { required: "O Group ID e obrigatorio" },
  },
  {
    name: "users",
    title: "Usuarios vinculados",
    placeholder: "Selecione os usuarios do projeto",
    type: "Select",
    colSpan: 6,
    selectOptions: userOptions,
    selectProps: { isMulti: true },
    rules: {
      validate: () => true,
    },
  },
];