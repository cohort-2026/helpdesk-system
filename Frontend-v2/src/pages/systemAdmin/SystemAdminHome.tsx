import DepartmentsCard from "#components/DepartmentsOverviewCard";
import StatCard from "#components/StatCard";
import UsersOverviewCard from "#components/UsersOverviewCard";

const stats = [
  { label: "Active users", value: "208", note: "6 deactivated" },
  { label: "Departments", value: "4 active", note: "1 inactive" },
  { label: "Open tickets", value: "96", note: "across all departments" },
  {
    label: "Breached",
    value: "5",
    note: "IT 2 · Facilities 3",
    danger: true,
  },
];

const SystemAdminHome = () => {
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
            <StatCard key={s.label} {...s} danger={s.danger ?? false} />
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
