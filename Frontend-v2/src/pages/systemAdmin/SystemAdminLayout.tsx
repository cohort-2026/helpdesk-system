import { Outlet } from "react-router";
import { BarChart3, Building2, Clock, House, Tag, Timer, Users } from "lucide-react";
import Sidebar, { type NavItem } from "#components/Sidebar";

const systemAdminNavItems: NavItem[] = [
  { label: "Overview", icon: House, href: "/system-admin" },
  { label: "Users", icon: Users, count: 214, href: "/system-admin/users" },
  { label: "Departments", icon: Building2, count: 5, href: "/system-admin/departments" },
  { label: "Categories & routing", icon: Tag, href: "/system-admin/categories" },
  { label: "SLA policies", icon: Timer, href: "/system-admin/sla-policies" }
];

export default function SystemAdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar navItems={systemAdminNavItems} userRole="System Admin" />
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
