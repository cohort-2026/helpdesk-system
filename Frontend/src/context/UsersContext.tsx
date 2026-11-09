import { createContext, useContext } from 'react';

// Define the role types
export type UserRole =
  | 'Employee'
  | 'Agent'
  | 'Department Lead'
  | 'System Admin'
  | 'Platform Admin';

// Define the User interface
export interface User {
  user_id: string;
  id?: string;
  name: string;
  surname: string;
  email: string;
  role: UserRole | string;
  active: boolean;
  department_id?: number | null;
  created_at?: string | Date;
}

// Data shapes for creating and updating
export interface CreateUserData {
  name: string;
  surname: string;
  email: string;
  role: UserRole | string;
  department_id?: number | null;
}

export interface UpdateUserData {
  name?: string;
  surname?: string;
  email?: string;
  role?: UserRole | string;
  active?: boolean;
  department_id?: number | null;
  password?: string;
}

// Users context interface
export interface UsersContextType {
  // State
  users: User[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  selectedUser: User | null;
  allowedRoles: UserRole[];

  // CRUD operations
  fetchUsers: () => Promise<User[]>;
  getUserById: (id: string) => Promise<User | null>;
  createUser: (userData: CreateUserData) => Promise<User | null>;
  updateUser: (id: string, userData: UpdateUserData) => Promise<User | null>;
  deleteUser: (id: string) => Promise<boolean>;
  toggleUserStatus: (id: string, currentStatus: boolean) => Promise<User | null>;

  // Helpers
  setSelectedUser: (user: User | null) => void;
  clearError: () => void;
}

// The provider component lives in UsersProvider.tsx.
export const UsersContext = createContext<UsersContextType | undefined>(undefined);

// Helper to determine allowed roles based on admin role
export const getAllowedRolesForAdmin = (adminRole?: string | null): UserRole[] => {
  if (adminRole === 'Platform Admin') {
    return ['System Admin'];
  }
  if (adminRole === 'System Admin') {
    return ['Department Lead', 'Agent', 'Employee'];
  }
  return [];
};

// Hook for accessing the users context
export const useUsers = (): UsersContextType => {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
};


// Export aliases for flexible imports
export const useUser = useUsers;

