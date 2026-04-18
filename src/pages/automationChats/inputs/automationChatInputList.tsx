import type { InputType } from "@/components/Forms";

export interface AutomationChatFormValues {
  id?: number;
  slug: string;
  title: string;
  description: string;
  url: string;
  isActive: boolean;
  projetoId?: number;
}

export type SelectOption = { label: string; value: number };

export const getAutomationChatInputs = (
  projectOptions: SelectOption[] = []
): InputType<AutomationChatFormValues>[] => [
  {
    name: "slug",
    title: "Slug (rota personalizada)",
    placeholder: "Ex: atendimento-pbgas",
    type: "text",
    colSpan: 6,
    rules: { required: "A rota personalizada e obrigatoria." },
  },
  {
    name: "title",
    title: "Titulo",
    placeholder: "Digite o titulo do chatbot",
    type: "text",
    colSpan: 6,
    rules: {
      required: "O titulo e obrigatorio e deve ter pelo menos 5 caracteres.",
      minLength: { value: 5, message: "Informe pelo menos 5 caracteres." },
    },
  },
  {
    name: "description",
    title: "Descricao",
    placeholder: "Informe uma breve descricao do chatbot",
    type: "textarea",
    colSpan: 12,
    rules: {
      required: "A descricao e obrigatoria e deve ter pelo menos 5 caracteres.",
      minLength: { value: 5, message: "Informe pelo menos 5 caracteres." },
    },
  },
  {
    name: "url",
    title: "URL do chatbot",
    placeholder: "Ex: https://api.keekconecta.com/chatbot/pbgas",
    type: "text",
    colSpan: 6,
    rules: {
      required: "A URL e obrigatoria.",
      pattern: {
        value: /^https?:\/\/[\w-]+(\.[\w-]+)+[/#?]?.*$/,
        message: "URL invalida.",
      },
    },
  },
  {
    name: "projetoId",
    title: "Projeto vinculado",
    placeholder: "Selecione um projeto",
    type: "Select",
    selectOptions: projectOptions,
    colSpan: 6,
    rules: {
      required: "Selecione um projeto.",
    },
  },
];
