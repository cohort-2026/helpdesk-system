import ReplyCard from "./ReplyCard";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const pad = (n) => String(n).padStart(2, "0");
const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const clock = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** "Tue 08:14" on the first item of a day, just "08:14" after that. */
function stamp(iso, prevIso) {
  const d = new Date(iso);
  if (prevIso && dayKey(new Date(prevIso)) === dayKey(d)) return clock(d);
  return `${WEEKDAYS[d.getDay()]} ${clock(d)}`;
}

function Timeline({ items }) {
  const visible = items.filter((i) => i.kind !== "note"); // internal notes never render here
  return (
    <div className="space-y-3">
      {visible.map((item, i) => {
        const time = stamp(item.at, visible[i - 1]?.at);
        return item.kind === "reply" ? (
          <ReplyCard key={item.id} item={item} time={time} />
        ) : null;
      })}
    </div>
  );
}

export default Timeline