// Four little bars, like a phone signal icon.
// More coloured bars = more urgent.

export type Priority = "urgent" | "high" | "medium" | "low"

const BARS_FILLED: Record<Priority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
}

const BAR_COLOUR: Record<Priority, string> = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-blue-500",
  low: "bg-slate-400",
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      role="img"
      aria-label={`${priority} priority`}
      title={`${priority} priority`}
      className="inline-flex h-3.5 items-end gap-[2px]"
    >
      {[1, 2, 3, 4].map((bar) => (
        <span
          key={bar}
          style={{ height: `${bar * 25}%` }}
          className={`w-[3px] rounded-[1px] ${
            bar <= BARS_FILLED[priority] ? BAR_COLOUR[priority] : "bg-slate-200"
          }`}
        />
      ))}
    </span>
  )
}