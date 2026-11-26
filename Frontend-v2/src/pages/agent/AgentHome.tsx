import { useCallback, useMemo, useState } from "react"
import { useNavigate, Link } from "react-router"
import { Button } from "#components/ui/button"
import { Card, CardContent } from "#components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "#components/ui/table"
import { AgentSidebar } from "#components/AgentHome/agentsidebar"
import { PriorityBadge, type Priority } from "#components/AgentHome/prioritybadge"
import { SlaChip, type SlaState } from "#components/AgentHome/sla-chip"
import { useAuth } from "#context/AuthContext"
import { useTickets } from "#hooks/useTickets"
import type { Ticket as ApiTicket } from "#types/ticket.types"

/* ------------------------------------------------------------------
   HELPERS — map API data to the shapes the UI components expect
------------------------------------------------------------------ */

/** Map the API's TicketPriority → the PriorityBadge Priority type */
function toPriority(p: string): Priority {
  switch (p) {
    case "High":   return "high"
    case "Medium": return "medium"
    case "Low":    return "low"
    default:       return "medium"
  }
}

/** Derive a simple SlaState from a ticket's status and created_at age */
function toSlaState(ticket: ApiTicket): { state: SlaState; text: string } {
  if (
    ticket.ticket_status === "Pending approval" ||
    ticket.ticket_status === "In progress"
  ) {
    return { state: "waiting", text: "Waiting" }
  }
  const ageMs = Date.now() - new Date(ticket.created_at).getTime()
  const ageH  = ageMs / 3_600_000
  if (ageH > 24) return { state: "breached", text: `Breached ${Math.floor(ageH)}h` }
  if (ageH > 20) return { state: "soon",     text: `Due in ${Math.round((24 - ageH) * 60)}m` }
  return { state: "due", text: `${Math.floor(ageH)}h old` }
}

/** Build the subtitle line shown under the ticket title */
function ticketInfo(ticket: ApiTicket): string {
  const parts: string[] = []
  if (ticket.requester_name)   parts.push(ticket.requester_name)
  if (ticket.category_name)    parts.push(ticket.category_name)
  return parts.join(" · ") || "—"
}

/** Format a relative age string from a date string */
function ageText(dateStr: string): string {
  const diffMs   = Date.now() - new Date(dateStr).getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  if (diffMins < 60)  return `${diffMins}m`
  const diffH = Math.floor(diffMins / 60)
  if (diffH < 24)     return `${diffH}h`
  return `${Math.floor(diffH / 24)}d`
}

/* ------------------------------------------------------------------
   THE PAGE
------------------------------------------------------------------ */

