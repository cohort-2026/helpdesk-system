import { useState } from "react";
import { Check, Search, UserRound } from "lucide-react";
import { Avatar, AvatarFallback } from "#components/ui/avatar";
import { Button } from "#components/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#components/ui/dialog";
import { Input } from "#components/ui/input";
import { cn } from "#lib/utils";
import { avatarColor, fullName, initialsOf } from "../pages/systemAdmin/Users";

function AppointLeadForm({ department, users, leadIds, currentLead, onCancel, onConfirm }) {
  // Only agents/leads in this department who don't already lead a department
  const eligible = users.filter(
    (u) => u.department === department.name && u.role !== "employee" && !leadIds.has(u.id)
  );

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(eligible[0]?.id ?? null);

  const q = query.trim().toLowerCase();
  const visible = eligible.filter((u) => fullName(u).toLowerCase().includes(q));
  const selected = eligible.find((u) => u.id === selectedId);

  return (
    <>
      <DialogHeader className="flex-row items-start gap-3 space-y-0 text-left">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <UserRound className="size-4" />
        </div>
        <div className="space-y-1">
          <DialogTitle className="text-base">Appoint lead for {department.name}</DialogTitle>
          <DialogDescription className="text-xs">
            Only people who don't already lead a department are shown.
          </DialogDescription>
        </div>
      </DialogHeader>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder={`Search people in ${department.name}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-9 pl-9 text-xs"
        />
      </div>

      <div role="radiogroup" aria-label="Eligible people" className="space-y-2">
        {visible.map((u) => {
          const checked = u.id === selectedId;
          return (
            <button
              key={u.id}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => setSelectedId(u.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-slate-50",
                checked && "border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600 hover:bg-indigo-50/40"
              )}
            >
              <Avatar className="size-7">
                <AvatarFallback className={cn("text-[10px] font-semibold text-white", avatarColor(u.id))}>
                  {initialsOf(u)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 leading-tight">
                <p className="text-xs font-semibold">{fullName(u)}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {u.role === "agent" ? "Agent \u2192 will become Lead" : "Department Lead \u00B7 not leading"}
                </p>
              </div>
              {checked && (
                <span className="flex size-4 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Check className="size-3" />
                </span>
              )}
            </button>
          );
        })}

        {visible.length === 0 && (
          <p className="rounded-lg border border-dashed p-4 text-center text-xs text-slate-500">
            {eligible.length === 0
              ? `Nobody in ${department.name} is eligible yet. Add an agent through Manage members first.`
              : "No one matches that search."}
          </p>
        )}
      </div>

      {selected && (
        <div className="space-y-1 rounded-lg bg-slate-50 p-3 text-[11px] leading-snug text-slate-600">
          <p>
            {selected.role === "agent"
              ? `${selected.firstName}'s role changes to Department Lead and they become the lead of ${department.name}.`
              : `${selected.firstName} becomes the lead of ${department.name}.`}
            {currentLead && ` ${fullName(currentLead)} stops leading this department.`}{" "}
            This is recorded in the audit log.
          </p>
        </div>
      )}

      <DialogFooter className="flex-row justify-end gap-2">
        <Button type="button" variant="outline" size="sm" className="text-xs" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={!selected}
          className="bg-indigo-600 text-xs font-semibold hover:bg-indigo-700"
          onClick={() => onConfirm(selected)}
        >
          {selected ? `Appoint ${selected.firstName}` : "Appoint"}
        </Button>
      </DialogFooter>
    </>
  );
}

export default AppointLeadForm;