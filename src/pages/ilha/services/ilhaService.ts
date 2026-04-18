import axios from "axios";
import { ILHA_WEBHOOK_URL } from "../constants";
import type { IlhaResumoRaw } from "../types";

export async function fetchIlhaResumo(): Promise<IlhaResumoRaw> {
  const response = await axios.post("https://automacao.webhook.keekconecta.com.br/webhook/get-data", 
    {
      "Type": "getResumo"
    }
)
console.log(response.data)
  if (response.status !== 200) {
    throw new Error(`Falha ao carregar resumo Ilha (HTTP ${response.status})`);
  }
  return response.data;
}
