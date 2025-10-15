import { api } from "../api/api";

/* interface EmbedTokenResponse {
  token: string;
  groupId: string;
  reportId: string;
}
 */
/* interface ApiResponse {
  message: string;
  data?: EmbedTokenResponse;
} */

export async function getEmbedToken() {
  try {
    const response = await api.get(`/powerbi/embed-token`);
    /*   
    if (!response.data?.data) {
      throw new Error("Resposta inválida do servidor.");
    } */

    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.message || "Erro inesperado no servidor.";

    if (status === 401) {
      throw new Error("Usuário não autorizado. Verifique seu login.");
    }

    throw new Error(message);
  }
}
