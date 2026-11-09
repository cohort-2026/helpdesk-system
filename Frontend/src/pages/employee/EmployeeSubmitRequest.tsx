import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/ui/Toast";
import { useDepartments } from "../../hooks/useDepartments";
import * as ticketService from "../../services/ticketService";
import type { TicketPriority } from "../../types/ticket.types";
import { Button } from "../../components/ui/Button";

const EmployeeSubmitRequest = () => {
  const navigate = useNavigate();
  const { toastElement, showToast } = useToast();
  const { departments, loading: deptLoading } = useDepartments();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    department_id: "",
    title: "",
    description: "",
    priority: "Low" as TicketPriority,
  });

  // Set default department_id to first department once loaded
  useEffect(() => {
    if (departments.length > 0 && !formData.department_id) {
      setFormData((prev) => ({
        ...prev,
        department_id: String(departments[0].department_id),
      }));
    }
  }, [departments, formData.department_id]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.title || formData.title.trim().length < 5)
      e.title = "Subject must be at least 5 characters.";
    if (formData.title.trim().length > 255)
      e.title = "Subject must be 255 characters or fewer.";
    if (!formData.department_id)
      e.department_id = "Department must be selected.";
    if (!formData.description || formData.description.trim().length < 15)
      e.description = "Description must be at least 15 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addRequest = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await ticketService.createTicket({
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        department_id: formData.department_id
          ? Number(formData.department_id)
          : undefined,
      });
      showToast("Request submitted successfully!", "success");
      setTimeout(() => navigate("/employee/my-requests"), 1200);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to submit request.";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl">
      {toastElement}

      <h1 className="font-bold text-lg border-b pb-4 mb-6">
        Submit a new request
      </h1>

      <form onSubmit={addRequest} className="space-y-5">
        {/* Step 1: Routing */}
        <div className="  p-4 rounded">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Department</label>
              {deptLoading ? (
                <div className="w-full border rounded px-3 py-2 text-sm bg-white text-gray-400 animate-pulse">
                  Loading departments…
                </div>
              ) : (
                <select
                  id="department-select"
                  value={formData.department_id}
                  onChange={(e) =>
                    setFormData({ ...formData, department_id: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 text-sm bg-white"
                >
                  <option value="">Select department</option>
                  {departments
                    .filter((d) => d.status === "active")
                    .map((d) => (
                      <option
                        key={d.department_id}
                        value={String(d.department_id)}
                      >
                        {d.department_name}
                      </option>
                    ))}
                </select>
              )}
              {errors.department_id && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.department_id}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500">Priority</label>
              <select
                id="priority-select"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as TicketPriority,
                  })
                }
                className="w-full border rounded px-3 py-2 text-sm bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs text-gray-500">Title</label>
          <input
            id="ticket-title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Brief summary of your request"
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="text-xs text-gray-500">Description</label>
          <textarea
            id="ticket-description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full border rounded px-3 py-2 text-sm h-24"
            placeholder="Provide details about your issue or request…"
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">{errors.description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button
            type="button"
            onClick={() => navigate("/employee/my-requests")}
            variant="outline"
            // className="border border-slate-800 px-5 py-2 text-xs rounded hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            id="submit-ticket-btn"
            disabled={loading}
            type="submit"
            className="disabled:bg-gray-400 flex items-center gap-2 transition-colors hover:bg-slate-700"
          >
            {loading && (
              <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></span>
            )}
            {loading ? "Submitting…" : "Submit request"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeSubmitRequest;
