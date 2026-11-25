import { useCallback, useState } from "react"
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
import { useAuth } from "#context/AuthContext"
import { useTickets } from "#hooks/useTickets"
import type { Ticket as ApiTicket } from "#types/ticket.types"

/* ------------------------------------------------------------------
   HELPERS
------------------------------------------------------------------ */

/** Map API TicketPriority → PriorityBadge Priority */
function toPriority(p: string): Priority {
  switch (p) {
    case "High":   return "high"
    case "Medium": return "medium"
    case "Low":    return "low"
    default:       return "medium"
  }
}

/** Derive SlaState + text from ticket age */
function toSla(ticket: ApiTicket): { state: SlaState; text: string } {
  const ageMs = Date.now() - new Date(ticket.created_at).getTime()
  const ageH  = ageMs / 3_600_000
  if (ageH > 24)  return { state: "breached", text: `Breached ${Math.floor(ageH - 24)}h` }
  if (ageH > 20)  return { state: "soon",     text: `Due in ${Math.round((24 - ageH) * 60)}m` }
  return { state: "due", text: `Due in ${Math.round((24 - ageH) * 60)}m` }
}

/** Relative age string */
function ageText(dateStr: string): string {
  const diffMs   = Date.now() - new Date(dateStr).getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  if (diffMins < 60)  return `${diffMins}m`
  const diffH = Math.floor(diffMins / 60)
  if (diffH < 24)     return `${diffH}h`
  return `${Math.floor(diffH / 24)}d`
}

/** Build initials from a full name */
function initials(name?: string | null): string {
  if (!name) return "?"
  return name
    .split(" ")
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("")
}

/** Deterministic avatar colour based on name */
const AVATAR_COLOURS = [
  "bg-orange-500", "bg-blue-600", "bg-indigo-600",
  "bg-fuchsia-600", "bg-teal-600", "bg-pink-600", "bg-green-600",
]
function avatarColour(name?: string | null): string {
  if (!name) return "bg-slate-400"
  const idx = name.charCodeAt(0) % AVATAR_COLOURS.length
  return AVATAR_COLOURS[idx]
}

/* ------------------------------------------------------------------
   Priority text + colour mappings
------------------------------------------------------------------ */
const PRIORITY_TEXT: Record<Priority, string> = {
  urgent: "Urgent",
  high:   "High",
  medium: "Normal",
  low:    "Low",
}

const PRIORITY_COLOURS: Record<Priority, string> = {
  urgent: "border-red-300 bg-red-50 text-red-700",
  high:   "border-orange-300 bg-orange-50 text-orange-700",
  medium: "border-blue-300 bg-blue-50 text-blue-700",
  low:    "border-slate-300 bg-slate-50 text-slate-600",
}

