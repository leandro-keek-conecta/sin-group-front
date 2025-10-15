import { createContext, ReactNode, useContext, useState } from "react";

interface PowerBIContextProps {
  reportInstance: any;
  setReportInstance: (value: any) => void;
  pages: { name: string; displayName: string }[];
  setPages: (pages: { name: string; displayName: string }[]) => void;
}

const PowerBIContext = createContext<PowerBIContextProps | undefined>(undefined);

export function PowerBIProvider({ children }: { children: ReactNode }) {
  const [reportInstance, setReportInstance] = useState<any>(null);
  const [pages, setPages] = useState<{ name: string; displayName: string }[]>([]);
  return (
    <PowerBIContext.Provider value={{ reportInstance, setReportInstance, pages, setPages }}>
      {children}
    </PowerBIContext.Provider>
  );
}

export function usePowerBI() {
  const context = useContext(PowerBIContext);
  if (!context) throw new Error("usePowerBI deve ser usado dentro de um PowerBIProvider");
  return context;
}
