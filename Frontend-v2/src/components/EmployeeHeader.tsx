import { useState } from "react";
import { Inbox, LogOut} from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { cn } from "#lib/utils";
import { Link, useNavigate } from "react-router";
import { useAuth } from "#context/AuthContext";

const navItems = [
  { label: "My requests", href: "/employee/my-requests" },
  { label: "New request", href: "/employee/submit-request" },
];

export default function EmployeeHeader ({ initials = "LM" }){
  const [active, setActive] = useState("My requests");
    const { logout } = useAuth();
      const navigate = useNavigate();

  

  return (
    <header className="border-b bg-white">
      <div className="flex h-14 items-center gap-6 px-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Inbox className="size-4" />
          </div>
          <div className="leading-tight">
            <p className="text-xs font-semibold text-slate-900">Helpdesk</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1" aria-label="Main">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              size="sm"
              aria-current={active === item.label ? "page" : undefined}
              onClick={() => setActive(item.label)}
              className={cn(
                "h-8 px-3 text-xs font-medium text-slate-600 hover:text-slate-900",
                active === item.label && "bg-slate-100 font-semibold text-slate-900",
              )}
            >
                <Link to={item.href}>
                  {item.label}
                </Link>
            </Button>
          ))}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarFallback className="bg-emerald-700 text-[11px] font-semibold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
               <button
        type="button"
        onClick={() => {
          void logout().then(() => navigate("/", { replace: true }));
        }}
        className="mt-2 flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100"
      >
        <LogOut className="size-3.5" />
        Sign out
      </button>
        </div>
      </div>
    </header>
  );
}
