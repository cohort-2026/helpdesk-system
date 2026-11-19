import { Outlet } from "react-router";
import Sidebar, { type NavItem } from "#components/Sidebar";

type RoleLayoutProps = {
  navItems: NavItem[];
  userRole?: string;
};

export default function RoleLayout({ navItems, userRole }: RoleLayoutProps) {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar navItems={navItems} userRole={userRole} />
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
