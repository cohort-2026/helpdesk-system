import { Card, CardContent } from "#components/ui/card";
import { cn } from "#lib/utils";

function StatCard({ label, value, note, danger }) {
  return (
    <Card
      className={cn(
        "gap-0 rounded-xl py-0 shadow-none",
        danger && "border-red-200 bg-red-50"
      )}
    >
      <CardContent className="p-4">
        <p className="text-[11px] text-slate-500">{label}</p>
        <p
          className={cn(
            "mt-1 text-3xl font-semibold tracking-tight",
            danger ? "text-red-600" : "text-slate-900"
          )}
        >
          {value}
        </p>
        <p className="mt-1 text-[10px] text-slate-500">{note}</p>
      </CardContent>
    </Card>
  );
}

export default StatCard