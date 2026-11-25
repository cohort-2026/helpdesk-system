import { Card, CardContent } from "#components/ui/card";
import DetailRow from "./DetailRow";
import PriorityBadge from "./PriorityBadge";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pad = (n) => String(n).padStart(2, "0");
const clock = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const dayDiff = (a, b) =>
  Math.round(
    (new Date(a.getFullYear(), a.getMonth(), a.getDate()) -
      new Date(b.getFullYear(), b.getMonth(), b.getDate())) / 86_400_000
  );

const fullStamp = (iso) => {
  const d = new Date(iso);
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}, ${clock(d)}`;
};

function promisedStamp(iso) {
  const d = new Date(iso);
  const diff = dayDiff(d, new Date());
  if (diff === 0) return `Today ${clock(d)}`;
  if (diff === 1) return `Tomorrow ${clock(d)}`;
  return fullStamp(iso);
}

function DetailsCard({ request }) {
  const showNextUpdate =
    request.nextUpdateAt && ["new", "pending_approval", "assigned", "open"].includes(request.status);
  const overdue = showNextUpdate && new Date(request.nextUpdateAt) < new Date();

  return (
    <Card className="gap-0 rounded-xl py-0 shadow-none">
      <CardContent className="p-4">
        <h2 className="text-xs font-semibold">Details</h2>
        <dl className="mt-1 divide-y divide-transparent">
          <DetailRow label="Reference">
            <span className="font-mono">{request.id}</span>
          </DetailRow>
          <DetailRow label="Category">{request.category}</DetailRow>
          <DetailRow label="Team">{request.team}</DetailRow>
          <DetailRow label="Priority">
            <PriorityBadge priority={request.priority} />
          </DetailRow>
          <DetailRow label="Submitted">{fullStamp(request.submittedAt)}</DetailRow>
          {showNextUpdate && (
            <DetailRow label="Next update by">
              <span className={overdue ? "text-red-600" : "text-orange-700"}>
                {promisedStamp(request.nextUpdateAt)}
              </span>
            </DetailRow>
          )}
        </dl>
      </CardContent>
    </Card>
  );
}

export default DetailsCard