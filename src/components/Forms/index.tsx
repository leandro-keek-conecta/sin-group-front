import styles from "./forms.module.css";
import {
  Control,
  Controller,
  FieldError,
  FieldErrors,
  FieldValues,
  Path,
  PathValue,
} from "react-hook-form";
import { Box } from "@mui/material";
import InputTex from "../../components/InputText";
import SelectButton from "../../components/selectButtom";
import InputFile from "../InputFIle";

type SelectValue = string | number | Array<string | number> | null;

interface Option {
  label: string;
  value: string | number;
}

export interface InputType<TFieldValues extends FieldValues = FieldValues> {
  name: Path<TFieldValues>;
  title: string;
  placeholder?: string;
  type: "text" | "email" | "password" | "Date" | "Select" | "inputFile";
  colSpan?: number;
  rowSpan?: number;
  selectOptions?: Option[];
  selectProps?: {
    isMulti?: boolean;
  };
  rules?: object;
  value?: SelectValue;
}

interface FormsProps<TFieldValues extends FieldValues = FieldValues> {
  inputsList: InputType<TFieldValues>[];
  control: Control<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  onInputChange?: (name: Path<TFieldValues>, value: SelectValue | null) => void;
  resetKey?: string | number;
}

export default function Forms<TFieldValues extends FieldValues = FieldValues>({
  inputsList,
  control,
  errors,
  resetKey,
  onInputChange,
}: FormsProps<TFieldValues>) {
  return (
    <Box
      className={`form-container ${styles.smallInputs}`}
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(12, 1fr)",
        gap: 2,
        fontSize: "1.0.9rem",
        "& input, & .MuiInputBase-input": {
          fontSize: "1.0.9rem",
        },
        "& label, & .MuiInputLabel-root": {
          fontSize: "1.0.9rem",
        },
        "& .MuiFormHelperText-root": {
          fontSize: "1.0.9rem",
        },
        "& ::placeholder": {
          fontSize: "1.0.9rem",
        },
        "& .MuiSelect-select": {
          fontSize: "1.0.9rem",
        },
      }}
    >
      {inputsList.map((input, index) => {
        const baseDefaultValue =
          input.value ?? (input.selectProps?.isMulti ? [] : undefined);

        const controllerDefaultValue =
          baseDefaultValue === undefined
            ? undefined
            : (baseDefaultValue as PathValue<TFieldValues, typeof input.name>);

        return (
          <Box
            key={`${resetKey || "form"}-${input.name}-${index}`}
            sx={{
              gridColumn: {
                xs: "span 12",
                sm: `span ${input.colSpan || 12}`,
              },
            }}
          >
            <Controller
              name={input.name}
              control={control}
              {...(controllerDefaultValue !== undefined
                ? { defaultValue: controllerDefaultValue }
                : {})}
              rules={input.rules}
              render={({ field: { onChange, value } }) => {
                const fieldError = errors[input.name as Path<TFieldValues>] as
                  | FieldError
                  | undefined;

                if (input.type === "Select") {
                  // 🔹 Normaliza valor: converte automaticamente entre formatos [{id}] ⇄ [id]
                  const normalizedValue = (() => {
                    if (Array.isArray(value)) {
                      // Se o valor for [{id:1},{id:3}] → [1,3]
                      if (
                        value.length > 0 &&
                        typeof value[0] === "object" &&
                        "id" in value[0]
                      ) {
                        return value.map((v: any) => v.id);
                      }
                      return value;
                    }
                    return value ?? (input.selectProps?.isMulti ? [] : null);
                  })();

                  return (
                    <SelectButton
                      label={input.title}
                      options={input.selectOptions || []}
                      placeholder={input.placeholder}
                      value={normalizedValue as SelectValue}
                      isMulti={input.selectProps?.isMulti}
                      onChange={(selectedValue) => {
                        let mappedValue: any;

                        if (input.selectProps?.isMulti) {
                          // 🔹 Caso multi: [1,3] → [{id:1},{id:3}]
                          mappedValue = Array.isArray(selectedValue)
                            ? selectedValue.map((v:any) =>
                                typeof v === "object" && v !== null && "id" in v
                                  ? Number((v as any).id)
                                  : Number(v)
                              )
                            : [];
                        } else {
                          // 🔹 Caso single: valor direto (string | number | null)
                          mappedValue =
                            typeof selectedValue === "object" &&
                            selectedValue !== null
                              ? // garante que, se por acaso vier {id}, use apenas o id
                                (selectedValue as any).id ?? selectedValue
                              : selectedValue ?? null;
                        }

                        onChange(mappedValue);
                        onInputChange?.(input.name, mappedValue);
                      }}
                      error={Boolean(fieldError)}
                      helperText={fieldError?.message as string}
                    />
                  );
                }

                if (input.type === "inputFile") {
                  return (
                    <InputFile
                      onChange={(event) => {
                        const files = event.target.files;
                        if (files) {
                          onChange(files);
                          onInputChange?.(
                            input.name,
                            Array.from(files)
                              .map((f) => f.name)
                              .join(", ")
                          );
                        }
                      }}
                    />
                  );
                }

                return (
                  <InputTex
                    label={input.title}
                    placeholder={input.placeholder || ""}
                    type={input.type}
                    value={value || ""}
                    onChange={(e) => {
                      onChange(e.target.value);
                      onInputChange?.(input.name, e.target.value);
                    }}
                    error={Boolean(fieldError)}
                    helperText={fieldError?.message as string}
                  />
                );
              }}
            />
          </Box>
        );
      })}
    </Box>
  );
}
