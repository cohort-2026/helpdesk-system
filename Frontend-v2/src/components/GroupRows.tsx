import {
  TableCell,
  TableRow
} from "#components/ui/table";
import { cn } from "#lib/utils";
import PriorityBadge from "#components/PriorityBadge";
import StatusBadge from "#components/StatusBadge";

import {
  LaptopIcon,
  NetworkIcon,
  KeyRoundIcon,
  LockIcon,
  MonitorIcon,
  BanknoteIcon,
  FileTextIcon,
  Building2Icon,
  AppWindowIcon,
} from "lucide-react";
import type { CategoryPriority } from "../services/categoryService";

interface CategoryRow {
  id: string;
  name: string;
  icon: string;
  priority: CategoryPriority;
  needsApproval: boolean;
  fields: unknown[];
  status: string;
}

interface GroupRowsProps {
  group: { name: string; items: CategoryRow[] };
  selected: string | null;
  onSelect: (id: string) => void;
}

export const ICONS = {
  laptop: LaptopIcon,
  network: NetworkIcon,
  key: KeyRoundIcon,
  lock: LockIcon,
  monitor: MonitorIcon,
  payroll: BanknoteIcon,
  letter: FileTextIcon,
  building: Building2Icon,
  software: AppWindowIcon,
  default: AppWindowIcon,
};

function GroupRows({ group, selected, onSelect }: GroupRowsProps) {
  return (
    <>
      <TableRow className="bg-slate-50 hover:bg-slate-50">
        <TableCell colSpan={5} className="px-4 py-1.5 text-[11px] font-medium text-slate-500">
          {group.name}
        </TableCell>
      </TableRow>

      {group.items.map((c) => {
        const Icon = ICONS[c.icon as keyof typeof ICONS] ?? ICONS.default;
        const inactive = c.status === "inactive";
        const isSelected = selected === c.id;
        return (
          <TableRow
            key={c.id}
            tabIndex={0}
            aria-selected={isSelected}
            onClick={() => onSelect(c.id)}
            onKeyDown={(e) => e.key === "Enter" && onSelect(c.id)}
            className={cn(
              "cursor-pointer",
              isSelected && "bg-indigo-50/60 hover:bg-indigo-50/60",
              inactive && "text-slate-400"
            )}
          >
            <TableCell className="px-4 py-3">
              <div className="flex items-center gap-2.5">
                <Icon className="size-3.5 shrink-0 text-slate-400" />
                <span className={cn("text-xs font-semibold", inactive && "text-slate-400")}>
                  {c.name}
                </span>
              </div>
            </TableCell>
            <TableCell className={cn("px-4 py-3", inactive && "opacity-50")}>
              <PriorityBadge priority={c.priority} />
            </TableCell>
            <TableCell className="px-4 py-3">
              {c.needsApproval ? (
                <div
                  className={cn(
                    "px-1.5 py-0 text-[10px] font-medium",
                    inactive
                      ? "border-slate-200 bg-slate-100 text-slate-400"
                      : "border-violet-200 bg-violet-50 text-violet-700"
                  )}
                >
                  Needs approval
                </div>
              ) : (
                <span className="text-xs text-slate-500">No</span>
              )}
            </TableCell>
            <TableCell className="px-4 py-3 text-xs">
              {c.fields.length || "\u2014"}
            </TableCell>
            <TableCell className="px-4 py-3">
              <StatusBadge status={c.status} />
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}

export default GroupRows;