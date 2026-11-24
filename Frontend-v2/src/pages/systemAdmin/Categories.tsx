import { useState } from "react";
import {Plus} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#components/ui/alert-dialog";
import { Button } from "#components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "#components/ui/table";
import CategoryPanel from "#components/CategoryPanel";
import GroupRows from "#components/GroupRows";

const uid = () => crypto.randomUUID();
const field = (label, type, required = true) => ({ id: uid(), label, type, required });
const category = (name, department, icon, priority, extra = {}) => ({
  id: uid(),
  name,
  department,
  icon,
  priority,
  section: "I need something",
  needsApproval: false,
  approver: "lead",
  fields: [],
  status: "active",
  ...extra,
});

const initialCategories = [
  category("Laptop or hardware fault", "IT Support", "laptop", "normal"),
  category("Network, Wi-Fi & VPN", "IT Support", "network", "normal"),
  category("Passwords & sign-in", "IT Support", "key", "high"),
  category("Software purchase", "IT Support", "software", "normal", {
    needsApproval: true,
    fields: [
      field("Software name", "text"),
      field("Estimated cost per year (R)", "number"),
      field("Why do you need it?", "longtext"),
      field("Needed by", "date", false),
    ],
  }),
  category("New hardware", "IT Support", "monitor", "normal", {
    needsApproval: true,
    fields: [
      field("Device type", "text"),
      field("Why do you need it?", "longtext"),
      field("Needed by", "date", false),
    ],
  }),
  category("Access to a system or folder", "IT Support", "lock", "normal", {
    needsApproval: true,
    fields: [field("System or folder", "text"), field("Reason for access", "longtext")],
  }),
  category("Payroll query", "Human Resources", "payroll", "normal", {
    fields: [field("Pay period", "text")],
  }),
  category("Employment letter", "Human Resources", "letter", "low", {
    fields: [field("Letter type", "text")],
  }),
  category("Building & maintenance", "Facilities", "building", "normal", {
    fields: [field("Location", "text")],
  }),
];



export const DEPARTMENTS = ["IT Support", "Human Resources", "Facilities", "Finance", "Operations"];

export default function Categories() {
  const [categories, setCategories] = useState(initialCategories);
  const [selected, setSelected] = useState<string | null>(null); // category id | "new" | null
  const [toDeactivate, setToDeactivate] = useState(null);

  const current = categories.find((c) => c.id === selected);

  const groups = DEPARTMENTS.map((name) => ({
    name,
    items: categories.filter((c) => c.department === name),
  })).filter((g) => g.items.length > 0);

  const save = (draft) => {
    if (draft.id) {
      setCategories((list) => list.map((c) => (c.id === draft.id ? draft : c)));
    } else {
      const created = { ...draft, id: uid() };
      setCategories((list) => [...list, created]);
      setSelected(created.id);
    }
  };

  const setStatus = (cat, status) => {
    setCategories((list) => list.map((c) => (c.id === cat.id ? { ...c, status } : c)));
    setToDeactivate(null);
  };



  return (
    <main className="flex min-w-0 flex-1 flex-col bg-slate-50/50 lg:flex-row">
      {/* Table */}
      <div className="min-w-0 flex-1">
        <header className="flex items-start justify-between gap-4 border-b bg-white px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">
              Categories &amp; routing
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">
              What employees choose on the New request form, and where each choice goes
            </p>
          </div>
          <Button
            size="sm"
            className="shrink-0 bg-indigo-600 text-xs font-semibold hover:bg-indigo-700"
            onClick={() => setSelected("new")}
          >
            <Plus className="size-3.5" />
            Add category
          </Button>
        </header>

        <div className="p-4">
          <div className="overflow-x-auto rounded-xl border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  {["Category", "Default priority", "Approval", "Extra fields", "Status"].map((h) => (
                    <TableHead key={h} className="h-9 px-4 text-[10px] font-medium text-slate-500">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <GroupRows
                    key={group.name}
                    group={group}
                    selected={selected}
                    onSelect={setSelected}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Side panel */}
      <aside className="w-full shrink-0 border-t bg-white lg:min-h-screen lg:w-[28rem] lg:border-l lg:border-t-0">
        {selected ? (
          <CategoryPanel
            key={selected}
            category={current}
            onSave={save}
            onCancel={() => setSelected(null)}
            onRequestDeactivate={setToDeactivate}
            onReactivate={(c) => setStatus(c, "active")}
          />
        ) : (
          <div className="flex h-full min-h-48 items-center justify-center p-8 text-center text-xs text-slate-500">
            Select a category to edit its routing, approval and form fields.
          </div>
        )}
      </aside>

      <AlertDialog open={!!toDeactivate} onOpenChange={(o) => !o && setToDeactivate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate?</AlertDialogTitle>
            <AlertDialogDescription>
              It will disappear from the New request form. Tickets already filed
              keep their category, and you can reactivate it at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => setStatus(toDeactivate, "inactive")}
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
