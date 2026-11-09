import React, { useState, useEffect, useCallback, type ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import {
  UsersContext,
  getAllowedRolesForAdmin,
  type User,
  type UserRole,
  type CreateUserData,
  type UpdateUserData,
} from './UsersContext';
import { getErrorMessage } from '../utils/errors';

const API_BASE_URL = `${import.meta.env.VITE_API_URL ?? ""}/api/users`;


// Shape of a user as returned by the API: may carry `id` instead of `user_id`.
type RawUser = Omit<User, 'user_id'> & { user_id?: string };

// Helper to normalize user object with both user_id and id
const normalizeUser = (rawUser: RawUser): User => ({
  ...rawUser,
  user_id: (rawUser.user_id || rawUser.id) as string,
  id: rawUser.user_id || rawUser.id,
});

export const UsersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user: authUser, isAuthenticated } = useAuth();
  const authRole = authUser?.role;
  const allowedRoles = React.useMemo(() => getAllowedRolesForAdmin(authRole), [authRole]);

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
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          response = await axios.get(`${API_BASE_URL}/getUser`, { withCredentials: true });
        } else {
          throw err;
        }
      }

      const rawUsers: RawUser[] = response.data?.users || response.data || [];
      const normalizedUsers = rawUsers.map(normalizeUser);
      // Scope users based on logged-in admin permissions
      const scopedUsers = allowedRoles.length > 0
        ? normalizedUsers.filter((u) => allowedRoles.includes(u.role as UserRole))
        : normalizedUsers;
      setUsers(scopedUsers);
      return scopedUsers;
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to fetch users');
      setError(message);
      console.error('fetchUsers error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [allowedRoles]);

  // Automatically fetch users when authenticated or when role changes, and
  // clear them on logout. Disabled rule: fetchUsers only sets data after the
  // request resolves, and the logout reset must happen when auth changes.
  useEffect(() => {
    if (isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchUsers();
    } else {
      setUsers([]);
      setSelectedUser(null);
    }
  }, [isAuthenticated, authRole, fetchUsers]);

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
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to fetch user');
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
        const roleErrMsg = authRole === 'Platform Admin'
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
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to create user');
      setError(message);
      console.error('createUser error:', err);
      return null;
    } finally {
      setActionLoading(false);
    }
  }, [allowedRoles, authRole]);

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
      } catch (err) {
        const message = getErrorMessage(err, 'Failed to update user');
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
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to delete user');
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
