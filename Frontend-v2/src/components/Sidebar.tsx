import Brand from "./Brand";
import { Bell, FileText } from "lucide-react";
import { Avatar, AvatarFallback } from "#components/ui/avatar";
import { cn } from "#lib/utils";


type NavItem ={
    label: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    active?: boolean;
    count?: number;
}

type SidebarProps = {
  navItems: NavItem[];
};

function Sidebar({ navItems }: SidebarProps) {
  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r bg-slate-50/70 p-3 md:flex">
      <div className="flex items-center justify-between px-1 py-1">
        <Brand />
        <button
          aria-label="Notifications"
          className="relative rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
        >
          <Bell className="size-4" />
          <span className="absolute right-1 top-1 size-1.5 rounded-full bg-red-500" />
        </button>
      </div>

      <nav className="mt-4 space-y-0.5" aria-label="Admin">
        {navItems.map(({ label, icon: Icon, active, count }) => (
          <a
            key={label}
            href="#"
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-md border border-transparent px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100",
              active &&
                "border-slate-200 bg-white font-semibold text-indigo-700 shadow-sm hover:bg-white"
            )}
          >
            <Icon className="size-3.5" />
            <span className="flex-1">{label}</span>
            {count !== undefined && (
              <span className="text-[10px] text-slate-400">{count}</span>
            )}
          </a>
        ))}
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
            RS
          </AvatarFallback>
        </Avatar>
        <div className="leading-tight">
          <p className="text-xs font-semibold text-slate-900">Ruan Steyn</p>
          <p className="text-[10px] text-slate-500">System Admin</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar