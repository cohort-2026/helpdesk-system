import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const EmployeeSubmitRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    department: "IT",
    requestType: "New laptop (needs approval)",
    title: "",
    description: "",
    reason: "",
    cost: "",
  });

  // Your 5 departments
  const departments = ["IT", "Facilities", "Support", "Finance", "HR"];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.title || formData.title.length < 5)
      e.title = "Subject must be at least 5 characters.";
    if (!formData.department) e.department = "Department must be selected.";
    if (!formData.requestType) e.requestType = "Request type is required.";
    if (!formData.description || formData.description.length < 15)
      e.description = "Description must be at least 15 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addRequest = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      alert("Request submitted successfully!");
      navigate("/employee/my-requests");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="font-bold text-lg border-b pb-4 mb-6">
        Submit a new request
      </h1>

      <form onSubmit={addRequest} className="space-y-5">
        <div className="border-2 border-blue-400 p-4 rounded bg-blue-50/50">
          <p className="text-blue-600 text-sm font-medium mb-3">
            Step 1 - where should this go?
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Department</label>
              <select
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                className="w-full border rounded px-3 py-2 text-sm bg-white"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="text-red-500 text-xs mt-1">{errors.department}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500">Request type</label>
              <input
                value={formData.requestType}
                onChange={(e) =>
                  setFormData({ ...formData, requestType: e.target.value })
                }
                className="w-full border rounded px-3 py-2 text-sm bg-white"
                placeholder="e.g. New laptop (needs approval)"
              />
              {errors.requestType && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.requestType}
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500">Title</label>
          <input
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full border rounded px-3 py-2 text-sm"
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="text-xs text-gray-500">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full border rounded px-3 py-2 text-sm h-24"
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">{errors.description}</p>
          )}
        </div>

        <div>
          <label className="text-xs text-gray-500">Reason for request</label>
          <input
            value={formData.reason}
            onChange={(e) =>
              setFormData({ ...formData, reason: e.target.value })
            }
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500">Estimated cost</label>
          <div className="flex items-center gap-2">
            <input
              value={formData.cost}
              onChange={(e) =>
                setFormData({ ...formData, cost: e.target.value })
              }
              className="w-64 border rounded px-3 py-2 text-sm"
            />
            <span className="text-[10px] text-gray-400">
              Field added by request type
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <button
            disabled={loading}
            type="submit"
            className="bg-slate-800 text-white px-5 py-2 text-xs rounded disabled:bg-gray-400 flex items-center gap-2"
          >
            {loading && (
              <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></span>
            )}
            {loading ? "Submitting..." : "Submit for approval"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/employee/my-requests")}
            className="border border-slate-800 px-5 py-2 text-xs rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeSubmitRequest;
