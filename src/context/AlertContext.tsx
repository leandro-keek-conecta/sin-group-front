// context/AlertContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import CustomAlert from "../components/Alert";
import { registerAlert } from "@/services/alert/alertService";

type AlertOptions = {
  category?: "error" | "info" | "warning" | "success";
  title: string;
};

type AlertContextType = {
  showAlert: (options: AlertOptions) => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [alert, setAlert] = useState<AlertOptions | null>(null);

  const showAlert = (options: AlertOptions) => {
    setAlert(options);
  };

  const handleClose = () => {
    setAlert(null);
  };

  useEffect(() => {
    registerAlert(showAlert);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alert && (
        <CustomAlert
          category={alert.category}
          title={alert.title}
          onClose={handleClose}
        />
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context)
    throw new Error("useAlert must be used within an AlertProvider");
  return context;
};
