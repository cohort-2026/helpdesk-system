// A small coloured label that shows how much time is left on a ticket.
// It is built on the Badge component your colleague made.

import { AlertCircle, Clock, Pause } from "lucide-react"
import { Badge } from "../ui/badge"

export type SlaState = "breached" | "soon" | "due" | "waiting"

const COLOURS: Record<SlaState, string> = {
  breached: "border-red-400 bg-red-50 text-red-700",
  soon: "border-orange-300 bg-amber-50 text-orange-700",
  due: "border-slate-300 bg-white text-slate-800",
  waiting: "border-slate-300 bg-slate-100 text-slate-600",
}

export function SlaChip({
  state,
  children,
}: {
  state: SlaState
  children: React.ReactNode
}) {
  const Icon =
    state === "waiting" ? Pause : state === "breached" ? AlertCircle : Clock

  return (
    <Badge
      variant="outline"
      className={`h-5 gap-1 whitespace-nowrap rounded-[4px] px-1.5 py-0 text-[11px] font-medium ${COLOURS[state]}`}
    >
      <Icon className="size-3" aria-hidden />
      {children}
    </Badge>
  )
}