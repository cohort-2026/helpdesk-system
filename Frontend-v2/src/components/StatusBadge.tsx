import { cn } from "#lib/utils";
import { Badge } from "./ui/badge";


function StatusBadge({ status }) {
  const active = status === "active";
  return (
    <Badge
      variant="outline"
      className={cn(
        "px-1.5 py-0 text-[10px] font-medium",
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-100 text-slate-500"
      )}
    >
      {active ? "Active" : "Inactive"}
    </Badge>
  );
}

export default StatusBadge