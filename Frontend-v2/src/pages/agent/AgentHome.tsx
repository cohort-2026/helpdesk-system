import { useEffect } from "react"
import { useNavigate, Link} from "react-router"
import { Zap } from "lucide-react"
import { Button } from "#components/ui/button"
import { Card, CardContent } from "#components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "#components/ui/table"
import { AgentSidebar } from "#components/AgentHome/agentsidebar"
import { PriorityBadge, type Priority } from "#components/AgentHome/prioritybadge"
import { SlaChip, type SlaState } from "#components/AgentHome/sla-chip"

/* ------------------------------------------------------------------
   FAKE DATA. Later, replace these with real data from your API.
------------------------------------------------------------------ */

type Ticket = {
  id: string
  title: string
  info: string
  priority: Priority
  sla: SlaState
  slaText: string
}

const MY_TICKETS: Ticket[] = [
  { id: "HD-1045", title: "Can't log in to Sage after password change", info: "Johan van Wyk · Passwords", priority: "urgent", sla: "breached", slaText: "Breached 25m" },
  { id: "HD-1048", title: "VPN drops every 10 minutes on home fibre", info: "Lerato Mokoena · Network & VPN", priority: "high", sla: "soon", slaText: "Due in 1h 54m" },
  { id: "HD-1036", title: "Power BI Pro licence (approved)", info: "Ayesha Patel · Software purchase", priority: "medium", sla: "due", slaText: "Due 17:30" },
  { id: "HD-1041", title: "Outlook not syncing on my iPhone", info: "Lerato Mokoena · Email & phone", priority: "medium", sla: "waiting", slaText: "Waiting" },
  { id: "HD-1031", title: "Dock not detecting second screen", info: "Pieter Botha · Hardware", priority: "low", sla: "due", slaText: "Due Thu 09:00" },
]

const QUEUE: Ticket[] = [
  { id: "HD-1050", title: "Laptop screen cracked after a fall", info: "Kagiso Molefe", priority: "high", sla: "breached", slaText: "Breached 10m" },
  { id: "HD-1049", title: "Finance shared drive access (approved)", info: "Pieter Botha", priority: "medium", sla: "soon", slaText: "Due in 35m" },
  { id: "HD-1046", title: "New starter: laptop for Sizwe Ndlovu", info: "Nomvula Sithole", priority: "medium", sla: "due", slaText: "Due 17:00" },
]

// The four boxes at the top. "look" decides the colour of the box.
const KPI_BOXES = [
  { label: "My open", value: "5", note: "2 due today", look: "normal" },
  { label: "Waiting on employee", value: "3", note: "oldest 1 day", look: "normal" },
  { label: "Due today", value: "4", note: "next at 16:14", look: "warning" },
  { label: "Breached", value: "1", note: "HD-1045 · Sage login", look: "danger" },
] as const

const BOX_COLOURS = {
  normal: { box: "bg-white", label: "text-slate-600", value: "text-slate-900" },
  warning: { box: "border-amber-200 bg-amber-50", label: "text-amber-800", value: "text-amber-900" },
  danger: { box: "border-red-200 bg-red-50", label: "text-red-700", value: "text-red-800" },
}

/* ------------------------------------------------------------------
   THE PAGE
------------------------------------------------------------------ */

