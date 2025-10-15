import { defaultTheme } from "@/theme";
import { ensureThemeColor, getActiveProject } from "@/utils/project";

// Interfaces para tipagem de apoio
interface Projeto {
  corHex?: string;
  dashUrl?: string;
  [key: string]: unknown;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  projeto?: Projeto;
  projetos?: Projeto[] | null;
}

interface AuthResponse {
  accessToken: string;
  accessTokenExpireIn: string;
  refreshToken: string;
  refreshTokenExpireIn: string;
  user: User;
}

// Chaves de armazenamento no localStorage
const LOCAL_STORAGE_KEYS = {
  AUTH_DATA: "auth_data", // Guarda todo o objeto de autenticacao
  ACCESS_TOKEN: "access_token", // Esperado pelos servicos para o token de acesso
  REFRESH_TOKEN: "refresh_token",
  USER_DATA: "user_data", // Esperado pelos servicos para os dados do usuario
  PROJECT_DATA: "project_data",
  THEME_COLOR: "theme_color",
  DASHBOARD_URL: "dashboard_url", // Esperado pelos servicos para a URL da dash
};

class LocalStorageService {
  /**
   * Salva todos os dados de autenticacao recebidos no login.
   * @param authData Dados de resposta do login.
   */
  setAuthData(authData: AuthResponse): void {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.AUTH_DATA,
        JSON.stringify(authData)
      );
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.ACCESS_TOKEN,
        authData.accessToken
      );
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.REFRESH_TOKEN,
        authData.refreshToken
      );

      const activeProject = getActiveProject(authData.user);
      const normalizedUser = activeProject
        ? { ...authData.user, projeto: activeProject }
        : authData.user;

      localStorage.setItem(
        LOCAL_STORAGE_KEYS.USER_DATA,
        JSON.stringify(normalizedUser)
      );

      if (activeProject) {
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.PROJECT_DATA,
          JSON.stringify(activeProject)
        );

        const color = ensureThemeColor(
          activeProject.corHex,
          defaultTheme.palette.primary.main
        );
        localStorage.setItem(LOCAL_STORAGE_KEYS.THEME_COLOR, color);

        if (typeof activeProject.dashUrl === "string") {
          localStorage.setItem(
            LOCAL_STORAGE_KEYS.DASHBOARD_URL,
            activeProject.dashUrl
          );
        } else if (localStorage.getItem(LOCAL_STORAGE_KEYS.DASHBOARD_URL)) {
          localStorage.removeItem(LOCAL_STORAGE_KEYS.DASHBOARD_URL);
        }
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.PROJECT_DATA);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.THEME_COLOR);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.DASHBOARD_URL);
      }
    } catch (error) {
      console.error(
        "Erro ao salvar dados de autenticacao no localStorage:",
        error
      );
    }
  }

  /**
   * Obtem o token de acesso.
   * @returns string | null
   */
  getAccessToken(): string | null {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Obtem o token de refresh.
   * @returns string | null
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Obtem os dados do usuario.
   * @returns User | null
   */
  getUser(): User | null {
    try {
      const userData = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error(
        "Erro ao obter dados do usuario do localStorage:",
        error
      );
      return null;
    }
  }

  /**
   * Obtem os dados do projeto ativo.
   * @returns Projeto | null
   */
  getProject(): Projeto | null {
    try {
      const projectData = localStorage.getItem(LOCAL_STORAGE_KEYS.PROJECT_DATA);
      return projectData ? JSON.parse(projectData) : null;
    } catch (error) {
      console.error(
        "Erro ao obter dados do projeto do localStorage:",
        error
      );
      return null;
    }
  }

  /**
   * Obtem a cor hexadecimal do projeto.
   * @returns string | null
   */
  getProjectColor(): string | null {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.THEME_COLOR);
  }

  /**
   * Obtem a URL do dashboard do projeto.
   * @returns string | null
   */
  getDashboardUrl(): string | null {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.DASHBOARD_URL);
  }

  /**
   * Limpa todos os dados de autenticacao e usuario do localStorage.
   */
  clearAuthData(): void {
    try {
      Object.values(LOCAL_STORAGE_KEYS).forEach((key) =>
        localStorage.removeItem(key)
      );
    } catch (error) {
      console.error("Erro ao limpar dados do localStorage:", error);
    }
  }
}

// Exporta uma instancia unica do servico
export const localStorageService = new LocalStorageService();
