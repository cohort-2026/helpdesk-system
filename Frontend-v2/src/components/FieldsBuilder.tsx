import { Button } from "#components/ui/button";
import { Input } from "#components/ui/input";
import { Label } from "#components/ui/label";
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#components/ui/select";
import { cn } from "#lib/utils";
import type { ReactNode } from "react";
import type { CategoryField, CategoryFieldType } from "../services/categoryService";

const FIELD_TYPES: Record<CategoryFieldType, string> = {
  text: "Text",
  number: "Number",
  longtext: "Long text",
  date: "Date",
};

interface FieldsBuilderProps {
  fields: CategoryField[];
  onChange: (fields: CategoryField[]) => void;
  showErrors: boolean;
}

function FieldsBuilder({ fields, onChange, showErrors }: FieldsBuilderProps) {
  const update = (id: string, patch: Partial<CategoryField>) =>
    onChange(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  const remove = (id: string) => onChange(fields.filter((f) => f.id !== id));
  const add = () =>
    onChange([
      ...fields,
      { id: crypto.randomUUID(), label: "", type: "text", required: true },
    ]);
  const move = (index: number, dir: number) => {
    const next = [...fields];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  function FieldError({ children }: { children?: ReactNode }) {
    return children ? <p className="text-[11px] text-red-600">{children}</p> : null;
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs">Extra fields on the form</Label>

      {fields.length === 0 && (
        <p className="rounded-md border border-dashed p-3 text-center text-[11px] text-slate-500">
          No extra fields. People will only see the title and description.
        </p>
      )}

      {fields.map((f, i) => (
        <div key={f.id} className="space-y-1">
          <div className="flex items-center gap-2 rounded-md border bg-white p-1.5">
            <div className="flex flex-col">
              <button
                type="button"
                aria-label="Move field up"
                disabled={i === 0}
                onClick={() => move(i, -1)}
                className="text-slate-400 hover:text-slate-700 disabled:opacity-30"
              >
                <ChevronUp className="size-3" />
              </button>
              <button
                type="button"
                aria-label="Move field down"
                disabled={i === fields.length - 1}
                onClick={() => move(i, 1)}
                className="text-slate-400 hover:text-slate-700 disabled:opacity-30"
              >
                <ChevronDown className="size-3" />
              </button>
            </div>

            <Input
              value={f.label}
              placeholder="Field label"
              aria-label="Field label"
              aria-invalid={showErrors && !f.label.trim()}
              onChange={(e) => update(f.id, { label: e.target.value })}
              className="h-7 min-w-0 flex-1 border-0 px-1 text-xs shadow-none focus-visible:ring-1"
            />

            <Select
              value={f.type}
              onValueChange={(type) =>
                type && update(f.id, { type: type as CategoryFieldType })
              }
            >
              <SelectTrigger aria-label="Field type" className="h-7 w-[88px] gap-1 px-2 text-[10px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FIELD_TYPES).map(([value, label]) => (
                  <SelectItem key={value} value={value} className="text-xs">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <button
              type="button"
              aria-pressed={f.required}
              onClick={() => update(f.id, { required: !f.required })}
              className={cn(
                "w-[58px] rounded px-1 py-1 text-[10px] hover:bg-slate-100",
                f.required ? "font-semibold text-slate-900" : "text-slate-400"
              )}
            >
              {f.required ? "Required" : "Optional"}
            </button>

            <button
              type="button"
              aria-label="Remove field"
              onClick={() => remove(f.id)}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600"
            >
              <X className="size-3.5" />
            </button>
          </div>
          {showErrors && !f.label.trim() && <FieldError>Give this field a label</FieldError>}
        </div>
      ))}

      <Button
        type="button"
        variant="link"
        onClick={add}
        className="h-auto p-0 text-xs font-semibold text-indigo-600"
      >
        <Plus className="size-3" />
        Add field
      </Button>
    </div>
  );
}

export default FieldsBuilder