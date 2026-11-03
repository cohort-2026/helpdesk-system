import React, { useState, useEffect, useMemo } from "react";
import { Button } from "./Button";
import { Alert } from "./Alert";
import { useDepartments, type Department } from "../../hooks/useDepartments";
import { useUsers } from "../../context/UsersContext";

interface DepartmentDialogProps {
  ref?: React.RefObject<HTMLDialogElement | null>;
  isOpen?: boolean;
  departmentToEdit?: Department | null;
  onClose?: () => void;
  onSuccess?: () => void;
}

export const DepartmentDialog: React.FC<DepartmentDialogProps> = ({
  ref,
  isOpen,
  departmentToEdit,
  onClose,
  onSuccess,
}) => {
  const isEditMode = Boolean(departmentToEdit);
  const { createDepartment, updateDepartment, actionLoading } = useDepartments();
  const { users, fetchUsers, loading: usersLoading } = useUsers();

  const [departmentName, setDepartmentName] = useState("");
  const [description, setDescription] = useState("");
  const [departmentLead, setDepartmentLead] = useState("");
  const [status, setStatus] = useState("active");
  const [nameError, setNameError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Ensure users list is populated so we have all department leads
  useEffect(() => {
    if ((!users || users.length === 0) && fetchUsers) {
      fetchUsers();
    }
  }, [users, fetchUsers]);

  // Filter and display ONLY users with the "Department Lead" role
  const departmentLeadUsers = useMemo(() => {
    if (!users || !Array.isArray(users)) return [];
    return users.filter(
      (u) =>
        u.role === "Department Lead" ||
        u.role?.toLowerCase() === "department lead"
    );
  }, [users]);

  // Populate or reset form when modal opens or editing department changes
  useEffect(() => {
    if (departmentToEdit) {
      setDepartmentName(departmentToEdit.department_name || "");
      setDescription(departmentToEdit.description || "");
      const leadIdVal =
        departmentToEdit.lead_id !== undefined && departmentToEdit.lead_id !== null
          ? String(departmentToEdit.lead_id)
          : "";
      setDepartmentLead(leadIdVal);
      setStatus(departmentToEdit.status || "active");
    } else {
      setDepartmentName("");
      setDescription("");
      setDepartmentLead("");
      setStatus("active");
    }
    setNameError("");
    setErrorMessage("");
    setSuccessMessage("");
  }, [departmentToEdit, isOpen]);

  // Handle native <dialog> open/close if isOpen prop is controlled
  useEffect(() => {
    if (!ref?.current) return;
    if (isOpen && !ref.current.open) {
      ref.current.showModal();
    } else if (isOpen === false && ref.current.open) {
      ref.current.close();
    }
  }, [isOpen, ref]);

  const resetForm = () => {
    setDepartmentName("");
    setDescription("");
    setDepartmentLead("");
    setStatus("active");
    setNameError("");
    setErrorMessage("");
    setSuccessMessage("");
  };

  const closeModal = () => {
    resetForm();
    if (onClose) {
      onClose();
    }
    if (ref?.current) {
      try {
        ref.current.close();
      } catch {
        // ignore if already closed
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNameError("");
    setErrorMessage("");
    setSuccessMessage("");

    const trimmedName = departmentName.trim();

    if (!trimmedName) {
      setNameError("Department name is required.");
      return;
    }

    if (trimmedName.length < 2) {
      setNameError("Department name must contain at least 2 characters.");
      return;
    }

    if (trimmedName.length > 100) {
      setNameError("Department name cannot exceed 100 characters.");
      return;
    }

    try {
      if (isEditMode && departmentToEdit) {
        await updateDepartment(departmentToEdit.department_id, {
          name: trimmedName,
          description: description.trim(),
          leadId: departmentLead ? departmentLead : null,
          status,
        });
        setSuccessMessage("Department updated successfully!");
      } else {
        await createDepartment({
          name: trimmedName,
          description: description.trim(),
          leadId: departmentLead ? departmentLead : null,
          status,
        });
        setSuccessMessage("Department created successfully!");
      }

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        closeModal();
      }, 700);
    } catch (err: any) {
      const msg = err.message || (isEditMode ? "Failed to update department" : "Failed to create department");
      setErrorMessage(msg);
    }
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby="departmentModalTitle"
      className="m-auto w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl backdrop:bg-black/60 border border-secondary/20 transition-all"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <h2
              id="departmentModalTitle"
              className="text-xl font-bold text-gray-900 sm:text-2xl"
            >
              {isEditMode ? "Edit Department" : "Create New Department"}
            </h2>
            <p className="text-xs text-body-text/70 mt-1">
              {isEditMode
                ? "Update department details, status, and lead assignment."
                : "Fill in the details below to create a department and assign a lead."}
            </p>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {successMessage && (
          <Alert variant="success" description={successMessage} />
        )}

        {errorMessage && (
          <Alert variant="error" description={errorMessage} />
        )}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          noValidate
        >
          {/* Department Name */}
          <div>
            <label
              htmlFor="departmentName"
              className="mb-1 block text-sm font-medium text-body-text"
            >
              Department Name <span className="text-red-500">*</span>:
            </label>

            <input
              type="text"
              id="departmentName"
              value={departmentName}
              onChange={(e) => {
                setDepartmentName(e.target.value);
                setNameError("");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              minLength={2}
              maxLength={100}
              required
              placeholder="e.g. Technical Support, Human Resources"
              aria-invalid={Boolean(nameError)}
              aria-describedby={nameError ? "departmentNameError" : undefined}
              className="h-10 w-full rounded-md border border-secondary/50 bg-background px-3 py-2 text-sm text-body-text focus:outline-none focus:ring-2 focus:ring-primary"
            />

            {nameError && (
              <p
                id="departmentNameError"
                role="alert"
                className="mt-1 text-sm text-red-600"
              >
                {nameError}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="departmentDescription"
              className="mb-1 block text-sm font-medium text-body-text"
            >
              Description:
            </label>

            <textarea
              id="departmentDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the department's responsibilities and scope"
              rows={3}
              className="w-full rounded-md border border-secondary/50 bg-background px-3 py-2 text-sm text-body-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Department Lead Selection - Filtered strictly to 'Department Lead' role */}
          <div className="flex w-full flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="departmentLead"
                className="text-sm font-medium text-body-text"
              >
                Department Lead:
              </label>
              <span className="text-xs text-primary font-medium">
                {usersLoading
                  ? "Loading leads..."
                  : `${departmentLeadUsers.length} Lead${departmentLeadUsers.length === 1 ? "" : "s"} Available`}
              </span>
            </div>

            <select
              id="departmentLead"
              value={departmentLead}
              onChange={(e) => setDepartmentLead(e.target.value)}
              className="h-10 w-full rounded-md border border-secondary/50 bg-background px-3 py-2 text-sm text-body-text focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">-- No Department Lead Assigned --</option>

              {departmentLead &&
                !departmentLeadUsers.some(
                  (l) => String(l.user_id || l.id) === String(departmentLead)
                ) && (
                  <option value={departmentLead}>
                    {departmentToEdit?.departmentLead || `Current Lead (ID: ${departmentLead})`}
                  </option>
                )}

              {departmentLeadUsers.map((lead) => {
                const leadId = lead.user_id || lead.id || "";
                const fullName = `${lead.name} ${lead.surname || ""}`.trim() || lead.name;
                return (
                  <option key={leadId} value={leadId}>
                    {fullName} {lead.email ? `(${lead.email})` : ""}
                  </option>
                );
              })}
            </select>

            {departmentLeadUsers.length === 0 && !usersLoading ? (
              <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                No users with the <strong>Department Lead</strong> role were found. Only users assigned the "Department Lead" role are shown here.
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                Filtered strictly to users with the <strong>Department Lead</strong> role.
              </p>
            )}
          </div>

          {/* Status (when editing) */}
          {isEditMode && (
            <div className="flex w-full flex-col gap-1.5">
              <label
                htmlFor="departmentStatus"
                className="text-sm font-medium text-body-text"
              >
                Status:
              </label>
              <select
                id="departmentStatus"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-10 w-full rounded-md border border-secondary/50 bg-background px-3 py-2 text-sm text-body-text focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="mt-3 flex justify-end gap-2 border-t pt-4 border-secondary/20">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              disabled={actionLoading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              isLoading={actionLoading}
            >
              {isEditMode ? "Save Changes" : "Create Department"}
            </Button>
          </div>
        </form>
      </div>
    </dialog>
  );
};
