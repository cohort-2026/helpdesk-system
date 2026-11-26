import { Link } from "react-router"
import { ChevronDown } from "lucide-react"
import { Avatar, AvatarFallback } from "#components/ui/avatar"
import { PriorityBadge } from "#components/AgentHome/prioritybadge"
import { SlaChip } from "#components/AgentHome/sla-chip"
import { slaOf, type Ticket } from "./ticket-data"

export function TicketListPane({
  tickets,
  selectedId,
  loading = false,
}: {
  tickets: Ticket[]
  selectedId?: string
  loading?: boolean
}) {
  // Resolved tickets leave "My open"
  const open = tickets.filter((t) => t.status !== "Resolved")

  return (
    <section className="flex w-64 shrink-0 flex-col border-r bg-white">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-xs font-semibold">
          My open <span className="font-normal text-slate-400">{open.length}</span>
        </h2>
        <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-500">
          Due soonest <ChevronDown className="size-3" />
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-1.5 animate-pulse">
                <div className="h-2 w-24 rounded bg-slate-200" />
                <div className="h-2.5 w-full rounded bg-slate-200" />
                <div className="h-2 w-32 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : open.length === 0 ? (
          <p className="p-6 text-center text-xs text-slate-400">
            No open tickets assigned to you.
          </p>
        ) : (
          open.map((t) => {
          const sla = slaOf(t)
          const selected = t.id === selectedId
          return (
            <Link
              key={t.id}
              to={`/agent/tickets/${t.id}`}
              className={`block border-b border-l-2 px-4 py-3 ${
                selected
                  ? "border-l-indigo-600 bg-indigo-50"
                  : "border-l-transparent hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-slate-400">{t.id}</span>
                <PriorityBadge priority={t.priority} />
                <span className="flex-1" />
                <SlaChip state={sla.state}>{sla.text}</SlaChip>
              </div>
              <div className="mt-1.5 text-xs font-semibold leading-tight">{t.title}</div>
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                <Avatar className="size-4">
                  <AvatarFallback className={`${t.colour} text-[7px] font-semibold text-white`}>
                    {t.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">
                  {t.requester} · {t.category}
                </span>
              </div>
            </Link>
          )
        })
        )}
      </div>
    </section>
  )
}