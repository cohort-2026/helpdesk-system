import { Check, ChevronDown } from "lucide-react"
import { Avatar, AvatarFallback } from "#components/ui/avatar"
import { Badge } from "#components/ui/badge"
import { PriorityBadge, type Priority } from "#components/AgentHome/prioritybadge"
import { SlaChip } from "#components/AgentHome/sla-chip"
import { PRIORITY_LABEL, slaOf, type Status, type Ticket } from "./ticket-data"

const STATUS_STYLE: Record<Status, { badge: string; dot: string }> = {
  Open: { badge: "border-blue-200 bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  "Waiting on employee": { badge: "border-amber-200 bg-amber-50 text-amber-800", dot: "bg-amber-500" },
  Resolved: { badge: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
}

const PRIORITY_STYLE: Record<Priority, string> = {
  urgent: "border-red-300 bg-red-50 text-red-700",
  high: "border-orange-300 bg-orange-50 text-orange-700",
  medium: "border-blue-300 bg-blue-50 text-blue-700",
  low: "border-slate-300 bg-slate-50 text-slate-600",
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="mb-1 text-[10px] font-semibold tracking-wide text-slate-400">{title}</p>
      {children}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-8 items-center justify-between gap-2 border-b text-[11px] last:border-b-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  )
}

export function TicketPropertiesPane({
  ticket,
  onChangePriority,
}: {
  ticket: Ticket
  onChangePriority: (priority: Priority) => void
}) {
  const status = STATUS_STYLE[ticket.status]
  const sla = slaOf(ticket)

  return (
    <aside className="hidden w-64 shrink-0 overflow-y-auto border-l bg-white p-4 xl:block">
      <Section title="PROPERTIES">
        <Row label="Status">
          <Badge variant="outline" className={`h-5 gap-1 rounded-full px-2 py-0 text-[10px] ${status.badge}`}>
            <span className={`size-1.5 rounded-full ${status.dot}`} />
            {ticket.status === "Waiting on employee" ? "Waiting" : ticket.status}
          </Badge>
        </Row>

        <Row label="Priority">
          {/* The agent picks the priority here */}
          <label className={`relative inline-flex h-6 items-center gap-1.5 rounded border pl-1.5 pr-5 ${PRIORITY_STYLE[ticket.priority]}`}>
            <PriorityBadge priority={ticket.priority} />
            <select
              value={ticket.priority}
              onChange={(e) => onChangePriority(e.target.value as Priority)}
              aria-label="Priority"
              className="cursor-pointer appearance-none bg-transparent text-[11px] font-medium outline-none"
            >
              {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => (
                <option key={p} value={p} className="text-slate-900">
                  {PRIORITY_LABEL[p]}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-1 size-3" />
          </label>
        </Row>

        <Row label="Assignee">
          <span className="inline-flex items-center gap-1.5">
            <Avatar className="size-4">
              <AvatarFallback className="bg-indigo-600 text-[7px] text-white">TN</AvatarFallback>
            </Avatar>
            Thabo Nkosi (you)
          </span>
        </Row>
        <Row label="Department">IT Support</Row>
        <Row label="Category">{ticket.category}</Row>
      </Section>

      <Section title="SLA">
        <Row label="First response">
          <Badge variant="outline" className="h-5 gap-1 rounded-[4px] border-emerald-300 bg-emerald-50 px-1.5 py-0 text-[10px] text-emerald-700">
            <Check className="size-3" /> Met 48m
          </Badge>
        </Row>
        <Row label="Resolution">
          <SlaChip state={sla.state}>{sla.text}</SlaChip>
        </Row>
      </Section>

      <Section title="REQUESTER">
        <div className="flex items-center gap-2 pt-1">
          <Avatar className="size-8">
            <AvatarFallback className={`${ticket.colour} text-[10px] font-semibold text-white`}>
              {ticket.initials}
            </AvatarFallback>
          </Avatar>
          <div className="leading-tight">
            <div className="text-xs font-semibold">{ticket.requester}</div>
            <div className="text-[11px] text-slate-500">{ticket.requesterInfo}</div>
          </div>
        </div>
        <p className="mt-1.5 text-[11px] font-medium text-indigo-600">3 other requests</p>
      </Section>

      <Section title="TAGS">
        <div className="flex flex-wrap gap-1 pt-1">
          {ticket.tags.map((tag) => (
            <span key={tag} className="rounded border bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-700">
              {tag}
            </span>
          ))}
          <span className="rounded border border-dashed px-1.5 py-0.5 text-[10px] text-slate-400">+ Add</span>
        </div>
      </Section>

      {ticket.related && (
        <Section title="RELATED">
          <div className="mt-1 flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-[11px]">
            <span className="font-mono text-slate-400">{ticket.related.id}</span>
            <span className="flex-1 truncate">{ticket.related.title}</span>
            <Badge className="h-4 rounded-full bg-slate-800 px-1.5 py-0 text-[9px] text-white">Closed</Badge>
          </div>
        </Section>
      )}

      <p className="text-[10px] text-slate-400">Created {ticket.created}</p>
    </aside>
  )
}