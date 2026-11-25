import ReplyCard from "./ReplyCard";
import Parts from "./Parts";

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
        if (item.kind === "reply") {
          return <ReplyCard key={item.id} item={item} time={time} />;
        }
        if (item.kind === "event") {
          return (
            <div key={item.id} className="flex items-center gap-2 px-1 text-[11px] text-slate-500">
              <span className="size-1.5 rounded-full bg-slate-300" />
              <span className="flex-1">
                {item.parts ? <Parts parts={item.parts} /> : item.text}
              </span>
              <span>{time}</span>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

export default Timeline