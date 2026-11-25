import { cn } from "#lib/utils";


function PriorityBars({ level }) {
  return (
    <span className="flex items-end gap-[1.5px]" aria-hidden="true">
      {[4, 6, 8, 10].map((h, i) => (
        <span
          key={h}
          style={{ height: h }}
          className={cn("w-[2.5px] rounded-[1px] bg-current", i >= level && "opacity-25")}
        />
      ))}
    </span>
  );
}

export default PriorityBars