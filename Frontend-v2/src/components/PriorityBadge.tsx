import { cn } from "#lib/utils";
import PriorityBars from "./PriorityBars";

export const PRIORITIES = {
  low: { label: "Low", level: 1, badge: "border-slate-200 bg-slate-50 text-slate-600" },
  normal: { label: "Normal", level: 2, badge: "border-sky-200 bg-sky-50 text-sky-700" },
  high: { label: "High", level: 3, badge: "border-orange-200 bg-orange-50 text-orange-700" },
  urgent: { label: "Urgent", level: 4, badge: "border-red-200 bg-red-50 text-red-700" },
};

type PriorityConfig = (typeof PRIORITIES)[keyof typeof PRIORITIES];

function getPriorityConfig(priority: string): PriorityConfig {
  switch (priority.trim().toLowerCase()) {
    case "low":
      return PRIORITIES.low;
    case "medium":
      return { ...PRIORITIES.normal, label: "Medium" };
    case "normal":
      return PRIORITIES.normal;
    case "high":
      return PRIORITIES.high;
    case "urgent":
      return PRIORITIES.urgent;
    default:
      throw new Error(`Unsupported priority: ${priority}`);
  }
}

function PriorityBadge({ priority }: { priority: string }) {
  const p = getPriorityConfig(priority);
  return (
    <div className={cn("flex gap-1.5 px-1.5 py-0.5 text-[10px] font-medium", p.badge)}>
      <PriorityBars level={p.level} />
      {p.label}
    </div>
  );
}

export default PriorityBadge