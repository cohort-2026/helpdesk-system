import { createContext, useContext } from 'react';

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

export interface AuthContextState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  updateAuthUser: (updatedFields: Partial<User>) => void;
  checkAuth: () => Promise<void>;
}

// Create the context. The provider component lives in AuthProvider.tsx.
export const AuthContext = createContext<AuthContextState | undefined>(undefined);

export const useAuth = (): AuthContextState => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