export default function AgentHome() {
  const navigate = useNavigate()

  // Open a ticket's page
  const openTicket = (id: string) => navigate(`/tickets/${id}`)

  // Claim a ticket. For now it only logs. Later, call your API here.
  const claimTicket = (id: string) => {
    console.log("Claiming", id)
  }

  // "Claim next" takes the first ticket in the queue (the most at risk)
  const claimNext = () => claimTicket(QUEUE[0].id)

  // Pressing the C key does the same as "Claim next" (but not while typing)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el.closest("input, textarea, select")) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key.toLowerCase() === "c") claimNext()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  })

  // Greeting and date at the top
  const now = new Date()
  const hour = now.getHours()
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
  const dateText = `${now.toLocaleDateString("en-GB", { weekday: "long" })} ${now.getDate()} ${now.toLocaleDateString("en-GB", { month: "long" })}`

  return (
    <div className="flex min-h-screen bg-white text-slate-900">
      <AgentSidebar activePath="/agent" />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* ---------- Top bar ---------- */}
        <header className="flex items-center gap-2 border-b-2 px-6 py-4">
          <div className="flex-1">
            <h1 className="text-[15px] font-semibold leading-tight">
              {greeting}, Thabo
            </h1>
            <p className="text-xs text-slate-500">{dateText} · IT Support</p>
          </div>
          <Button
            onClick={claimNext}
            className="h-7 gap-1.5 rounded-md bg-indigo-600 px-3 text-xs text-white hover:bg-indigo-700"
          >
            <Zap className="size-3" />
            Claim next
          </Button>
          <kbd className="rounded border bg-white px-1.5 text-[10px] text-slate-500">
            C
          </kbd>
        </header>

        <main className="flex flex-col gap-4 p-6">
          {/* ---------- Four boxes ---------- */}
          <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {KPI_BOXES.map((box) => {
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
                <Link to="/agent/open" className="text-[11px] font-medium text-indigo-600 hover:underline">
                  Open inbox →
                </Link>
              </div>
              <CardContent className="p-0">
                <Table>
                  <TableBody>
                    {MY_TICKETS.map((t) => (
                      <TableRow
                        key={t.id}
                        onClick={() => openTicket(t.id)}
                        className="cursor-pointer"
                      >
                        <TableCell className="w-[76px] py-3 pl-4 pr-0 font-mono text-[11px] text-slate-400">
                          {t.id}
                        </TableCell>
                        <TableCell className="w-8 px-2 py-3">
                          <PriorityBadge priority={t.priority} />
                        </TableCell>
                        <TableCell className="whitespace-normal py-3 pl-1">
                          <div className="text-xs font-medium leading-tight">{t.title}</div>
                          <div className="mt-0.5 text-[11px] text-slate-500">{t.info}</div>
                        </TableCell>
                        <TableCell className="py-3 pr-4 text-right">
                          <SlaChip state={t.sla}>{t.slaText}</SlaChip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-4">
              {/* ---------- Next in queue ---------- */}
              <Card className="gap-0 rounded-lg py-0 shadow-none">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <h2 className="text-xs font-semibold">Next in queue</h2>
                  <span className="text-[11px] text-slate-500">12 unassigned</span>
                </div>
                <CardContent className="divide-y p-0">
                  {QUEUE.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => openTicket(t.id)}
                      className="cursor-pointer px-4 py-2.5 hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-slate-400">{t.id}</span>
                        <PriorityBadge priority={t.priority} />
                        <span className="flex-1" />
                        <SlaChip state={t.sla}>{t.slaText}</SlaChip>
                      </div>
                      <div className="mt-1 flex items-end justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-medium leading-tight">{t.title}</div>
                          <div className="mt-0.5 text-[11px] text-slate-500">{t.info}</div>
                        </div>
                        <Button
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation() // stops the click from opening the ticket
                            claimTicket(t.id)
                          }}
                          className="h-6 shrink-0 rounded-md bg-indigo-50 px-3 text-[11px] font-medium text-indigo-700 hover:bg-indigo-100"
                        >
                          Claim
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* ---------- My last 7 days ---------- */}
              <Card className="gap-0 rounded-lg bg-slate-50 py-0 shadow-none">
                <CardContent className="px-4 py-3">
                  <h2 className="text-xs font-semibold">My last 7 days</h2>
                  <div className="mt-3 grid grid-cols-3 text-center">
                    {[
                      { value: "14", label: "Resolved" },
                      { value: "38m", label: "Avg first reply" },
                      { value: "96%", label: "CSAT" },
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