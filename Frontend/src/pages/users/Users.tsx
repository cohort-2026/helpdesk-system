import React, { useRef } from 'react';
import Table from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { useUsers } from '../../context/UsersContext';
import { useAuth } from '../../context/AuthContext';

const Users: React.FC = () => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const { fetchUsers, loading, users } = useUsers();
  const { user } = useAuth();

  const openModal = () => dialogRef.current?.showModal();

  const isPlatformAdmin = user?.role === 'Platform Admin';
  const pageTitle = isPlatformAdmin ? 'System Admins' : 'Users';
  const pageDescription = isPlatformAdmin
    ? `Create and manage System Administrators (${users.length} system admin${users.length === 1 ? '' : 's'})`
    : `Manage department leads, agents, and employees (${users.length} user${users.length === 1 ? '' : 's'})`;
  const addBtnLabel = isPlatformAdmin ? 'Add System Admin' : 'Add User';

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-secondary/20">
        <div>
          <h3 className="text-xl font-bold text-body-text">{pageTitle}</h3>
          <p className="text-xs text-body-text/70">
            {pageDescription}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchUsers()}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={openModal}>
            {addBtnLabel}
          </Button>
        </div>
      </div>

      <Dialog ref={dialogRef} />
      <Table />
    </div>
  );
};

export default Users;


