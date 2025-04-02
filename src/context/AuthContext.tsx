"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  userName: string | null;
  login: (token: string, userName: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUserName = localStorage.getItem("userName");
    if (savedToken) {
      setToken(savedToken);
    }
    if (savedUserName) {
      setUserName(savedUserName);
    }
  }, []);

  const login = (newToken: string, newUserName: string) => {
    setToken(newToken);
    setUserName(newUserName);
    localStorage.setItem("token", newToken);
    localStorage.setItem("userName", newUserName);
  };

  const logout = () => {
    setToken(null);
    setUserName(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    router.push("/"); // Redirect to login page
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, userName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
