import { createContext, ReactNode, useContext, useState, useEffect } from "react";

interface ProjectContextProps {
  name: string;
  setName: (value: string) => void;
  reportId: string;
  setReportId: (value: string) => void;
  groupId: string;
  setgroupId: (value: string) => void;
  token: string;
  setToken: (value: string) => void;
  clearProject: () => void;
}

const ProjectContext = createContext<ProjectContextProps | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [reportId, setReportIdState] = useState("");
  const [name, setNameSate] = useState("");
  const [groupId, setgroupIdState] = useState("");
  const [token, setTokenState] = useState("");

  // 🔹 Ao montar, recupera do localStorage
  useEffect(() => {
    const saved = localStorage.getItem("projectContext");
    if (saved) {
      const { reportId, groupId, token, name } = JSON.parse(saved);
      setReportIdState(reportId || "");
      setgroupIdState(groupId || "");
      setTokenState(token || "");
      setNameSate(name || "");
    }
  }, []);

  // 🔹 Atualiza o localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem(
      "projectContext",
      JSON.stringify({ reportId, groupId, token, name })
    );
  }, [reportId, groupId, token, name]);

  // 🔹 Funções que atualizam estado + persistência
  const setReportId = (value: string) => setReportIdState(value);
  const setgroupId = (value: string) => setgroupIdState(value);
  const setToken = (value: string) => setTokenState(value);
  const setName = (value: string) => setNameSate(value);
  const clearProject = () => {
    localStorage.removeItem("projectContext");
    setReportIdState("");
    setgroupIdState("");
    setTokenState("");
    setNameSate("");
  };

  return (
    <ProjectContext.Provider
      value={{ reportId, setReportId, groupId, setgroupId, token, setToken, name, setName, clearProject,  }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject deve ser usado dentro de um ProjectProvider");
  }
  return context;
}
