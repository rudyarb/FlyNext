"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  userName: string | null;
  role: string | null;
  login: (token: string, userName: string, role: string) => void;
  logout: () => void;
  updateProfile: (updatedUserName: string, updatedRole?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  // Sync state with localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUserName = localStorage.getItem("userName");
    const savedRole = localStorage.getItem("role");
    if (savedToken) {
      setToken(savedToken);
    }
    if (savedUserName) {
      setUserName(savedUserName);
    }
    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  const login = (newToken: string, newUserName: string, newRole: string) => {
    console.log("Login called with:", { newToken, newUserName, newRole }); // Debugging
    setToken(newToken);
    setUserName(newUserName);
    setRole(newRole);
    localStorage.setItem("token", newToken);
    localStorage.setItem("userName", newUserName);
    localStorage.setItem("role", newRole);
  };

  const logout = () => {
    console.log("Logout called"); // Debugging
    setToken(null);
    setUserName(null);
    setRole(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("role");
    router.push("/"); // Redirect to login page
  };

  const updateProfile = (updatedUserName: string, updatedRole?: string) => {
    console.log("UpdateProfile called with:", { updatedUserName, updatedRole }); // Debugging
    if (updatedUserName) {
      setUserName(updatedUserName);
      localStorage.setItem("userName", updatedUserName);
    }
    if (updatedRole) {
      setRole(updatedRole);
      localStorage.setItem("role", updatedRole);
    }
  };

  // Debugging state updates
  useEffect(() => {
    console.log("AuthContext state updated:", { token, userName, role });
  }, [token, userName, role]);

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        userName,
        role,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
