import React, { useState, useEffect } from "react";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "#components/ui/dialog";
import { Button } from "#components/ui/button";
import { Input } from "#components/ui/input";
import { Label } from "#components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#components/ui/select";
import type { Department } from "#hooks/useDepartments";
import type { User } from "#context/UsersContext";

interface DepartmentDialogProps {
  department?: Department | null;
  leads?: User[];
  onCancel: () => void;
  onSave: (payload: { name: string; description?: string; status?: string; leadId?: string | number | null }) => Promise<void>;
}

export default function DepartmentDialog({ department, leads = [], onCancel, onSave }: DepartmentDialogProps) {
  const isEdit = Boolean(department);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [leadId, setLeadId] = useState<string>("none");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (department) {
      setName(department.department_name || "");
      setDescription(department.description || "");
      setStatus(department.status || "active");
      setLeadId(department.lead_id ? String(department.lead_id) : "none");
    } else {
      setName("");
      setDescription("");
      setStatus("active");
      setLeadId("none");
    }
    setError(null);
  }, [department]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Department name is required.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        status,
        leadId: leadId !== "none" ? leadId : null,
      });
      onCancel();
    } catch (err: any) {
      setError(err.message || "Failed to save department.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle className="text-base">
          {isEdit ? `Edit ${department?.department_name}` : "Add new department"}
        </DialogTitle>
        <DialogDescription className="text-xs">
          {isEdit
            ? "Update department details, status, or assigned lead."
            : "Create a new department queue for your organisation."}
        </DialogDescription>
      </DialogHeader>

      {error && (
        <div className="rounded-md bg-red-50 p-2.5 text-xs text-red-600 border border-red-200">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="dept-name" className="text-xs">
            Department name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="dept-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. IT Support, HR, Finance"
            className="h-9 text-xs"
            disabled={saving}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dept-desc" className="text-xs">Description</Label>
          <Input
            id="dept-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief purpose of this department"
            className="h-9 text-xs"
            disabled={saving}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Status</Label>
            <Select value={status} onValueChange={(val) => val && setStatus(val)} disabled={saving}>
              <SelectTrigger className="h-9 w-full text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active" className="text-xs">Active</SelectItem>
                <SelectItem value="inactive" className="text-xs">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Department Lead</Label>
            <Select value={leadId} onValueChange={(val) => val && setLeadId(val)} disabled={saving}>
              <SelectTrigger className="h-9 w-full text-xs">
                <SelectValue placeholder="Select lead" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-xs">No Lead (Unassigned)</SelectItem>
                {leads.map((u) => (
                  <SelectItem key={u.user_id} value={String(u.user_id)} className="text-xs">
                    {u.name} {u.surname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <DialogFooter className="flex-row justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" className="text-xs" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={saving}
          className="bg-indigo-600 text-xs font-semibold hover:bg-indigo-700"
        >
          {saving ? "Saving..." : isEdit ? "Save changes" : "Create department"}
        </Button>
      </DialogFooter>
    </form>
  );
}
