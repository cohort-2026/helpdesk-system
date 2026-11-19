import { cn } from "#lib/utils";

type CountProps ={
    value: number,
    danger?: boolean,
}

function Count({ value, danger }: CountProps) {
  return (
    <span
      className={cn(
        "text-xs",
        value === 0 ? "text-slate-400" : danger && "font-semibold text-red-600"
      )}
    >
      {value}
    </span>
  );
}

export default Count