import Brand from "./Brand";
import { Bell, FileText } from "lucide-react";
import { Avatar, AvatarFallback } from "#components/ui/avatar";
import { cn } from "#lib/utils";
import { Link, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";

export type NavItem = {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  active?: boolean;
  count?: number;
  href?: string;
};

type SidebarProps = {
  navItems: NavItem[];
  userRole?: string;
};

function Sidebar({ navItems, userRole }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const currentRole = userRole || user?.role || "User";
  const displayName = user?.name ? `${user.name} ${user.surname ?? ""}`.trim() : "Ruan Steyn";
  const userInitials = user?.name
    ? `${user.name[0] ?? ""}${user.surname ? user.surname[0] : ""}`.toUpperCase()
    : "RS";

  return (
    <aside className="w-56 shrink-0 flex-col border-r bg-slate-50/70 p-3 flex min-h-screen">
      <div className="flex items-center justify-between px-1 py-1">
        <Brand />
      </div>

      <nav className="mt-4 space-y-0.5" aria-label="Sidebar Navigation">
        {navItems.map(({ label, icon: Icon, active, count, href }) => {
          const isItemActive =
            active ?? (href ? location.pathname === href : false);

          const content = (
            <>
              <Icon className="size-3.5" />
              <span className="flex-1">{label}</span>
              {/* {count !== undefined && (
                <span className="text-[10px] text-slate-400">{count}</span>
              )} */}
            </>
          );

          const classes = cn(
            "flex items-center gap-2.5 rounded-md border border-transparent px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 transition-colors",
            isItemActive &&
              "border-slate-200 bg-white font-semibold text-indigo-700 shadow-sm hover:bg-white"
          );

          if (href) {
            return (
              <Link key={label} to={href} aria-current={isItemActive ? "page" : undefined} className={classes}>
                {content}
              </Link>
            );
          }

          return (
            <div
              key={label}
              aria-current={isItemActive ? "page" : undefined}
              className={classes}
            >
              {content}
            </div>
          );
        })}
      </nav>

      <p className="mt-5 px-2.5 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
        Stretch
      </p>
      <a
        href="#"
        className="mt-1 flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100"
      >
        <FileText className="size-3.5" />
        Audit log
      </a>

      <div className="mt-auto flex items-center gap-2.5 border-t px-1 pt-3">
        <Avatar className="size-7">
          <AvatarFallback className="bg-slate-600 text-[10px] font-semibold text-white">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        <div className="leading-tight">
          <p className="text-xs font-semibold text-slate-900">{displayName}</p>
          <p className="text-[10px] text-slate-500">{currentRole}</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;