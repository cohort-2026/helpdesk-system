import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

// Define the role types
export type Role = 'Employee' | 'Agent' | 'Department Lead' | 'System Admin' | 'Platform Admin' | null;

// Define the User shape
export interface User {
  id?: string;
  user_id?: string;
  name: string;
  surname?: string;
  email?: string;
  role: Role;
  active?: boolean;
  department_id?: number | null;
}

interface AuthContextState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (user: User, expiresAt: number) => void;
  logout: () => Promise<void>;
  updateAuthUser: (updatedFields: Partial<User>) => void;
  checkAuth: () => Promise<void>;
}

interface AuthResponse {
  user?: User;
  expiresAt?: number;
}

const requestAuthSession = async (): Promise<AuthResponse | null> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
    credentials: "include",
  });
  if (!response.ok) return null;

  const data = (await response.json()) as AuthResponse;
  if (!data.user || typeof data.expiresAt !== "number") {
    throw new Error("The auth session response is invalid.");
  }
  return data;
};

// Create the context
const AuthContext = createContext<AuthContextState | undefined>(undefined);

// Provide the context
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const expiryTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearExpiryTimeout = useCallback(() => {
    if (expiryTimeout.current !== null) {
      clearTimeout(expiryTimeout.current);
      expiryTimeout.current = null;
    }
  }, []);

  const startSession = useCallback(
    (sessionUser: User, expiresAt: number) => {
      clearExpiryTimeout();
      const timeUntilExpiry = expiresAt - Date.now();
      if (timeUntilExpiry <= 0) {
        setUser(null);
        return;
      }

      setUser(sessionUser);
      expiryTimeout.current = setTimeout(() => {
        setUser(null);
        expiryTimeout.current = null;
      }, timeUntilExpiry);
    },
    [clearExpiryTimeout],
  );

  const resetSession = useCallback(() => {
    clearExpiryTimeout();
    setUser(null);
  }, [clearExpiryTimeout]);

  const applyAuthResponse = useCallback(
    (data: AuthResponse | null) => {
      if (!data?.user || typeof data.expiresAt !== "number") {
        resetSession();
        return;
      }
      startSession(data.user, data.expiresAt);
    },
    [resetSession, startSession],
  );

  const checkAuth = useCallback(async () => {
    try {
      applyAuthResponse(await requestAuthSession());
    } catch (error) {
      resetSession();
      console.error("Auth check failed", error);
    } finally {
      setLoading(false);
    }
  }, [applyAuthResponse, resetSession]);

  useEffect(() => {
    let active = true;
    requestAuthSession()
      .then((data) => {
        if (active) applyAuthResponse(data);
      })
      .catch((error: unknown) => {
        if (active) {
          resetSession();
          console.error("Auth check failed", error);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      clearExpiryTimeout();
    };
  }, [applyAuthResponse, clearExpiryTimeout, resetSession]);

  const login = (newUser: User, expiresAt: number) =>
    startSession(newUser, expiresAt);

  const logout = async () => {
    clearExpiryTimeout();
    setUser(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`Logout failed with status ${response.status}.`);
      }
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      clearExpiryTimeout();
      setUser(null);
    }
  };

  const updateAuthUser = (updatedFields: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : prev));
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        updateAuthUser,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// The auth hook belongs with this context provider rather than a component module.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextState => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