export default function AgentHome() {
  const { user } = useAuth()
  const [claimingId, setClaimingId] = useState<number | null>(null)
  const navigate = useNavigate()

  const userId       = user?.id || user?.user_id || ""
  const departmentId = user?.department_id ?? undefined
  const firstName    = user?.name?.split(" ")[0] ?? "Agent"
  const department   = "IT Support" // could be extended from user context later

  /* ---- Fetch my assigned active tickets ---- */
  const {
    tickets: myTickets,
    loading: myLoading,
    refetch: refetchMy,
  } = useTickets({
    filters: { assignee_id: userId ? String(userId) : undefined, limit: 100 },
    autoFetch: !!userId,
  })

  /* ---- Fetch open dept tickets (includes unassigned queue) ---- */
  const {
    tickets: deptTickets,
    loading: deptLoading,
    claimTicket,
    refetch: refetchDept,
  } = useTickets({
    filters: {
      status: "Open",
      department_id: departmentId ? Number(departmentId) : undefined,
      limit: 100,
    },
    autoFetch: true,
  })

  /* ---- Derived ticket lists ---- */
  const activeMyTickets = useMemo(
    () => myTickets.filter(
      (t) =>
        t.ticket_status !== "Resolved" &&
        t.ticket_status !== "Closed" &&
        t.ticket_status !== "Cancelled",
    ),
    [myTickets],
  )

  const resolvedByMe = useMemo(
    () => myTickets.filter(
      (t) => t.ticket_status === "Resolved" || t.ticket_status === "Closed",
    ),
    [myTickets],
  )

  const unassigned = useMemo(
    () => deptTickets.filter((t) => !t.assignee_id),
    [deptTickets],
  )

  /* ---- KPI numbers derived from real data ---- */
  const waitingOnEmployee = useMemo(
    () => activeMyTickets.filter((t) => t.ticket_status === "Pending approval"),
    [activeMyTickets],
  )

  const breachedTickets = useMemo(
    () =>
      activeMyTickets.filter((t) => {
        const ageH = (Date.now() - new Date(t.created_at).getTime()) / 3_600_000
        return ageH > 24
      }),
    [activeMyTickets],
  )

  const dueTodayTickets = useMemo(() => {
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)
    // Simple heuristic: tickets older than 20h and not yet breached
    return activeMyTickets.filter((t) => {
      const ageH = (Date.now() - new Date(t.created_at).getTime()) / 3_600_000
      return ageH >= 20 && ageH <= 24
    })
  }, [activeMyTickets])

  const kpiBoxes = useMemo(
    () => [
      {
        label: "My open",
        value: String(activeMyTickets.length),
        note:  `${dueTodayTickets.length} due today`,
        look:  "normal" as const,
      },
      {
        label: "Waiting on employee",
        value: String(waitingOnEmployee.length),
        note:  waitingOnEmployee.length > 0 ? "pending approval" : "all clear",
        look:  "normal" as const,
      },
      {
        label: "Due today",
        value: String(dueTodayTickets.length),
        note:  dueTodayTickets.length > 0 ? "action needed" : "none today",
        look:  dueTodayTickets.length > 0 ? ("warning" as const) : ("normal" as const),
      },
      {
        label: "Breached",
        value: String(breachedTickets.length),
        note:
          breachedTickets.length > 0
            ? `HD-${breachedTickets[0].ticket_id} · ${breachedTickets[0].title.slice(0, 20)}…`
            : "none",
        look: breachedTickets.length > 0 ? ("danger" as const) : ("normal" as const),
      },
    ],
    [activeMyTickets, waitingOnEmployee, dueTodayTickets, breachedTickets],
  )

  /* ---- Claim handler ---- */
  const handleClaim = useCallback(
    async (ticketId: number) => {
      setClaimingId(ticketId)
      try {
        await claimTicket(ticketId)
        refetchMy()
      } catch (err: unknown) {
        const error = err as Error & { statusCode?: number }
        if (error.statusCode === 409) refetchDept()
      } finally {
        setClaimingId(null)
      }
    },
    [claimTicket, refetchMy, refetchDept],
  )

  /* ---- Greeting & date ---- */
  const now     = new Date()
  const hour    = now.getHours()
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
  const dateText = `${now.toLocaleDateString("en-GB", { weekday: "long" })} ${now.getDate()} ${now.toLocaleDateString("en-GB", { month: "long" })}`

  /* ---- Colour map for KPI boxes ---- */
  const BOX_COLOURS = {
    normal:  { box: "bg-white",                    label: "text-slate-600", value: "text-slate-900" },
    warning: { box: "border-amber-200 bg-amber-50", label: "text-amber-800", value: "text-amber-900" },
    danger:  { box: "border-red-200 bg-red-50",    label: "text-red-700",   value: "text-red-800"  },
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white text-slate-900">
      <AgentSidebar
        activePath="/agent"
        myOpenCount={activeMyTickets.length}
        unassignedCount={unassigned.length}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* ---------- Top bar ---------- */}
        <header className="flex items-center gap-2 border-b-2 px-6 py-4">
          <div className="flex-1">
            <h1 className="text-[15px] font-semibold leading-tight">
              {greeting}, {firstName}
            </h1>
            <p className="text-xs text-slate-500">
              {dateText} · {department}
            </p>
          </div>
          <kbd className="rounded border bg-white px-1.5 text-[10px] text-slate-500">
            C
          </kbd>
        </header>

        <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
          {/* ---------- KPI boxes ---------- */}
          <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {kpiBoxes.map((box) => {
              const c = BOX_COLOURS[box.look]
              return (
                <Card key={box.label} className={`gap-0 rounded-lg py-0 shadow-none ${c.box}`}>
                  <CardContent className="px-4 py-3">
                    <p className={`text-[11px] ${c.label}`}>{box.label}</p>
                    <p className={`mt-1 text-[28px] font-semibold leading-none ${c.value}`}>
                      {box.value}
                    </p>
                    <p className="mt-1.5 text-[11px] text-slate-500">{box.note}</p>
                  </CardContent>
                </Card>
              )
            })}
          </section>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">

            {/* ---------- My tickets, due soonest ---------- */}
            <Card className="gap-0 self-start rounded-lg py-0 shadow-none">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h2 className="text-xs font-semibold">My tickets, due soonest</h2>
                <Link
                  to="/agent/open"
                  className="text-[11px] font-medium text-indigo-600 hover:underline"
                >
                  Open inbox →
                </Link>
              </div>
              <CardContent className="p-0">
                {myLoading ? (
                  <div className="space-y-2.5 p-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-2.5 animate-pulse rounded bg-slate-200" />
                    ))}
                  </div>
                ) : activeMyTickets.length === 0 ? (
                  <p className="p-6 text-center text-xs text-slate-400">
                    No active tickets assigned to you.
                  </p>
                ) : (
                  <Table>
                    <TableBody>
                      {activeMyTickets.map((t: ApiTicket) => {
                        const sla = toSlaState(t)
                        return (
                          <TableRow
                            key={t.ticket_id}
                            onClick={() => navigate(`/agent/tickets/${t.ticket_id}`)}
                            className="cursor-pointer"
                          >
                            <TableCell className="w-[76px] py-3 pl-4 pr-0 font-mono text-[11px] text-slate-400">
                              HD-{t.ticket_id}
                            </TableCell>
                            <TableCell className="w-8 px-2 py-3">
                              <PriorityBadge priority={toPriority(t.ticket_priority)} />
                            </TableCell>
                            <TableCell className="whitespace-normal py-3 pl-1">
                              <div className="text-xs font-medium leading-tight">
                                {t.title}
                              </div>
                              <div className="mt-0.5 text-[11px] text-slate-500">
                                {ticketInfo(t)}
                              </div>
                            </TableCell>
                            <TableCell className="py-3 pr-4 text-right">
                              <SlaChip state={sla.state}>{sla.text}</SlaChip>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-4">
              {/* ---------- Next in queue ---------- */}
              <Card className="gap-0 rounded-lg py-0 shadow-none">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <h2 className="text-xs font-semibold">Next in queue</h2>
                  <span className="text-[11px] text-slate-500">
                    {deptLoading ? "…" : `${unassigned.length} unassigned`}
                  </span>
                </div>
                <CardContent className="divide-y p-0">
                  {deptLoading ? (
                    <div className="space-y-2.5 p-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-2.5 animate-pulse rounded bg-slate-200" />
                      ))}
                    </div>
                  ) : unassigned.length === 0 ? (
                    <p className="p-4 text-center text-xs text-slate-400">
                      Queue is clear — no unassigned tickets.
                    </p>
                  ) : (
                    unassigned.slice(0, 5).map((t: ApiTicket) => {
                      const sla = toSlaState(t)
                      return (
                        <div
                          key={t.ticket_id}
                          onClick={() => navigate(`/agent/tickets/${t.ticket_id}`)}
                          className="cursor-pointer px-4 py-2.5 hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-slate-400">
                              HD-{t.ticket_id}
                            </span>
                            <PriorityBadge priority={toPriority(t.ticket_priority)} />
                            <span className="flex-1" />
                            <SlaChip state={sla.state}>{sla.text}</SlaChip>
                          </div>
                          <div className="mt-1 flex items-end justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-xs font-medium leading-tight">
                                {t.title}
                              </div>
                              <div className="mt-0.5 text-[11px] text-slate-500">
                                {ticketInfo(t)}
                              </div>
                            </div>
                            <Button
                              variant="secondary"
                              disabled={claimingId === t.ticket_id}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleClaim(t.ticket_id)
                              }}
                              className="h-6 shrink-0 rounded-md bg-indigo-50 px-3 text-[11px] font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                            >
                              {claimingId === t.ticket_id ? (
                                <span className="animate-spin h-3 w-3 border-2 border-indigo-600 border-t-transparent rounded-full" />
                              ) : (
                                "Claim"
                              )}
                            </Button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </CardContent>
              </Card>

              {/* ---------- My last 7 days ---------- */}
              <Card className="gap-0 rounded-lg bg-slate-50 py-0 shadow-none">
                <CardContent className="px-4 py-3">
                  <h2 className="text-xs font-semibold">My last 7 days</h2>
                  <div className="mt-3 grid grid-cols-3 text-center">
                    {[
                      { value: String(resolvedByMe.length), label: "Resolved" },
                      { value: "—",                         label: "Avg first reply" },
                      { value: "—",                         label: "CSAT" },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <div className="text-base font-semibold">{stat.value}</div>
                        <div className="text-[11px] text-slate-500">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}