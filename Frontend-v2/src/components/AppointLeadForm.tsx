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
import type { Department } from "#hooks/useDepartments";
import type { User } from "#context/UsersContext";

interface AppointLeadFormProps {
  department: Department;
  users: User[];
  currentLead?: User | null;
  onCancel: () => void;
  onConfirm: (leadUser: User) => Promise<void>;
}

function AppointLeadForm({
  department,
  users,
  currentLead,
  onCancel,
  onConfirm,
}: AppointLeadFormProps) {
  // Allow appointing Department Leads or Agents who are active
  const eligible = users.filter(
    (u) =>
      u.active !== false &&
      (u.role === "Department Lead" && u.department_id === department.department_id)
  );

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(
    eligible.find((u) => String(u.user_id) === String(department.lead_id))?.user_id ??
    eligible[0]?.user_id ??
    null
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const visible = eligible.filter((u) => `${fullName(u)} ${u.email}`.toLowerCase().includes(q));
  const selected = eligible.find((u) => u.user_id === selectedId);

  const handleConfirm = async () => {
    if (!selected) return;
    try {
      setSubmitting(true);
      setError(null);
      await onConfirm(selected);
    } catch (err: any) {
      setError(err.message || "Failed to appoint lead");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <DialogHeader className="flex-row items-start gap-3 space-y-0 text-left">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <UserRound className="size-4" />
        </div>
        <div className="space-y-1">
          <DialogTitle className="text-base">
            Appoint lead for {department.department_name}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Select an active Department Lead or Agent to lead this department.
          </DialogDescription>
        </div>
      </DialogHeader>

      {error && (
        <div className="rounded-md bg-red-50 p-2.5 text-xs text-red-600 border border-red-200">
          {error}
        </div>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder={`Search eligible candidates...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-9 pl-9 text-xs"
          disabled={submitting}
        />
      </div>

      <div role="radiogroup" aria-label="Eligible people" className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {visible.map((u) => {
          const checked = u.user_id === selectedId;
          const isCurrentLead = String(department.lead_id) === String(u.user_id);
          return (
            <button
              key={u.user_id}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => setSelectedId(u.user_id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-slate-50",
                checked && "border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600 hover:bg-indigo-50/40"
              )}
            >
              <Avatar className="size-7">
                <AvatarFallback className={cn("text-[10px] font-semibold text-white", avatarColor(u.user_id))}>
                  {initialsOf(u)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 leading-tight">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold">{fullName(u)}</p>
                  {isCurrentLead && (
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                      Current Lead
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {u.email} · {u.role}
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
              ? `No active Department Leads or Agents available.`
              : "No one matches that search."}
          </p>
        )}
      </div>

      {selected && (
        <div className="space-y-1 rounded-lg bg-slate-50 p-3 text-[11px] leading-snug text-slate-600">
          <p>
            {selected.name} will be assigned as lead of {department.department_name}.
            {currentLead && String(currentLead.user_id) !== String(selected.user_id) && (
              <> ({fullName(currentLead)} will be replaced as lead.)</>
            )}
          </p>
        </div>
      )}

      <DialogFooter className="flex-row justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" className="text-xs" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={!selected || submitting}
          className="bg-indigo-600 text-xs font-semibold hover:bg-indigo-700"
          onClick={handleConfirm}
        >
          {submitting ? "Appointing..." : selected ? `Appoint ${selected.name}` : "Appoint"}
        </Button>
      </DialogFooter>
    </div>
  );
}

export default AppointLeadForm;
