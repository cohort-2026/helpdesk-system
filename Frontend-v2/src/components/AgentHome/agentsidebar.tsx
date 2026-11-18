// The left-hand menu. It is made by hand with simple Tailwind classes,
// so you do not need to install the shadcn "sidebar" component.
// Only "Home" for now. To add more links later, add more lines to NAV_ITEMS.

import { Bell, Home, Inbox, Search } from "lucide-react"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Input } from "../ui/input"

const NAV_ITEMS = [{ title: "Home", href: "/agent", icon: Home }]

export function AgentSidebar({ activePath = "/agent" }: { activePath?: string }) {
  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r bg-slate-50 md:flex">
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
      <nav className="flex-1 px-3 pt-3">
        {NAV_ITEMS.map((item) => {
          const active = activePath === item.href
          return (
            <a
              key={item.title}
              href={item.href}
              className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs ${
                active
                  ? "border bg-white font-medium text-slate-900"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <item.icon className="size-3.5" />
              {item.title}
            </a>
          )
        })}
      </nav>

      {/* Logged-in agent at the bottom */}
      <div className="m-3 flex items-center gap-2 border-t pt-3">
        <Avatar className="size-7">
          <AvatarFallback className="bg-indigo-600 text-[10px] text-white">
            TN
          </AvatarFallback>
        </Avatar>
        <div className="leading-tight">
          <div className="text-xs font-medium">Thabo Nkosi</div>
          <div className="text-[11px] text-slate-500">Agent · IT Support</div>
        </div>
      </div>
    </aside>
  )
}