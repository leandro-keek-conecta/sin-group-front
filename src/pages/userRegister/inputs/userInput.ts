  import { InputType } from "@/components/Forms";
  import type { FormValues } from "..";

  export type SelectOption = { label: string; value: number };


  export const getUserInputs = (
    projectOptions: SelectOption[] = [],
    isEditing = false
  ): InputType<FormValues>[] => {
    const inputs: InputType<FormValues>[] = [
      {
        name: "name",
        title: "Nome",
        placeholder: "Digite seu nome completo",
        type: "text",
        colSpan: 4,
        rules: { required: "Nome é obrigatório" },
      },
      {
        name: "email",
        title: "E-mail",
        placeholder: "Digite seu e-mail completo",
        type: "email",
        colSpan: 4,
        rules: {
          required: "E-mail é obrigatório",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "E-mail inválido",
          },
        },
      },
      {
        name: "role",
        title: "Nível de acesso",
        placeholder: "Selecione o nível de acesso",
        type: "Select",
        colSpan: 4,
        selectOptions: [
          { label: "Usuário Comum", value: "USER" },
          { label: "Administrador", value: "ADMIN" },
        ],
        rules: { required: "Função é obrigatória" },
      },

    ];
    if (isEditing) {
      inputs.push({
        name: "projetos",
        title: "Projetos vinculados",
        placeholder: "Selecione os projetos vinculados",
        type: "Select",
        colSpan: 12,
        selectOptions: projectOptions,
        selectProps: { isMulti: true },
        rules: { validate: () => true },
      });
    }
    // 🔹 Só adiciona os campos de senha se NÃO estiver editando
    if (!isEditing) {
      inputs.push({
        name: "projetos",
        title: "Projetos vinculados",
        placeholder: "Selecione os projetos vinculados",
        type: "Select",
        colSpan: 12,
        selectOptions: projectOptions,
        selectProps: { isMulti: true },
        rules: { validate: () => true },
      });
      inputs.splice(3, 0,   // adiciona antes do campo "role"
        {
          name: "password",
          title: "Senha",
          placeholder: "Digite sua senha",
          type: "text",
          colSpan: 6,
          rules: {
            required: "Senha é obrigatória",
            minLength: { value: 6, message: "Mínimo 4 caracteres" },
          },
        },
        {
          name: "passwordConfirm",
          title: "Confirme sua senha",
          placeholder: "Digite sua senha novamente",
          type: "text",
          colSpan: 6,
          rules: { required: "Confirmação de senha é obrigatória" },
        }
      );
    }

    return inputs;
  };
