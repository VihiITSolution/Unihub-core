'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, type LoginCredentials, type RegisterData, type AuthResponse } from '@/services/auth.service';
import type { User, UserRole } from '@/types';
import { TOKEN_KEY, USER_KEY } from '@/lib/constants';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    credentials: LoginCredentials,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    data: RegisterData,
  ) => Promise<{ success: boolean; error?: string }>;
  completeRegistration: (auth: AuthResponse) => void;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  refreshUser: () => Promise<void>;
  updateUser: (updatedUser: User) => void;
  switchRole: (role: UserRole) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type ApiError = Error & { status?: number };

// This is only a client-side expiry check to avoid sending a token that is
// already known to be expired. The server remains the authority for all
// authentication decisions and verifies the token signature as usual.
const isExpiredJwt = (token: string) => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return false;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(base64)) as { exp?: number };
    return typeof decoded.exp === "number" && decoded.exp * 1000 <= Date.now();
  } catch {
    // Let the API reject malformed tokens so the normal invalid-session flow
    // handles them consistently.
    return false;
  }
};


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem(TOKEN_KEY);
        if (savedToken) {
          if (isExpiredJwt(savedToken)) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            sessionStorage.setItem(
              "authSessionMessage",
              "Your session has expired. Please sign in again to continue.",
            );
            return;
          }

          // Do not expose a cached credential to the rest of the UI until the
          // server has validated it. Otherwise widgets mounted during startup
          // make protected requests with an invalid token and create a cascade
          // of misleading 401 errors.
          try {
            const response = await authService.getCurrentUser(savedToken);
            if (response.success && response.data?.user) {
              setToken(savedToken);
              setUser(response.data.user);
              localStorage.setItem(
                USER_KEY,
                JSON.stringify(response.data.user),
              );
            } else {
              localStorage.removeItem(TOKEN_KEY);
              localStorage.removeItem(USER_KEY);
              sessionStorage.setItem(
                "authSessionMessage",
                "Your session is no longer valid. Please sign in again.",
              );
            }
          } catch (error) {
            const status = (error as ApiError)?.status;
            if (status === 401 || status === 403) {
              console.warn("Token validation failed, clearing auth state:", error);
              localStorage.removeItem(TOKEN_KEY);
              localStorage.removeItem(USER_KEY);
              sessionStorage.setItem(
                "authSessionMessage",
                "Your session is no longer valid. Please sign in again.",
              );
            } else {
              // A temporary outage must not silently log the user out. Keep
              // the cached profile until the next validation attempt.
              const savedUser = localStorage.getItem(USER_KEY);
              if (savedUser) {
                try {
                  setToken(savedToken);
                  setUser(JSON.parse(savedUser));
                } catch {
                  localStorage.removeItem(USER_KEY);
                }
              }
              console.warn("Unable to validate the existing session:", error);
            }
          }
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        // Clear any partial state
        setUser(null);
        setToken(null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);

      if (response.success && response.data) {
        const { user, token } = response.data;

        // Update state and storage atomically
        setToken(token);
        setUser(user);
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));

        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: response.message || "Login failed" };
    } catch (error: any) {
      console.error("Login error:", error);
      setIsLoading(false);
      const errorMessage = error?.message || "An unexpected error occurred";
      return { success: false, error: errorMessage };
    }
  }, []);

  // Kept temporarily for callers outside the registration page. New accounts
  // must be created by the mobile-verification flow, never by a direct call.
  const register = useCallback(async (_data: RegisterData) => (
    { success: false, error: "Verify your mobile number to complete registration." }
  ), []);

  const completeRegistration = useCallback((auth: AuthResponse) => {
    setToken(auth.token);
    setUser(auth.user);
    localStorage.setItem(TOKEN_KEY, auth.token);
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
  }, []);

  const logout = useCallback(() => {
    if (token) {
      authService.logout(token).catch(console.error);
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, [token]);

  const hasRole = useCallback(
    (role: UserRole) => {
      if (role === "vendor" && user?.isVendorProfileComplete) return true;
      return user?.roles?.includes(role) ?? false;
    },
    [user],
  );

  const refreshUser = useCallback(async () => {
    if (!token) return;

    try {
      const response = await authService.getCurrentUser(token);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  }, [token]);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  }, []);

  const switchRole = useCallback(
    async (role: UserRole): Promise<{ success: boolean; error?: string }> => {
      if (!token || !user) {
        return { success: false, error: "Not authenticated" };
      }

      // Check if user has this role
      if (!user.roles.includes(role)) {
        return { success: false, error: "You don't have this role" };
      }

      try {
        const response = await authService.switchRole(token, role);
        if (response.success && response.data?.user) {
          setUser(response.data.user);
          localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
          return { success: true };
        }
        return {
          success: false,
          error: response.message || "Failed to switch role",
        };
      } catch (error) {
        console.error("Failed to switch role:", error);
        return { success: false, error: "Failed to switch role" };
      }
    },
    [token, user],
  );

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    completeRegistration,
    logout,
    hasRole,
    refreshUser,
    updateUser,
    switchRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Helper hook to get the dashboard path based on user's primary role
export function useDashboardPath() {
  const { user } = useAuth();

  if (!user) return '/auth/login';

  if (user.isVendorProfileComplete && user.primaryRole === "vendor") {
    return "/vendor/dashboard";
  }

  switch (user.primaryRole) {
    case "student":
      return "/student/dashboard";
    case "tutor":
      return "/tutor/dashboard";
    case "admin":
      return "/admin/dashboard";
    case "vendor":
      return "/vendor/dashboard";
    default:
      return "/student/dashboard";
  }
}
