import { Outlet } from "react-router";
import { House, ListOrdered, CheckSquare, Users as UsersIcon, BarChart3 } from "lucide-react";
import Sidebar, { type NavItem } from "#components/Sidebar";

export const departmentLeadNavItems: NavItem[] = [
  { label: "Overview", icon: House, href: "/department-lead" },
  { label: "Ticket Queue", icon: ListOrdered, href: "/department-lead/ticket-queue" },
  { label: "Approvals", icon: CheckSquare, href: "/department-lead/approvals" },
  { label: "Team & Agents", icon: UsersIcon, href: "/department-lead/team" },
  { label: "Reports", icon: BarChart3, href: "/department-lead/reports" },
];

export default function DepartmentLeadLayout() {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar navItems={departmentLeadNavItems} userRole="Department Lead" />
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
