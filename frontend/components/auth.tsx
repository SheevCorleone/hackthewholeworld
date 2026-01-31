import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { apiRequest } from "./api";

export type User = {
  id: number;
  email: string;
  full_name: string;
  role:
    | "manager"
    | "admin"
    | "curator"
    | "student"
    | "mentor"
    | "univ_teacher"
    | "univ_supervisor"
    | "univ_admin"
    | "hr"
    | "academic_partnership_admin";
  status?: string;
  faculty?: string | null;
  skills?: string | null;
  course?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  created_at: string;
  last_active_at?: string | null;
};

type AuthContextValue = {
  user: User | null;
  accessToken: string | null;
  role: User["role"] | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  login: (accessToken: string, refreshToken: string) => Promise<User>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  });
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) {
      setUser(null);
      setAccessToken(null);
      setLoading(false);
      return;
    }
    setAccessToken(token);
    try {
      const data = await apiRequest<User>("/auth/me");
      setUser(data);
    } catch (error) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (nextAccessToken: string, nextRefreshToken: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", nextAccessToken);
      localStorage.setItem("refresh_token", nextRefreshToken);
    }
    setAccessToken(nextAccessToken);
    setLoading(true);
    try {
      const profile = await apiRequest<User>("/auth/me");
      setUser(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
    setAccessToken(null);
    setUser(null);
    setLoading(false);
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      role: user?.role ?? null,
      loading,
      isAuthenticated: Boolean(user),
      refreshUser,
      login,
      logout
    }),
    [user, accessToken, loading, refreshUser, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
