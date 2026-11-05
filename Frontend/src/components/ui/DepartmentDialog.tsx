import React, { useState } from "react";
import { Button } from "./Button";
import { Alert } from "./Alert";
import { useDepartments } from "../../hooks/useDepartments";

interface CreateDepartmentDialogProps {
  ref: React.RefObject<HTMLDialogElement | null>;
}

export const DepartmentDialog = ({ ref }: CreateDepartmentDialogProps) => {
  const [departmentName, setDepartmentName] = useState("");
  const [description, setDescription] = useState("");
  const [departmentLead, setDepartmentLead] = useState("");
  const [nameError, setNameError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { createDepartment } = useDepartments();

  // Temporary options until we connect the users API.
  const departmentLeads: string[] = [];

  const resetForm = () => {
    setDepartmentName("");
    setDescription("");
    setDepartmentLead("");
    setNameError("");
    setSuccessMessage("");
  };

  const closeModal = () => {
    resetForm();
    ref.current?.close();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNameError("");
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
      await createDepartment({
        name: trimmedName,
        description: description.trim(),
      });
      setSuccessMessage("Department created successfully!");
      setDepartmentName("");
      setDescription("");
      setDepartmentLead("");
      setTimeout(() => {
        closeModal();
      }, 800);
    } catch (err: any) {
      setNameError(err.message || "Failed to create department");
    }
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby="departmentModalTitle"
      className="m-auto w-full max-w-xl rounded-lg bg-white p-6 shadow-lg backdrop:bg-black/50"
    >
      <div className="flex flex-col gap-4">
        <h2
          id="departmentModalTitle"
          className="text-xl font-bold text-gray-900 sm:text-2xl"
        >
          Create New Department
        </h2>

        {successMessage && (
          <Alert variant="success" description={successMessage} />
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
              Department Name:
            </label>

            <input
              type="text"
              id="departmentName"
              value={departmentName}
              onChange={(e) => {
                setDepartmentName(e.target.value);
                setNameError("");
                setSuccessMessage("");
              }}
              minLength={2}
              maxLength={100}
              required
              placeholder="Enter department name"
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
              <span className="ml-1 font-normal text-gray-500">(Optional)</span>
            </label>

            <textarea
              id="departmentDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the department's responsibilities"
              rows={3}
              className="w-full rounded-md border border-secondary/50 bg-background px-3 py-2 text-sm text-body-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Department Lead */}
          <div className="flex w-full flex-col gap-1.5">
            <label
              htmlFor="departmentLead"
              className="text-sm font-medium text-body-text"
            >
              Department Lead:
              <span className="ml-1 font-normal text-gray-500">(Optional)</span>
            </label>

            <select
              id="departmentLead"
              value={departmentLead}
              onChange={(e) => setDepartmentLead(e.target.value)}
              className="h-10 w-full rounded-md border border-secondary/50 bg-background px-3 py-2 text-sm text-body-text focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select a department lead</option>

              {departmentLeads.map((lead) => (
                <option key={lead} value={lead}>
                  {lead}
                </option>
              ))}
            </select>

            <p className="text-xs text-gray-500">
              Department lead options will appear when user data is connected.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>

            <Button type="submit" variant="primary">
              Create Department
            </Button>
          </div>
        </form>
      </div>
    </dialog>
  );
};
