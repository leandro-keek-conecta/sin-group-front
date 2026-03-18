export type ProjectLike = {
  nome?: string | null;
  name?: string | null;
  reportId?: string | null;
  groupId?: string | null;
  corHex?: string | null;
  [key: string]: unknown;
};

type UserWithProjects = {
  projeto?: ProjectLike | null;
  projetos?: ProjectLike[] | null;
  [key: string]: unknown;
} | null | undefined;

export function getActiveProject(user: UserWithProjects): ProjectLike | null {
  if (!user || typeof user !== "object") {
    return null;
  }

  if (user.projeto && typeof user.projeto === "object") {
    return user.projeto as ProjectLike;
  }

  const projects = Array.isArray(user.projetos) ? user.projetos : [];
  if (!projects.length) {
    return null;
  }

  const projectWithColor = projects.find((project) => {
    const color = project?.corHex;
    return typeof color === "string" && color.trim().length > 0;
  });

  return projectWithColor ?? projects[0] ?? null;
}

export function ensureThemeColor(color: unknown, fallback: string): string {
  if (typeof color !== "string") {
    return fallback;
  }

  const sanitized = color.trim();
  return sanitized.length ? sanitized : fallback;
}

export function getProjectDisplayName(project: ProjectLike | null | undefined): string {
  if (!project || typeof project !== "object") {
    return "";
  }

  const rawName =
    typeof project.nome === "string"
      ? project.nome
      : typeof project.name === "string"
        ? project.name
        : "";

  return rawName.trim();
}

export function getProjectContextValue(
  project: ProjectLike | null | undefined,
  token = ""
) {
  return {
    name: getProjectDisplayName(project),
    reportId:
      typeof project?.reportId === "string" ? project.reportId.trim() : "",
    groupId: typeof project?.groupId === "string" ? project.groupId.trim() : "",
    token: typeof token === "string" ? token.trim() : "",
  };
}
