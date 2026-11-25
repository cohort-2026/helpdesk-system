import { useState, type FormEvent, type ReactNode } from "react";
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
import type { Department } from "#hooks/useDepartments";
import type {
  CategoryField,
  CategoryPriority,
} from "../services/categoryService";
import PriorityBars from "./PriorityBars";
import { PRIORITIES } from "./PriorityBadge";
import FieldsBuilder from "./FieldsBuilder";

export interface CategoryDraft {
  id: string | null;
  name: string;
  department: string;
  departmentName?: string;
  description: string;
  icon: string;
  priority: CategoryPriority;
  section: string;
  needsApproval: boolean;
  fields: CategoryField[];
  status: "active" | "inactive";
}

interface CategoryPanelProps {
  category?: CategoryDraft;
  departments: Department[];
  onSave: (draft: CategoryDraft) => Promise<void>;
  onCancel: () => void;
  onRequestDeactivate: (category: CategoryDraft) => void;
  onReactivate: (category: CategoryDraft) => Promise<void>;
}

const blankCategory = (): CategoryDraft => ({
  id: null,
  name: "",
  department: "",
  description: "",
  icon: "default",
  priority: "normal",
  section: "I need something",
  needsApproval: false,
  fields: [],
  status: "active",
});

function FieldError({ children }: { children?: ReactNode }) {
  return children ? <p className="text-[11px] text-red-600">{children}</p> : null;
}

export default function CategoryPanel({
  category,
  departments,
  onSave,
  onCancel,
  onRequestDeactivate,
  onReactivate,
}: CategoryPanelProps) {
  const isNew = !category;
  const [draft, setDraft] = useState(() =>
    structuredClone(category ?? blankCategory())
  );
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patch = (changes: Partial<CategoryDraft>) =>
    setDraft((current) => ({ ...current, ...changes }));

  const errors = {
    name: !draft.name.trim() && "Give the category a name",
    department: !draft.department && "Choose a department",
    fields: draft.fields.some((field) => !field.label.trim()),
  };
  const valid = !errors.name && !errors.department && !errors.fields;
  const inactive = category?.status === "inactive";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (!valid) return;

    setSaving(true);
    setError(null);
    try {
      await onSave({ ...draft, name: draft.name.trim() });
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Failed to save category."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReactivate = async () => {
    if (!category) return;
    setSaving(true);
    setError(null);
    try {
      await onReactivate(category);
    } catch (reactivateError) {
      setError(
        reactivateError instanceof Error
          ? reactivateError.message
          : "Failed to reactivate category."
      );
    } finally {
      setSaving(false);
    }
  };

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

        {error && (
          <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
            {error}
          </p>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="cat-name" className="text-xs">Name</Label>
          <Input
            id="cat-name"
            value={draft.name}
            onChange={(event) => patch({ name: event.target.value })}
            aria-invalid={submitted && !!errors.name}
            className="h-9 text-xs"
            disabled={saving}
          />
          {submitted && <FieldError>{errors.name}</FieldError>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cat-description" className="text-xs">Description</Label>
          <Input
            id="cat-description"
            value={draft.description}
            onChange={(event) => patch({ description: event.target.value })}
            className="h-9 text-xs"
            disabled={saving}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cat-dept" className="text-xs">Routes to department</Label>
          <Select
            value={draft.department}
            onValueChange={(department) => department && patch({ department })}
            disabled={saving}
          >
            <SelectTrigger
              id="cat-dept"
              aria-invalid={submitted && !!errors.department}
              className="h-9 w-full text-xs"
            >
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((item) => (
                <SelectItem
                  key={item.department_id}
                  value={String(item.department_id)}
                  className="text-xs"
                >
                  {item.department_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {submitted && <FieldError>{errors.department}</FieldError>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cat-priority" className="text-xs">Default priority</Label>
          <Select
            value={draft.priority}
            onValueChange={(priority) =>
              priority && patch({ priority: priority as CategoryPriority })
            }
            disabled={saving}
          >
            <SelectTrigger id="cat-priority" className="h-9 w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PRIORITIES).map(([value, priority]) => (
                <SelectItem key={value} value={value} className="text-xs">
                  <span className={cn("flex items-center gap-2", priority.badge.split(" ").pop())}>
                    <PriorityBars level={priority.level} />
                    <span className="text-slate-900">{priority.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border border-indigo-200 bg-indigo-50 p-3">
          <div className="leading-tight">
            <Label htmlFor="cat-approval" className="text-xs font-semibold text-indigo-700">
              Needs approval
            </Label>
            <p className="mt-0.5 text-[11px] text-indigo-600">
              Requests in this category start pending approval.
            </p>
          </div>
          <Switch
            id="cat-approval"
            checked={draft.needsApproval}
            onCheckedChange={(needsApproval) => patch({ needsApproval })}
            className="data-[state=checked]:bg-indigo-600"
            disabled={saving}
          />
        </div>

        <FieldsBuilder
          fields={draft.fields}
          onChange={(fields: CategoryField[]) => patch({ fields })}
          showErrors={submitted}
        />
        {submitted && errors.fields && (
          <FieldError>Give every extra field a label.</FieldError>
        )}

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
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mr-auto text-xs"
              onClick={handleReactivate}
              disabled={saving}
            >
              Reactivate
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mr-auto border-red-200 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onRequestDeactivate(category)}
              disabled={saving}
            >
              Deactivate
            </Button>
          ))}
        <Button type="button" variant="outline" size="sm" className="text-xs" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={saving} className="bg-indigo-600 text-xs font-semibold hover:bg-indigo-700">
          {saving ? "Saving..." : "Save category"}
        </Button>
      </div>
    </form>
  );
}
