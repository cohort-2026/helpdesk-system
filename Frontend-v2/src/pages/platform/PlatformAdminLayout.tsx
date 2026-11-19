import { Outlet } from "react-router";
import { House, Users as UsersIcon } from "lucide-react";
import Sidebar, { type NavItem } from "#components/Sidebar";

export const platformAdminNavItems: NavItem[] = [
  { label: "Overview", icon: House, href: "/platform-admin" },
  { label: "Users", icon: UsersIcon, href: "/platform-admin/users" },
];

export default function PlatformAdminLayout() {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar navItems={platformAdminNavItems} userRole="Platform Admin" />
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
