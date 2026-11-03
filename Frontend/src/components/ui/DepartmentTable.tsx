import React from "react";
import { Button } from "./Button";
import { type Department } from "../../hooks/useDepartments";
import { useUsers } from "../../context/UsersContext";
import Loader from "./Loader";

export type { Department };

interface DepartmentTableProps {
  departments: Department[];
  loading?: boolean;
  isRefetching?: boolean;
  onEdit?: (department: Department) => void;
  onDelete?: (department: Department) => void;
  actionLoading?: boolean;
}

const DepartmentTable: React.FC<DepartmentTableProps> = ({
  departments = [],
  loading = false,
  isRefetching = false,
  onEdit,
  onDelete,
  actionLoading = false,
}) => {
  const { users } = useUsers();

  // Helper to resolve department lead display name
  const getLeadDisplayName = (department: Department): string | null => {
    if (department.departmentLead && department.departmentLead.trim() !== "") {
      return department.departmentLead;
    }
    if (department.lead_name || department.lead_surname) {
      return `${department.lead_name || ""} ${department.lead_surname || ""}`.trim();
    }
    if (department.lead_id && users && users.length > 0) {
      const matched = users.find(
        (u) =>
          String(u.user_id) === String(department.lead_id) ||
          String(u.id) === String(department.lead_id)
      );
      if (matched) {
        return `${matched.name} ${matched.surname || ""}`.trim() || matched.name;
      }
    }
    return null;
  };

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-secondary/20 shadow-sm bg-background">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-body-text">
          <thead className="border-b border-secondary/20 bg-accent/15 text-xs font-semibold uppercase tracking-wider text-body-text">
            <tr>
              <th scope="col" className="px-5 py-3.5">
                Department Name
              </th>
              <th scope="col" className="px-5 py-3.5">
                Description
              </th>
              <th scope="col" className="px-5 py-3.5">
                Department Lead
              </th>
              <th scope="col" className="px-5 py-3.5">
                Status
              </th>
              <th scope="col" className="px-5 py-3.5 text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-secondary/15 bg-background">
            {loading ? (
              <Loader/>
            ) : departments?.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-10 text-center text-body-text/60"
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="font-medium text-body-text/80">
                      No departments found
                    </span>
                    <span className="text-xs">
                      Click &quot;Add Department&quot; above to create your first department.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              departments.map((department) => {
                const deptId = department.department_id;
                const leadName = getLeadDisplayName(department);
                const isActive = department.status !== "inactive";

                return (
                  <tr
                    key={deptId}
                    className="transition-colors hover:bg-accent/5"
                  >
                    <td className="whitespace-nowrap px-5 py-3.5 font-semibold text-body-text">
                      <div className="flex items-center gap-2">
                        <span>{department.department_name}</span>
                      </div>
                    </td>

                    <td className="max-w-xs truncate px-5 py-3.5 text-body-text/80">
                      {department.description ? (
                        <span title={department.description}>
                          {department.description}
                        </span>
                      ) : (
                        <span className="text-body-text/40 italic">
                          No description
                        </span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-3.5">
                      {leadName ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-accent/20 px-2.5 py-1 text-xs font-medium text-primary">
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          {leadName}
                        </span>
                      ) : (
                        <span className="text-xs text-body-text/50 italic">
                          Not assigned
                        </span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          isActive
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-gray-100 text-gray-700 border border-gray-300"
                        }`}
                      >
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onEdit && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(department)}
                            disabled={actionLoading}
                            className="hover:border-primary hover:text-primary transition-all"
                            title="Edit department"
                          >
                            <svg
                              className="mr-1 h-3.5 w-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit
                          </Button>
                        )}

                        {onDelete && (
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={() => onDelete(department)}
                            disabled={actionLoading}
                            title="Delete department"
                          >
                            <svg
                              className="mr-1 h-3.5 w-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepartmentTable;
