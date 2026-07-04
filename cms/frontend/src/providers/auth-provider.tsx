"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import apiClient, {
  clearAccessToken,
  setAccessToken,
} from "@/lib/api-client";
import type { User, LoginResponse } from "@/types/auth";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Hydrate user on mount by calling /auth/me
  useEffect(() => {
    const hydrateUser = async () => {
      try {
        // Try to refresh the access token first using the httpOnly cookie
        const refreshResponse = await apiClient.post<{ accessToken: string }>(
          "/auth/refresh"
        );
        setAccessToken(refreshResponse.data.accessToken);

        // Now fetch the user profile
        const meResponse = await apiClient.get<{ data: User }>("/auth/me");
        setUser(meResponse.data.data);
      } catch {
        // No valid session - user is not authenticated
        clearAccessToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    hydrateUser();
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      const response = await apiClient.post<{ data: LoginResponse }>(
        "/auth/login",
        { email, password }
      );

      const { accessToken, user: loggedInUser } = response.data.data;

      // Store access token in memory only - never in localStorage
      setAccessToken(accessToken);
      setUser(loggedInUser);
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Ignore logout errors - we still want to clear state
    } finally {
      clearAccessToken();
      setUser(null);
      router.push("/login");
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
