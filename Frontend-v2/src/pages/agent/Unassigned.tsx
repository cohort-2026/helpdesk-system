import { useState } from "react"
import { useNavigate } from "react-router"
import { CheckCircle2, ChevronDown, Filter, RefreshCw, Search, Zap } from "lucide-react"
import { AgentSidebar } from "#components/AgentHome/agentsidebar"
import { PriorityBadge, type Priority } from "#components/AgentHome/prioritybadge"
import { SlaChip, type SlaState } from "#components/AgentHome/sla-chip"
import { Avatar, AvatarFallback } from "#components/ui/avatar"
import { Badge } from "#components/ui/badge"
import { Button } from "#components/ui/button"
import { Card } from "#components/ui/card"
import { Checkbox } from "#components/ui/checkbox"
import { Input } from "#components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#components/ui/table"

/* ------------------------------------------------------------------
   FAKE DATA. Later, replace this with real tickets from your API.
   Keep them sorted: breached first, then due soon, then the rest.
------------------------------------------------------------------ */

type Ticket = {
  id: string
  title: string
  requester: string
  initials: string
  avatarColour: string
  category: string
  priority: Priority
  sla: SlaState
  slaText: string
  age: string
}

const INITIAL_TICKETS: Ticket[] = [
  { id: "HD-1050", title: "Laptop screen cracked after a fall", requester: "Kagiso Molefe", initials: "KM", avatarColour: "bg-orange-500", category: "Hardware", priority: "high", sla: "breached", slaText: "Breached 10m", age: "2h 10m" },
  { id: "HD-1049", title: "Finance shared drive access (approved)", requester: "Pieter Botha", initials: "PB", avatarColour: "bg-blue-600", category: "Access request", priority: "medium", sla: "soon", slaText: "Due in 35m", age: "3h 25m" },
  { id: "HD-1046", title: "New starter: laptop & accounts for Sizwe Ndlovu", requester: "Nomvula Sithole", initials: "NS", avatarColour: "bg-indigo-600", category: "New hardware", priority: "medium", sla: "due", slaText: "Due 17:00", age: "1h 40m" },
  { id: "HD-1044", title: "3rd floor printer in Rosebank keeps jamming", requester: "Zanele Khumalo", initials: "ZK", avatarColour: "bg-fuchsia-600", category: "Printers", priority: "medium", sla: "due", slaText: "Due 17:45", age: "55m" },
  { id: "HD-1043", title: "Teams camera not working in Boardroom 2", requester: "Fatima Ismail", initials: "FI", avatarColour: "bg-teal-600", category: "Meeting rooms", priority: "medium", sla: "due", slaText: "Due 18:20", age: "20m" },
  { id: "HD-1035", title: "Wi-Fi drops in the Durban office canteen", requester: "Ayesha Patel", initials: "AP", avatarColour: "bg-pink-600", category: "Network & VPN", priority: "medium", sla: "due", slaText: "Due Wed 09:10", age: "5h" },
  { id: "HD-1039", title: "Monitor flickers when laptop is docked", requester: "Zanele Khumalo", initials: "ZK", avatarColour: "bg-fuchsia-600", category: "Hardware", priority: "low", sla: "due", slaText: "Due Thu 10:00", age: "1d" },
  { id: "HD-1038", title: "Excel crashes opening the fleet costing file", requester: "Johan van Wyk", initials: "JW", avatarColour: "bg-orange-500", category: "Software problem", priority: "low", sla: "due", slaText: "Due Thu 14:30", age: "1d" },
]

// The words and colours for the priority label
const PRIORITY_TEXT: Record<Priority, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Normal",
  low: "Low",
}

const PRIORITY_COLOURS: Record<Priority, string> = {
  urgent: "border-red-300 bg-red-50 text-red-700",
  high: "border-orange-300 bg-orange-50 text-orange-700",
  medium: "border-blue-300 bg-blue-50 text-blue-700",
  low: "border-slate-300 bg-slate-50 text-slate-600",
}

// Set this to false when you no longer want the three example boxes
// (Loading / Empty / Error) at the bottom of the page.
const SHOW_STATE_PREVIEWS = true

/* ------------------------------------------------------------------
   SMALL PIECES: used by the page and by the three example boxes
------------------------------------------------------------------ */

function LoadingBars() {
  return (
    <div className="space-y-2.5">
      <div className="h-2.5 w-full animate-pulse rounded bg-slate-200" />
      <div className="h-2.5 w-4/5 animate-pulse rounded bg-slate-200" />
      <div className="h-2.5 w-3/5 animate-pulse rounded bg-slate-200" />
    </div>
  )
}

