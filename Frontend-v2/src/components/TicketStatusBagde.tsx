import { cn } from "#lib/utils";
import { Badge } from "./ui/badge";

const STATUSES = {
  new: { label: "New", step: 0, badge: "border-slate-200 bg-slate-50 text-slate-700", dot: "bg-slate-500" },
  pending_approval: { label: "Pending approval", step: 0, badge: "border-violet-200 bg-violet-50 text-violet-700", dot: "bg-violet-500" },
  assigned: { label: "Assigned", step: 1, badge: "border-sky-200 bg-sky-50 text-sky-700", dot: "bg-sky-500" },
  open: { label: "Open", step: 2, badge: "border-indigo-200 bg-indigo-50 text-indigo-700", dot: "bg-indigo-500" },
  waiting_on_you: { label: "Waiting on you", step: 2, badge: "border-amber-200 bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  resolved: { label: "Resolved", step: 3, badge: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  closed: { label: "Closed", step: 4, badge: "border-slate-200 bg-slate-100 text-slate-600", dot: "bg-slate-400" },
  cancelled: { label: "Cancelled", step: -1, badge: "border-slate-200 bg-slate-100 text-slate-500", dot: "bg-slate-400" },
};

function TicketStatusBadge({ status }) {
  const s = STATUSES[status];
  return (
    <Badge variant="outline" className={cn("gap-1.5 rounded-full px-2 py-0 text-[10px] font-medium", s.badge)}>
      <span className={cn("size-1.5 rounded-full", s.dot)} />
      {s.label}
    </Badge>
  );
}

export default TicketStatusBadge