"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, AuthState } from "@/types";
import { setCookie, getCookie, deleteCookie } from "@/lib/cookies";

interface AuthContextType extends AuthState {
  login: (user: User, token: string, rememberMe?: boolean) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    loginTimestamp: undefined,
  });

  useEffect(() => {
    const loadUser = () => {
      try {
        console.log("🔍 AuthContext: Loading user session...");

        // Try to load from cookies first (more secure)
        const cookieUser = getCookie("user");
        const cookieToken = getCookie("token");
        const cookieTimestamp = getCookie("loginTimestamp");

        if (cookieUser && cookieToken) {
          console.log("🍪 Found user in cookies");
          const user = JSON.parse(cookieUser);
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            loginTimestamp: cookieTimestamp || undefined,
          });
          return;
        }

        // Fallback to localStorage for backward compatibility
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");
        const storedTimestamp = localStorage.getItem("loginTimestamp");

        if (storedUser && storedToken) {
          const user = JSON.parse(storedUser);

          // Migrate to cookies (1 hour expiry)
          const expiryHours = 1 / 24; // 1 hour in days
          setCookie("user", storedUser, { expires: expiryHours });
          setCookie("token", storedToken, { expires: expiryHours });
          if (storedTimestamp) {
            setCookie("loginTimestamp", storedTimestamp, {
              expires: expiryHours,
            });
          }

          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            loginTimestamp: storedTimestamp || undefined,
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            loginTimestamp: undefined,
          });
        }
      } catch (error) {
        console.error("Error loading user session:", error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          loginTimestamp: undefined,
        });
      }
    };

    loadUser();
  }, []);

  const login = (user: User, token: string, rememberMe: boolean = false) => {
    const loginTimestamp = new Date().toISOString();
    // 1 hour = 1/24 day
    const expiryHours = 1 / 24; // 1 hour in days

    // Store in cookies (primary storage) - expires in 1 hour
    setCookie("user", JSON.stringify(user), { expires: expiryHours });
    setCookie("token", token, { expires: expiryHours });
    setCookie("loginTimestamp", loginTimestamp, { expires: expiryHours });
    setCookie("rememberMe", rememberMe ? "true" : "false", {
      expires: expiryHours,
    });

    // Also store in localStorage for backward compatibility
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    localStorage.setItem("loginTimestamp", loginTimestamp);
    if (rememberMe) {
      localStorage.setItem("rememberMe", "true");
    }

    setAuthState({
      user,
      isAuthenticated: true,
      isLoading: false,
      loginTimestamp,
    });
  };
  const logout = () => {
    // Clear cookies
    deleteCookie("user");
    deleteCookie("token");
    deleteCookie("loginTimestamp");
    deleteCookie("rememberMe");

    // Clear localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("loginTimestamp");
    localStorage.removeItem("rememberMe");

    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      loginTimestamp: undefined,
    });
  };

  const updateUser = (user: User) => {
    const userJson = JSON.stringify(user);

    // Update both cookies and localStorage (1 hour expiry)
    const expiryHours = 1 / 24; // 1 hour in days
    setCookie("user", userJson, { expires: expiryHours });
    localStorage.setItem("user", userJson);

    setAuthState((prev) => ({
      ...prev,
      user,
    }));
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    updateUser,
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
