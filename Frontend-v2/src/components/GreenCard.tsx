import { Card, CardContent } from "#components/ui/card";


function GreenCard({ title, children }) {
  return (
    <Card className="gap-0 rounded-xl border-emerald-200 bg-emerald-50 py-0 shadow-none">
      <CardContent className="p-4">
        <h2 className="text-xs font-semibold text-emerald-900">{title}</h2>
        <div className="mt-1 text-[11px] leading-snug text-emerald-800">{children}</div>
      </CardContent>
    </Card>
  );
}

export default GreenCard