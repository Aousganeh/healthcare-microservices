import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isDoctor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user data", e);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const raw = await response.text();
        let message = "Login failed. Please try again.";

        // Prefer a clean, user-friendly message instead of raw JSON
        try {
          const data = raw ? JSON.parse(raw) : null;
          if (data && typeof data === "object") {
            message =
              data.message ||
              data.error ||
              (data.code === "DATABASE_ERROR" || data.status >= 500
                ? "Service is temporarily unavailable. Please try again in a few minutes."
                : message);
          }
        } catch {
          const lower = raw.toLowerCase();
          const looksLikeHtml = lower.includes("<html") || lower.includes("<!doctype");

          if (
            response.status === 502 ||
            response.status === 503 ||
            lower.includes("service unavailable") ||
            lower.includes("bad gateway") ||
            looksLikeHtml
          ) {
            message = "Service is temporarily unavailable. Please try again in a few minutes.";
          } else if (raw && !raw.startsWith("{")) {
            // If it's a plain string from backend, use it
            message = raw;
          }
        }

        throw new Error(message);
      }

      const data = await response.json();
      const userData: User = {
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        roles: data.roles || [],
      };

      setToken(data.token);
      setUser(userData);
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_user", JSON.stringify(userData));
      
      if (userData.roles?.includes("ROLE_ADMIN")) {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      if (!response.ok) {
        const raw = await response.text();
        let message = "Registration failed. Please try again.";

        try {
          const data = raw ? JSON.parse(raw) : null;
          if (data && typeof data === "object") {
            message =
              data.message ||
              data.error ||
              (data.code === "DATABASE_ERROR" || data.status >= 500
                ? "Service is temporarily unavailable. Please try again in a few minutes."
                : message);
          }
        } catch {
          const lower = raw.toLowerCase();
          const looksLikeHtml = lower.includes("<html") || lower.includes("<!doctype");

          if (
            response.status === 502 ||
            response.status === 503 ||
            lower.includes("service unavailable") ||
            lower.includes("bad gateway") ||
            looksLikeHtml
          ) {
            message = "Service is temporarily unavailable. Please try again in a few minutes.";
          } else if (raw && !raw.startsWith("{")) {
            message = raw;
          }
        }

        throw new Error(message);
      }

      const data = await response.json();
      const userData: User = {
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        roles: data.roles || [],
      };

      setToken(data.token);
      setUser(userData);
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_user", JSON.stringify(userData));
      
      if (userData.roles?.includes("ROLE_ADMIN")) {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    navigate("/login");
  };

  const isAdmin = user?.roles?.includes("ROLE_ADMIN") ?? false;
  const isDoctor = user?.roles?.includes("ROLE_DOCTOR") ?? false;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!token && !!user,
        isLoading,
        isAdmin,
        isDoctor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

