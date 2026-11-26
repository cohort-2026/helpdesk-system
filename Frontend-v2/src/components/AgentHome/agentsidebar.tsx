import { Bell, Home, Inbox, LogOut, Search, User } from "lucide-react"
import { Link, useNavigate } from "react-router"
import { Avatar, AvatarFallback } from "#components/ui/avatar"
import { Input } from "#components/ui/input"
import { useAuth } from "#context/AuthContext"

interface AgentSidebarProps {
  activePath?: string
  /** Live count for "My open" nav item — passed in from AgentHome */
  myOpenCount?: number
  /** Live count for "Unassigned" nav item — passed in from AgentHome */
  unassignedCount?: number
}

export function AgentSidebar({
  activePath = "/agent",
  myOpenCount,
  unassignedCount,
}: AgentSidebarProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const fullName  = [user?.name, user?.surname].filter(Boolean).join(" ") || "Agent"
  const initials  = fullName
    .split(" ")
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("")
  const role      = user?.role ?? "Agent"

  const NAV_ITEMS = [
    { title: "Home",        href: "/agent",              icon: Home,  count: undefined },
    { title: "My open",     href: "/agent/open",          icon: Inbox, count: myOpenCount },
    { title: "Unassigned",  href: "/agent/ticket-queue",  icon: User,  count: unassignedCount },
  ]

  return (
    <aside className="hidden h-screen min-h-0 w-56 shrink-0 flex-col overflow-hidden border-r bg-slate-50 md:flex">
      {/* Logo + bell */}
      <div className="flex items-center gap-2.5 px-4 pt-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <Inbox className="size-4" />
        </div>
        <div className="flex-1 leading-tight">
          <p className="text-xs font-semibold text-slate-900">Helpdesk</p>
        </div>
        <span className="relative">
          <Bell className="size-4 text-slate-500" />
          <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-red-500" />
        </span>
      </div>

      {/* Search box */}
      <div className="relative px-3 pt-3">
        <Search className="absolute left-5 top-[22px] size-3.5 text-slate-400" />
        <Input placeholder="Search" className="h-8 bg-white pl-8 pr-10 text-xs" />
        <kbd className="absolute right-5 top-[19px] rounded bg-slate-100 px-1.5 text-[10px] text-slate-500">
          ⌘K
        </kbd>
      </div>

      {/* Links */}
      <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden px-3 pt-3">
        {NAV_ITEMS.map((item) => {
          const active = activePath === item.href
          return (
            <Link
              key={item.title}
              to={item.href}
              className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs ${
                active
                  ? "border bg-white font-medium text-slate-900"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <item.icon className="size-3.5" />
              <span className="flex-1">{item.title}</span>
              {item.count !== undefined && (
                <span
                  className={`text-[11px] ${
                    active ? "font-semibold text-indigo-600" : "text-slate-400"
                  }`}
                >
                  {item.count}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logged-in agent at the bottom */}
      <div className="mt-auto px-3 pb-3">
        <div className="flex items-center gap-2 border-t pt-3">
          <Avatar className="size-7">
            <AvatarFallback className="bg-indigo-600 text-[10px] text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-xs font-medium">{fullName}</div>
            <div className="text-[11px] text-slate-500">{role}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            void logout().then(() => navigate("/", { replace: true }))
          }}
          className="mt-2 flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100"
        >
          <LogOut className="size-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  )
}