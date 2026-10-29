
import React from "react";

export interface Department {
  id: string;
  name: string;
  departmentLead?: string | null;
}

interface DepartmentTableProps {
  departments: Department[];
  loading?: boolean;
}

const DepartmentTable: React.FC<DepartmentTableProps> = ({
  departments,
  loading = false,
}) => {
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-secondary/20 shadow-sm">
      <table className="w-full text-left text-sm text-body-text">
        <thead className="border-b border-secondary/20 bg-accent/15 text-xs font-semibold uppercase text-body-text">
          <tr>
            <th scope="col" className="px-4 py-3">
              Department Name
            </th>
            <th scope="col" className="px-4 py-3">
              Department Lead
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-secondary/15 bg-background">
          {loading ? (
            <tr>
              <td colSpan={2} className="px-4 py-8 text-center text-body-text/60">
                Loading departments...
              </td>
            </tr>
          ) : departments.length === 0 ? (
            <tr>
              <td colSpan={2} className="px-4 py-8 text-center text-body-text/60">
                No departments found. Click "Add Department" to create one.
              </td>
            </tr>
          ) : (
            departments.map((department) => (
              <tr
                key={department.id}
                className="transition-colors hover:bg-accent/5"
              >
                <td className="whitespace-nowrap px-4 py-3 font-medium">
                  {department.name}
                </td>

                <td className="whitespace-nowrap px-4 py-3 text-body-text/80">
                  {department.departmentLead || "Not assigned"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DepartmentTable;

