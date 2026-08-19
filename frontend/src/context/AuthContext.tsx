import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api";
import { Role } from "../types";

interface AuthUser {
  username: string;
  full_name: string;
  role: Role;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Decodes the JWT payload locally (no network call) so we can check its
// expiry instantly, instead of waiting on a round-trip to the server with
// a token we already know is dead.
const isTokenExpired = (token: string): boolean => {
  try {
    const payloadBase64 = token.split(".")[1];
    const payload = JSON.parse(atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/")));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    // If we can't even parse it, treat it as expired/invalid.
    return true;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const stored = localStorage.getItem("user");

    if (token && stored && !isTokenExpired(token)) {
      setUser(JSON.parse(stored));
    } else if (token || stored) {
      // Stale/expired session — clear it immediately, no network wait.
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const res = await api.post("/auth/login", { username, password });
    const { access_token, role, full_name, username: uname } = res.data;
    localStorage.setItem("token", access_token);
    const authUser = { username: uname, full_name, role };
    localStorage.setItem("user", JSON.stringify(authUser));
    setUser(authUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};