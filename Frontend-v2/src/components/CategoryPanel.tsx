import { useState } from "react";
import { Button } from "#components/ui/button";
import { Input } from "#components/ui/input";
import { Label } from "#components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#components/ui/select";
import { Switch } from "#components/ui/switch";
import { cn } from "#lib/utils";
import { DEPARTMENTS } from "@/pages/systemAdmin/Categories";
import PriorityBars from "./PriorityBars";
import { PRIORITIES } from "./PriorityBadge";
import FieldsBuilder from "./FieldsBuilder";

const blankCategory = () => ({
  id: null,
  name: "",
  department: "",
  icon: "default",
  priority: "normal",
  section: "I need something",
  needsApproval: false,
  approver: "lead",
  fields: [],
  status: "active",
});

const APPROVERS = {
  lead: "Department lead",
  manager: "Requester's manager",
};

  function FieldError({ children }) {
  return children ? <p className="text-[11px] text-red-600">{children}</p> : null;
}

function CategoryPanel({ category, onSave, onCancel, onRequestDeactivate, onReactivate }) {
  const isNew = !category;
  const [draft, setDraft] = useState(() => structuredClone(category ?? blankCategory()));
  const [submitted, setSubmitted] = useState(false);

  const patch = (changes) => setDraft((d) => ({ ...d, ...changes }));

  const errors = {
    name: !draft.name.trim() && "Give the category a name",
    department: !draft.department && "Choose a department",
    fields: draft.fields.some((f) => !f.label.trim()),
  };
  const valid = !errors.name && !errors.department && !errors.fields;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (valid) onSave({ ...draft, name: draft.name.trim() });
  };

  const inactive = category?.status === "inactive";

  return (
    <form onSubmit={handleSubmit} noValidate className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-slate-900">
            {isNew ? "New category" : category.name}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Shown under &ldquo;{draft.section}&rdquo;
          </p>
        </div>

        {isNew && (
          <div className="space-y-1.5">
            <Label htmlFor="cat-name" className="text-xs">Name</Label>
            <Input
              id="cat-name"
              value={draft.name}
              onChange={(e) => patch({ name: e.target.value })}
              aria-invalid={submitted && !!errors.name}
              className="h-9 text-xs"
            />
            {submitted && <FieldError>{errors.name}</FieldError>}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="cat-dept" className="text-xs">Routes to department</Label>
          <Select value={draft.department} onValueChange={(department) => patch({ department })}>
            <SelectTrigger
              id="cat-dept"
              aria-invalid={submitted && !!errors.department}
              className="h-9 w-full text-xs"
            >
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {submitted && <FieldError>{errors.department}</FieldError>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="cat-priority" className="text-xs">Default priority</Label>
            <Select value={draft.priority} onValueChange={(priority) => patch({ priority })}>
              <SelectTrigger id="cat-priority" className="h-9 w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRIORITIES).map(([value, p]) => (
                  <SelectItem key={value} value={value} className="text-xs">
                    <span className={cn("flex items-center gap-2", p.badge.split(" ").pop())}>
                      <PriorityBars level={p.level} />
                      <span className="text-slate-900">{p.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cat-approver" className="text-xs">Approver</Label>
            <Select
              value={draft.approver}
              disabled={!draft.needsApproval}
              onValueChange={(approver) => patch({ approver })}
            >
              <SelectTrigger id="cat-approver" className="h-9 w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(APPROVERS).map(([value, label]) => (
                  <SelectItem key={value} value={value} className="text-xs">{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border border-indigo-200 bg-indigo-50 p-3">
          <div className="leading-tight">
            <Label htmlFor="cat-approval" className="text-xs font-semibold text-indigo-700">
              Needs approval
            </Label>
            <p className="mt-0.5 text-[11px] text-indigo-600">
              Starts as Pending approval, not in the queue
            </p>
          </div>
          <Switch
            id="cat-approval"
            checked={draft.needsApproval}
            onCheckedChange={(needsApproval) => patch({ needsApproval })}
            className="data-[state=checked]:bg-indigo-600"
          />
        </div>

        <FieldsBuilder
          fields={draft.fields}
          onChange={(fields) => patch({ fields })}
          showErrors={submitted}
        />

        {!isNew && (
          <p className="text-[11px] leading-snug text-slate-500">
            Categories can't be deleted. Deactivating hides it from the New request
            form, and tickets already filed keep their category.
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 border-t p-4">
        {!isNew &&
          (inactive ? (
            <Button type="button" variant="outline" size="sm" className="mr-auto text-xs" onClick={() => onReactivate(category)}>
              Reactivate
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mr-auto border-red-200 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onRequestDeactivate(category)}
            >
              Deactivate
            </Button>
          ))}
        <Button type="button" variant="outline" size="sm" className="text-xs" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" className="bg-indigo-600 text-xs font-semibold hover:bg-indigo-700">
          Save category
        </Button>
      </div>
    </form>
  );
}

export default CategoryPanel