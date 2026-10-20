import React, { useRef } from 'react'
import Table from '../../components/ui/Table'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog';

const Users = () => {

    const dialogRef = useRef<HTMLDialogElement | null>(null);

  const openModal = () => dialogRef.current?.showModal();
  return (
    <div>
      <h3>Users</h3>
      <Button variant="primary" onClick={openModal}>Add User</Button>
      <Dialog ref={dialogRef} />
      <Table/>
    </div>
  )
}

export default Users