/* ------------------------------------------------------------------
   SMALL PIECES
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

function EmptyMessage({ dept }: { dept?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <CheckCircle2 className="size-5 text-emerald-600" />
      <p className="text-xs font-semibold">Queue clear</p>
      <p className="text-[11px] text-slate-500">
        Nothing unassigned{dept ? ` in ${dept}` : ""}.
      </p>
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
  const { user } = useAuth()

  const departmentId = user?.department_id ?? undefined

  const [search,   setSearch]   = useState("")
  const [selected, setSelected] = useState<Set<number>>(new Set())

  /* Fetch open dept tickets */
  const { tickets: allDeptTickets, loading, error, claimTicket, refetch } = useTickets({
    filters: {
      status: "Open",
      department_id: departmentId ? Number(departmentId) : undefined,
      limit: 100,
    },
    autoFetch: true,
  })

  /* Only truly unassigned ones */
  const unassigned = allDeptTickets.filter((t) => !t.assignee_id)

  /* Client-side search */
  const shown = unassigned.filter((t) =>
    `HD-${t.ticket_id} ${t.title}`.toLowerCase().includes(search.trim().toLowerCase()),
  )

  /* Claim a single ticket */
  const [claimingId, setClaimingId] = useState<number | null>(null)

  const handleClaim = useCallback(
    async (ticketId: number) => {
      setClaimingId(ticketId)
      setSelected((old) => { const c = new Set(old); c.delete(ticketId); return c })
      try {
        await claimTicket(ticketId)
      } catch (err: unknown) {
        const e = err as Error & { statusCode?: number }
        // If 409 (race condition) just refresh; ticket already gone
        if (e.statusCode === 409) refetch()
      } finally {
        setClaimingId(null)
      }
    },
    [claimTicket, refetch],
  )

  /* "Claim next" — takes the first (most at-risk) ticket */
  const claimNext = () => {
    if (shown[0]) handleClaim(shown[0].ticket_id)
  }

  /* Selection helpers */
  const toggleOne = (id: number, checked: boolean) =>
    setSelected((old) => {
      const copy = new Set(old)
      if (checked) copy.add(id)
      else copy.delete(id)
      return copy
    })

  const allSelected = shown.length > 0 && shown.every((t) => selected.has(t.ticket_id))
  const toggleAll   = (checked: boolean) =>
    setSelected(checked ? new Set(shown.map((t) => t.ticket_id)) : new Set())

  /* Status derived from hook */
  type Status = "ready" | "loading" | "error"
  const status: Status = loading ? "loading" : error ? "error" : "ready"

  return (
    <div className="flex h-screen overflow-hidden bg-white text-slate-900">
      <AgentSidebar
        activePath="/agent/ticket-queue"
        unassignedCount={unassigned.length}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* ---------- Top bar ---------- */}
        <header className="flex items-center gap-2 border-b px-6 py-4">
          <div className="flex-1">
            <h1 className="text-[15px] font-semibold leading-tight">Unassigned</h1>
            <p className="text-xs text-slate-500">
              {loading
                ? "Loading…"
                : `${unassigned.length} ticket${unassigned.length !== 1 ? "s" : ""} · sorted by age, most at risk first`}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={loading}
            className="h-7 gap-1.5 rounded-md px-3 text-xs"
          >
            <RefreshCw className={`size-3 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={claimNext}
            disabled={loading || shown.length === 0}
            className="h-7 gap-1.5 rounded-md bg-indigo-600 px-3 text-xs text-white hover:bg-indigo-700 disabled:opacity-50"
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

        <main className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-6">
          {/* ---------- Table / Loading / Empty / Error ---------- */}
          <Card className="gap-0 overflow-hidden rounded-lg py-0 shadow-none">
            {status === "loading" && (
              <div className="p-6">
                <LoadingBars />
              </div>
            )}

            {status === "error" && (
              <div className="p-6">
                <ErrorMessage onRetry={() => refetch()} />
              </div>
            )}

            {status === "ready" && unassigned.length === 0 && (
              <div className="p-10">
                <EmptyMessage />
              </div>
            )}

            {status === "ready" && unassigned.length > 0 && (
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
                  {shown.map((t: ApiTicket) => {
                    const sla  = toSla(t)
                    const pri  = toPriority(t.ticket_priority)
                    const isClaiming = claimingId === t.ticket_id
                    return (
                      <TableRow
                        key={t.ticket_id}
                        onClick={() => navigate(`/agent/tickets/${t.ticket_id}`)}
                        className="cursor-pointer"
                      >
                        <TableCell
                          className="py-3 pl-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={selected.has(t.ticket_id)}
                            onCheckedChange={(c) => toggleOne(t.ticket_id, c === true)}
                            aria-label={`Select HD-${t.ticket_id}`}
                          />
                        </TableCell>

                        <TableCell className="py-3 pr-0 font-mono text-[11px] text-slate-400">
                          HD-{t.ticket_id}
                        </TableCell>

                        <TableCell className="whitespace-normal py-3">
                          <div className="text-xs font-medium leading-tight">{t.title}</div>
                          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                            <Avatar className="size-4">
                              <AvatarFallback
                                className={`${avatarColour(t.requester_name)} text-[7px] font-semibold text-white`}
                              >
                                {initials(t.requester_name)}
                              </AvatarFallback>
                            </Avatar>
                            {t.requester_name ?? "Unknown"}
                          </div>
                        </TableCell>

                        <TableCell className="whitespace-normal py-3 text-xs text-slate-700">
                          {t.category_name ?? t.request_type_name ?? "—"}
                        </TableCell>

                        <TableCell className="py-3">
                          <Badge
                            variant="outline"
                            className={`h-5 gap-1 rounded-[4px] px-1.5 py-0 text-[11px] font-medium ${PRIORITY_COLOURS[pri]}`}
                          >
                            <PriorityBadge priority={pri} />
                            {PRIORITY_TEXT[pri]}
                          </Badge>
                        </TableCell>

                        <TableCell className="py-3">
                          <SlaChip state={sla.state}>{sla.text}</SlaChip>
                        </TableCell>

                        <TableCell className="whitespace-normal py-3 text-xs text-slate-600">
                          {ageText(t.created_at)}
                        </TableCell>

                        <TableCell className="py-3 pr-4 text-right">
                          <Button
                            variant="secondary"
                            disabled={isClaiming}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleClaim(t.ticket_id)
                            }}
                            className="h-6 rounded-md bg-indigo-50 px-3 text-[11px] font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                          >
                            {isClaiming ? (
                              <span className="animate-spin h-3 w-3 border-2 border-indigo-600 border-t-transparent rounded-full" />
                            ) : (
                              "Claim"
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}

                  {shown.length === 0 && unassigned.length > 0 && (
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
        </main>
      </div>
    </div>
  )
}