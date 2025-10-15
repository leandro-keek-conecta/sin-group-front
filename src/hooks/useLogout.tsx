import { useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

export function useLogout() {
  const { setUser } = useAuth();
  return useCallback(() => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, [setUser]);
}
