import { cn } from "#lib/utils";

const TONES = { amber: "text-amber-700", indigo: "text-indigo-700", emerald: "text-emerald-700" };

function Parts({ parts }) {
  return parts.map((p, i) =>
    typeof p === "string" ? (
      <span key={i}>{p}</span>
    ) : (
      <strong key={i} className={cn("font-semibold", TONES[p.tone] ?? "text-slate-700")}>
        {p.b}
      </strong>
    )
  );
}

export default Parts