import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

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

const API_BASE_URL = 'http://localhost:5000/api/users';

const UsersContext = createContext<UsersContextType | undefined>(undefined);

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

// Helper to normalize user object with both user_id and id
const normalizeUser = (rawUser: any): User => ({
  ...rawUser,
  user_id: rawUser.user_id || rawUser.id,
  id: rawUser.user_id || rawUser.id,
});

export const UsersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user: authUser, isAuthenticated } = useAuth();
  const allowedRoles = React.useMemo(() => getAllowedRolesForAdmin(authUser?.role), [authUser?.role]);

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 1. READ ALL - Fetch all users
  const fetchUsers = useCallback(async (): Promise<User[]> => {
    setLoading(true);
    setError(null);
    try {
      let response;
      try {
        response = await axios.get(API_BASE_URL, { withCredentials: true });
      } catch (err: any) {
        if (err.response?.status === 404) {
          response = await axios.get(`${API_BASE_URL}/getUser`, { withCredentials: true });
        } else {
          throw err;
        }
      }

      const rawUsers: any[] = response.data?.users || response.data || [];
      const normalizedUsers = rawUsers.map(normalizeUser);
      // Scope users based on logged-in admin permissions
      const scopedUsers = allowedRoles.length > 0
        ? normalizedUsers.filter((u) => allowedRoles.includes(u.role as UserRole))
        : normalizedUsers;
      setUsers(scopedUsers);
      return scopedUsers;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch users';
      setError(message);
      console.error('fetchUsers error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [allowedRoles]);

  // Automatically fetch users when authenticated or when role changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    } else {
      setUsers([]);
      setSelectedUser(null);
    }
  }, [isAuthenticated, authUser?.role, fetchUsers]);

  // 2. READ ONE - Get user by ID
  const getUserById = useCallback(async (id: string): Promise<User | null> => {
    setError(null);
    // Check cached state first
    const existing = users.find((u) => u.user_id === id || u.id === id);
    if (existing) {
      return existing;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`, { withCredentials: true });
      const rawUser = response.data?.user || response.data;
      if (rawUser) {
        const user = normalizeUser(rawUser);
        return user;
      }
      return null;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch user';
      setError(message);
      console.error('getUserById error:', err);
      return null;
    }
  }, [users]);

  // 3. CREATE - Create a new user
  const createUser = useCallback(async (userData: CreateUserData): Promise<User | null> => {
    setActionLoading(true);
    setError(null);
    try {
      if (allowedRoles.length > 0 && !allowedRoles.includes(userData.role as UserRole)) {
        const roleErrMsg = authUser?.role === 'Platform Admin'
          ? 'Platform Admins can only create System Admins.'
          : 'System Admins can only create Department Leads, Agents, and Employees.';
        setError(roleErrMsg);
        return null;
      }

      const response = await axios.post(`${API_BASE_URL}/create`, userData, {
        withCredentials: true,
      });

      const rawCreated = response.data?.user;
      if (!rawCreated) {
        throw new Error('No user data returned from server');
      }

      const newUser = normalizeUser(rawCreated);
      setUsers((prev) => [newUser, ...prev]);
      return newUser;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to create user';
      setError(message);
      console.error('createUser error:', err);
      return null;
    } finally {
      setActionLoading(false);
    }
  }, [allowedRoles, authUser?.role]);

  // 4. UPDATE - Update an existing user
  const updateUser = useCallback(
    async (id: string, userData: UpdateUserData): Promise<User | null> => {
      setActionLoading(true);
      setError(null);
      try {
        const response = await axios.put(`${API_BASE_URL}/update/${id}`, userData, {
          withCredentials: true,
        });

        const rawUpdated = response.data?.user;
        if (!rawUpdated) {
          throw new Error('No user data returned from server');
        }

        const updatedUser = normalizeUser(rawUpdated);

        setUsers((prev) =>
          prev.map((u) => (u.user_id === id || u.id === id ? updatedUser : u))
        );

        setSelectedUser((prev) =>
          prev && (prev.user_id === id || prev.id === id) ? updatedUser : prev
        );

        return updatedUser;
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || 'Failed to update user';
        setError(message);
        console.error('updateUser error:', err);
        return null;
      } finally {
        setActionLoading(false);
      }
    },
    []
  );

  // 5. DELETE - Delete a user
  const deleteUser = useCallback(async (id: string): Promise<boolean> => {
    setActionLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_BASE_URL}/${id}`, { withCredentials: true });

      setUsers((prev) => prev.filter((u) => u.user_id !== id && u.id !== id));

      setSelectedUser((prev) =>
        prev && (prev.user_id === id || prev.id === id) ? null : prev
      );

      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to delete user';
      setError(message);
      console.error('deleteUser error:', err);
      return false;
    } finally {
      setActionLoading(false);
    }
  }, []);

  // 6. TOGGLE STATUS - Activate / Deactivate a user
  const toggleUserStatus = useCallback(
    async (id: string, currentStatus: boolean): Promise<User | null> => {
      return updateUser(id, { active: !currentStatus });
    },
    [updateUser]
  );

  return (
    <UsersContext.Provider
      value={{
        users,
        loading,
        actionLoading,
        error,
        selectedUser,
        allowedRoles,
        fetchUsers,
        getUserById,
        createUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        setSelectedUser,
        clearError,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
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
export const UserContext = UsersContext;
export const UserProvider = UsersProvider;
export const useUser = useUsers;

export default UsersContext;
