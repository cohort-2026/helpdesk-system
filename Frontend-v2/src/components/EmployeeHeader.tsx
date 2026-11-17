import { useState } from "react";
import { Inbox} from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { cn } from "#lib/utils";
import { Link } from "react-router";

const navItems = [
  { label: "My requests", href: "/employee/my-requests" },
  { label: "New request", href: "/employee/submit-request" },
];

export default function EmployeeHeader ({ initials = "LM" }){
  const [active, setActive] = useState("My requests");

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
        </div>
      </div>
    </header>
  );
}
