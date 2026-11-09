import { useState, useRef, useMemo } from "react";
import DepartmentTable, { type Department } from "../../components/ui/DepartmentTable";
import { DepartmentDialog } from "../../components/ui/DepartmentDialog";
import { Button } from "../../components/ui/Button";
import { Alert } from "../../components/ui/Alert";
import { useDepartments } from "../../hooks/useDepartments";
import { getErrorMessage } from "../../utils/errors";

const Departments = () => {
  const createDialogRef = useRef<HTMLDialogElement>(null);
  const editDialogRef = useRef<HTMLDialogElement>(null);

  const {
    departments,
    loading,
    isRefetching,
    actionLoading,
    deleteDepartment,
    fetchAll,
    refetch,
    error: departmentsError,
  } = useDepartments();

  // State for editing and deleting
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter] = useState<"all" | "active" | "inactive">("all");

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const handleOpenCreate = () => {
    createDialogRef.current?.showModal();
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingDepartment(dept);
    editDialogRef.current?.showModal();
  };

  const handleCloseEdit = () => {
    setEditingDepartment(null);
    editDialogRef.current?.close();
  };

  const handleOpenDelete = (dept: Department) => {
    setDeletingDepartment(dept);
  };

  const handleConfirmDelete = async () => {
    if (!deletingDepartment) return;
    const deptToDelete = deletingDepartment;
    try {
      await deleteDepartment(deptToDelete.department_id);
      showNotification("success", `Department "${deptToDelete.department_name}" deleted successfully.`);
      setDeletingDepartment(null);
    } catch (err) {
      showNotification("error", getErrorMessage(err, "Failed to delete department."));
    }
  };

  // Filter departments based on search query and status filter
  const filteredDepartments = useMemo(() => {
    return departments.filter((dept) => {
      const matchesSearch =
        searchTerm.trim() === "" ||
        dept.department_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dept.description && dept.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (dept.departmentLead && dept.departmentLead.toLowerCase().includes(searchTerm.toLowerCase()));

      const isActive = dept.status !== "inactive";
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && isActive) ||
        (statusFilter === "inactive" && !isActive);

      return matchesSearch && matchesStatus;
    });
  }, [departments, searchTerm, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col gap-4 border-b pb-4 border-secondary/20 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-body-text">Departments</h1>
          </div>
          <p className="text-xs text-body-text/70 mt-1">
            Manage departments, configure department details, and assign department leads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Manual immediate background refetch button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            title="Refetch departments in background"
          >
            Refresh
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={handleOpenCreate}
            className="shadow-sm"
          >
            Add Department
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <Alert
          variant={notification.type}
          description={notification.message}
          className="transition-all"
        />
      )}

      {departmentsError && (
        <Alert
          variant="error"
          description={departmentsError}
        />
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by department name, description, or lead..."
            className="h-9 w-full rounded-md border border-secondary/40 bg-background pl-9 pr-3 text-xs text-body-text focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <svg
            className="absolute left-2.5 top-2.5 h-4 w-4 text-body-text/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-2.5 text-xs text-body-text/50 hover:text-body-text"
            >
              &times;
            </button>
          )}
        </div>

      </div>

      {/* Department Table */}
      <DepartmentTable
        departments={filteredDepartments}
        loading={loading}
        isRefetching={isRefetching}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        actionLoading={actionLoading}
      />

      {/* Dialog for Creating a new Department */}
         <DepartmentDialog
        ref={createDialogRef}
        onSuccess={() => {
          showNotification("success", "Department created successfully.");
          fetchAll(true);
        }}
      />

      {/* Dialog for Editing an existing Department */}
        <DepartmentDialog
        ref={editDialogRef}
        departmentToEdit={editingDepartment}
        onClose={handleCloseEdit}
        onSuccess={() => {
          showNotification("success", "Department updated successfully.");
          fetchAll(true);
        }}
      />

      {/* Delete Confirmation Modal */}
      {deletingDepartment && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-secondary/20">
            <div className="flex items-center gap-3">
          
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Delete Department
                </h3>
              </div>
            </div>

            <div className="mt-4 text-sm text-body-text/80">
              Are you sure you want to delete{" "}
              <strong className="text-gray-900">
                &quot;{deletingDepartment.department_name}&quot;
              </strong>
              ? This department will be deactivated.
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t pt-4 border-secondary/20">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingDepartment(null)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleConfirmDelete}
                isLoading={actionLoading}
              >
                Delete Department
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
