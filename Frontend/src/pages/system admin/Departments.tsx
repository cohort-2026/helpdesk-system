import React from 'react'
import { useRef } from "react";
import { DepartmentDialog } from '../../components/ui/DepartmentDialog';
import { Button } from '../../components/ui/Button'
const Departments = () => {
  const departmentDialogRef = useRef<HTMLDialogElement>(null);
  return (
     <div>
      <div className="flex w-full items-center justify-between gap-4 border-b pb-4 border-secondary/20">
      <div>
      <h1 className="text-xl font-bold text-body-text">
        Departments
      </h1>
      <p className="text-xs text-body-text/70">
        Manage departments and their assigned department leads.
      </p>
     </div>
      < Button
        type="button"
       variant="primary"
        onClick={() => departmentDialogRef.current?.showModal()}
        >
  Add Department
      </Button>
      <DepartmentDialog ref={departmentDialogRef} />
    </div>
    </div>
  )
}
export default Departments
