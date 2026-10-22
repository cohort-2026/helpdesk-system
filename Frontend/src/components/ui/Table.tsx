import React from 'react';
import { useUsers } from '../../context/UsersContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from './Button';
import Loader from './Loader';

const Table: React.FC = () => {
  const { users, loading, deleteUser, toggleUserStatus, actionLoading } = useUsers();
  const { user } = useAuth();
  const isPlatformAdmin = user?.role === 'Platform Admin';

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      await deleteUser(id);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    await toggleUserStatus(id, currentStatus);
  };

  if (loading) {
    return <Loader/>;
  }

  if (users.length === 0) {
    return (
      <div className="p-8 text-center text-body-text/60 border border-dashed border-secondary/30 rounded-lg">
        No {isPlatformAdmin ? 'system admins' : 'users'} found. Click &quot;{isPlatformAdmin ? 'Add System Admin' : 'Add User'}&quot; to create one.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-secondary/20 shadow-sm mt-4">
      <table className="w-full text-left text-sm text-body-text">
        <thead className="bg-accent/15 text-xs uppercase text-body-text font-semibold border-b border-secondary/20">
          <tr>
            <th scope="col" className="px-4 py-3">Name</th>
            <th scope="col" className="px-4 py-3">Email</th>
            <th scope="col" className="px-4 py-3">Role</th>
            <th scope="col" className="px-4 py-3">Status</th>
            <th scope="col" className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-secondary/15 bg-background">
          {users.map((user) => {
            const userId = user.user_id || user.id || '';
            const fullName = `${user.name} ${user.surname}`.trim() || user.name;

            return (
              <tr key={userId} className="hover:bg-accent/5 transition-colors">
                <td className="px-4 py-3 font-medium text-body-text whitespace-nowrap">
                  {fullName}
                </td>
                <td className="px-4 py-3 text-body-text/80 whitespace-nowrap">
                  {user.email}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(userId, user.active)}
                    disabled={actionLoading}
                    title="Click to toggle status"
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold cursor-pointer transition-opacity hover:opacity-80 ${
                      user.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(userId, fullName)}
                    disabled={actionLoading}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Table;

