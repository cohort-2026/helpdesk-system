import { useMemo } from "react";
import DepartmentsCard from "#components/DepartmentsOverviewCard";
import StatCard from "#components/StatCard";
import UsersOverviewCard from "#components/UsersOverviewCard";
import { useDepartments } from "#hooks/useDepartments";
import { useUsers } from "#context/UsersContext";

const SystemAdminHome = () => {
  const { departments } = useDepartments();
  const { users } = useUsers();

  const activeUsersCount = useMemo(() => users.filter((u) => u.active !== false).length, [users]);
  const inactiveUsersCount = useMemo(() => users.filter((u) => u.active === false).length, [users]);

  const activeDeptCount = useMemo(() => departments.filter((d) => d.status !== "inactive").length, [departments]);
  const inactiveDeptCount = useMemo(() => departments.filter((d) => d.status === "inactive").length, [departments]);

  const stats = [
    {
      label: "Active users",
      value: String(activeUsersCount),
      note: `${inactiveUsersCount} deactivated`,
    },
    {
      label: "Departments",
      value: `${activeDeptCount} active`,
      note: `${inactiveDeptCount} inactive`,
    },
    {
      label: "Total Personnel",
      value: String(users.length),
      note: "across organisation",
    },
    {
      label: "Assigned Leads",
      value: String(departments.filter((d) => d.lead_id).length),
      note: `${departments.filter((d) => !d.lead_id).length} unassigned`,
    },
  ];

  return (
    <>
      <header className="border-b px-6 py-4">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900">
          Overview
        </h1>
        <p className="mt-0.5 text-xs text-slate-500">
          organisation, set-up and totals
        </p>
      </header>

      <div className="space-y-4 p-4">
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} danger={false} />
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <DepartmentsCard />
          <div className="space-y-4">
            <UsersOverviewCard />
          </div>
        </section>
      </div>
    </>
  );
};

export default SystemAdminHome;
