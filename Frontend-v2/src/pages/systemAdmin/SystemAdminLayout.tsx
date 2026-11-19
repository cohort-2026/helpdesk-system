import { Outlet } from "react-router";
import { Building2, House, Users as UsersIcon } from "lucide-react";
import Sidebar, { type NavItem } from "#components/Sidebar";

export const systemAdminNavItems: NavItem[] = [
  { label: "Overview", icon: House, href: "/system-admin" },
  { label: "Users", icon: UsersIcon, count: 214, href: "/system-admin/users" },
  { label: "Departments", icon: Building2, count: 5, href: "/system-admin/departments" },
];

export default function SystemAdminLayout() {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar navItems={systemAdminNavItems} userRole="System Admin" />
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