function EmptyMessage() {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <CheckCircle2 className="size-5 text-emerald-600" />
      <p className="text-xs font-semibold">Queue clear</p>
      <p className="text-[11px] text-slate-500">Nothing unassigned in IT Support.</p>
    </div>
  )
}

function ErrorMessage({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-semibold text-red-700">Couldn't load the queue</p>
      <p className="text-[11px] text-red-600">Check your connection.</p>
      <button
        type="button"
        onClick={onRetry}
        className="pt-1 text-[11px] font-medium text-red-700 hover:underline"
      >
        Try again
      </button>
    </div>
  )
}

// One of the small filter buttons. Look only for now (see note below the code).
function FilterChip({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={`inline-flex h-7 items-center gap-1 rounded-md border px-2.5 text-[11px] ${
        active
          ? "border-indigo-300 bg-indigo-50 text-indigo-700"
          : "bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {label}
      <ChevronDown className="size-3" />
    </button>
  )
}

/* ------------------------------------------------------------------
   THE PAGE
------------------------------------------------------------------ */

export default function Unassigned() {
  const navigate = useNavigate()

  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS)
  const [status, setStatus] = useState<"ready" | "loading" | "error">("ready")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Search by ref or subject
  const shown = tickets.filter((t) =>
    `${t.id} ${t.title}`.toLowerCase().includes(search.trim().toLowerCase())
  )

  // 12 is the pretend total. It goes down each time you claim a ticket.
  const total = 12 - (INITIAL_TICKETS.length - tickets.length)

  const openTicket = (id: string) => navigate(`/agent/tickets/${id}`)

  // Claim a ticket: for now it just removes it from the list.
  // Later, call your API here.
  const claimTicket = (id: string) => {
    setTickets((old) => old.filter((t) => t.id !== id))
    setSelected((old) => {
      const copy = new Set(old)
      copy.delete(id)
      return copy
    })
  }

  // "Claim next" takes the first ticket (the most at risk)
  const claimNext = () => {
    if (tickets[0]) claimTicket(tickets[0].id)
  }

  // Pretend to reload. Later, fetch from your API here. If it fails,
  // call setStatus("error") to show the red box.
  const refresh = () => {
    setStatus("loading")
    setTimeout(() => {
      setTickets(INITIAL_TICKETS)
      setSelected(new Set())
      setStatus("ready")
    }, 700)
  }

  const toggleOne = (id: string, checked: boolean) => {
    setSelected((old) => {
      const copy = new Set(old)
      if (checked) copy.add(id)
      else copy.delete(id)
      return copy
    })
  }

  const allSelected = shown.length > 0 && shown.every((t) => selected.has(t.id))
  const toggleAll = (checked: boolean) => {
    setSelected(checked ? new Set(shown.map((t) => t.id)) : new Set())
  }

  return (
    <div className="flex min-h-screen bg-white text-slate-900">
      <AgentSidebar activePath="/agent/ticket-queue" />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* ---------- Top bar ---------- */}
        <header className="flex items-center gap-2 border-b px-6 py-4">
          <div className="flex-1">
            <h1 className="text-[15px] font-semibold leading-tight">Unassigned</h1>
            <p className="text-xs text-slate-500">
              {total} tickets in IT Support · sorted by SLA due, most at risk first
            </p>
          </div>
          <Button
            variant="outline"
            onClick={refresh}
            className="h-7 gap-1.5 rounded-md px-3 text-xs"
          >
            <RefreshCw className="size-3" />
            Refresh
          </Button>
          <Button
            onClick={claimNext}
            className="h-7 gap-1.5 rounded-md bg-indigo-600 px-3 text-xs text-white hover:bg-indigo-700"
          >
            <Zap className="size-3" />
            Claim next
          </Button>
        </header>

        {/* ---------- Filter row ---------- */}
        <div className="flex flex-wrap items-center gap-2 border-b px-6 py-2.5">
          <Filter className="size-3.5 text-slate-400" />
          <FilterChip label="Priority: Any" />
          <FilterChip label="Category: Any" />
          <FilterChip label="SLA: Breached or due soon" active />
          <FilterChip label="Office: Any" />
          <span className="text-[11px] text-slate-400">
            + Save as view (stretch: N1)
          </span>

          <div className="relative ml-auto w-56">
            <Search className="absolute left-2.5 top-2 size-3.5 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subject or ref"
              className="h-7 pl-8 text-[11px]"
            />
          </div>
        </div>

        <main className="flex flex-col gap-3 p-6">
          {/* ---------- The table (or loading / empty / error) ---------- */}
          <Card className="gap-0 overflow-hidden rounded-lg py-0 shadow-none">
            {status === "loading" && (
              <div className="p-6">
                <LoadingBars />
              </div>
            )}

            {status === "error" && (
              <div className="p-6">
                <ErrorMessage onRetry={refresh} />
              </div>
            )}

            {status === "ready" && tickets.length === 0 && (
              <div className="p-10">
                <EmptyMessage />
              </div>
            )}

            {status === "ready" && tickets.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="h-9 w-10 pl-4">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={(c) => toggleAll(c === true)}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead className="h-9 w-[84px] text-[11px] font-medium text-slate-500">Ref</TableHead>
                    <TableHead className="h-9 text-[11px] font-medium text-slate-500">Subject</TableHead>
                    <TableHead className="h-9 w-[120px] text-[11px] font-medium text-slate-500">Category</TableHead>
                    <TableHead className="h-9 w-[100px] text-[11px] font-medium text-slate-500">Priority</TableHead>
                    <TableHead className="h-9 w-[130px] text-[11px] font-medium text-slate-500">SLA</TableHead>
                    <TableHead className="h-9 w-[70px] text-[11px] font-medium text-slate-500">Age</TableHead>
                    <TableHead className="h-9 w-[70px] pr-4" />
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {shown.map((t) => (
                    <TableRow
                      key={t.id}
                      onClick={() => openTicket(t.id)}
                      className="cursor-pointer"
                    >
                      <TableCell
                        className="py-3 pl-4"
                        onClick={(e) => e.stopPropagation()} // ticking a box must not open the ticket
                      >
                        <Checkbox
                          checked={selected.has(t.id)}
                          onCheckedChange={(c) => toggleOne(t.id, c === true)}
                          aria-label={`Select ${t.id}`}
                        />
                      </TableCell>

                      <TableCell className="py-3 pr-0 font-mono text-[11px] text-slate-400">
                        {t.id}
                      </TableCell>

                      <TableCell className="whitespace-normal py-3">
                        <div className="text-xs font-medium leading-tight">{t.title}</div>
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                          <Avatar className="size-4">
                            <AvatarFallback
                              className={`${t.avatarColour} text-[7px] font-semibold text-white`}
                            >
                              {t.initials}
                            </AvatarFallback>
                          </Avatar>
                          {t.requester}
                        </div>
                      </TableCell>

                      <TableCell className="whitespace-normal py-3 text-xs text-slate-700">
                        {t.category}
                      </TableCell>

                      <TableCell className="py-3">
                        <Badge
                          variant="outline"
                          className={`h-5 gap-1 rounded-[4px] px-1.5 py-0 text-[11px] font-medium ${PRIORITY_COLOURS[t.priority]}`}
                        >
                          <PriorityBadge priority={t.priority} />
                          {PRIORITY_TEXT[t.priority]}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3">
                        <SlaChip state={t.sla}>{t.slaText}</SlaChip>
                      </TableCell>

                      <TableCell className="whitespace-normal py-3 text-xs text-slate-600">
                        {t.age}
                      </TableCell>

                      <TableCell className="py-3 pr-4 text-right">
                        <Button
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation() // stops the click from opening the ticket
                            claimTicket(t.id)
                          }}
                          className="h-6 rounded-md bg-indigo-50 px-3 text-[11px] font-medium text-indigo-700 hover:bg-indigo-100"
                        >
                          Claim
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {shown.length === 0 && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={8} className="py-8 text-center text-xs text-slate-500">
                        No tickets match your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </Card>
        
        
          {/* ---------- Example boxes for the three other states ---------- */}
          {SHOW_STATE_PREVIEWS && (
            <div className="mt-2 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border bg-slate-50 p-3">
                <p className="mb-3 text-[10px] font-medium text-slate-500">Loading state</p>
                <LoadingBars />
              </div>

              <div className="rounded-lg border bg-white p-3">
                <p className="mb-3 text-[10px] font-medium text-slate-500">Empty state</p>
                <EmptyMessage />
              </div>

              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="mb-2 text-[10px] font-medium text-red-700">Error state</p>
                <ErrorMessage />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}