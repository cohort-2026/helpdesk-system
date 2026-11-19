import { useState } from "react";
import { MoreHorizontal, Plus} from "lucide-react";

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
import { Avatar, AvatarFallback } from "#components/ui/avatar";
import { Badge } from "#components/ui/badge";
import { Button } from "#components/ui/button";
import {
  Dialog,
  DialogContent
} from "#components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#components/ui/table";
import { cn } from "#lib/utils";
import { avatarColor, fullName, initialsOf } from "./Users";
import AppointLeadForm from "#components/AppointLeadForm";

type DepartmentsProps = {
  onAddDepartment?: () => void;
  onEdit?: (dept: any) => void;
  onManageMembers?: (dept: any) => void;
  onCategories?: (dept: any) => void;
};

const initialUsers = [
  { id: "u3", firstName: "Thandi", surname: "Mthembu", role: "lead", department: "IT Support" },
  { id: "u9", firstName: "Nomvula", surname: "Sithole", role: "lead", department: "Human Resources" },
  { id: "u5", firstName: "Bongani", surname: "Zulu", role: "agent", department: "Facilities" },
  { id: "u10", firstName: "Kagiso", surname: "Molefe", role: "lead", department: "Facilities" },
  { id: "u11", firstName: "Bongani", surname: "Mabaso", role: "lead", department: "Finance" },
  { id: "u12", firstName: "Zanele", surname: "Dube", role: "employee", department: "Facilities" },
];

const initialDepartments = [
  { id: "d1", name: "IT Support", leadId: "u3", agents: 4, categories: 9, openTickets: 46, status: "active" },
  { id: "d2", name: "Human Resources", leadId: "u9", agents: 2, categories: 4, openTickets: 18, status: "active" },
  { id: "d3", name: "Facilities", leadId: null, agents: 2, categories: 3, openTickets: 21, status: "active" },
  { id: "d4", name: "Finance", leadId: "u11", agents: 2, categories: 2, openTickets: 11, status: "active" },
  { id: "d5", name: "Legal", leadId: null, agents: 0, categories: 0, openTickets: 0, status: "inactive" },
];

export default function Departments({
  onAddDepartment,
  onEdit,
  onManageMembers,
  onCategories,
}: DepartmentsProps = {}) {
  const [departments, setDepartments] = useState(initialDepartments);
  const [users, setUsers] = useState(initialUsers);
  const [appointing, setAppointing] = useState<any>(null); // department being given a lead
  const [deactivating, setDeactivating] = useState<any>(null);

  const userById = (id: any) => users.find((u) => u.id === id);
  const leadIds = new Set(departments.map((d) => d.leadId).filter(Boolean));

  const patchDepartment = (id: any, patch: any) =>
    setDepartments((list) => list.map((d) => (d.id === id ? { ...d, ...patch } : d)));

  const appointLead = (person: any) => {
    const wasAgent = person.role === "agent";
    patchDepartment(appointing.id, {
      leadId: person.id,
      agents: wasAgent ? appointing.agents - 1 : appointing.agents,
    });
    setUsers((list) => list.map((u) => (u.id === person.id ? { ...u, role: "lead" } : u)));
    setAppointing(null);
  };

  const deactivate = (dept: any) => {
    patchDepartment(dept.id, { status: "inactive" });
    setDeactivating(null);
  };

  return (
    <div className="min-w-0 flex-1 bg-slate-50/50 min-h-screen">
      <header className="flex items-start justify-between gap-4 border-b bg-white px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">Departments</h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Each department is a private queue with its own lead, agents and categories
          </p>
        </div>
        <Button
          size="sm"
          className="shrink-0 bg-indigo-600 text-xs font-semibold hover:bg-indigo-700"
          onClick={onAddDepartment}
        >
          <Plus className="size-3.5" />
          Add department
        </Button>
      </header>

      <div className="space-y-2 p-4">
        <div className="overflow-x-auto rounded-xl border bg-white">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                {["Department", "Lead", "Agents", "Categories", "Open tickets", "Status"].map((h) => (
                  <TableHead key={h} className="h-8 px-4 text-[10px] font-medium text-slate-500">
                    {h}
                  </TableHead>
                ))}
                <TableHead className="w-10 px-2">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((d) => {
                const lead = userById(d.leadId);
                const inactive = d.status === "inactive";
                return (
                  <TableRow key={d.id} className={cn(inactive && "bg-slate-50/70 text-slate-400")}>
                    <TableCell className={cn("px-4 py-3 text-xs font-semibold", inactive && "text-slate-400")}>
                      {d.name}
                    </TableCell>

                    <TableCell className="px-4 py-3">
                      {lead ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="size-5">
                            <AvatarFallback
                              className={cn(
                                "text-[8px] font-semibold text-white",
                                inactive ? "bg-slate-400" : avatarColor(lead.id)
                              )}
                            >
                              {initialsOf(lead)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs">{fullName(lead)}</span>
                        </div>
                      ) : (
                        <Badge
                          variant="outline"
                          className={cn(
                            "px-1.5 py-0 text-[10px] font-medium",
                            inactive
                              ? "border-slate-200 bg-slate-100 text-slate-400"
                              : "border-amber-300 bg-amber-50 text-amber-700"
                          )}
                        >
                          No lead
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-xs">{d.agents}</TableCell>
                    <TableCell className="px-4 py-3 text-xs">{d.categories}</TableCell>
                    <TableCell className="px-4 py-3 text-xs">{d.openTickets}</TableCell>

                    <TableCell className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          "px-1.5 py-0 text-[10px] font-medium",
                          inactive
                            ? "border-slate-200 bg-slate-100 text-slate-500"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        )}
                      >
                        {inactive ? "Inactive" : "Active"}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-2 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-7" aria-label={`Actions for ${d.name}`}>
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-xs" onSelect={() => onEdit?.(d)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-xs" onSelect={() => setAppointing(d)}>
                            Appoint lead
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-xs" onSelect={() => onManageMembers?.(d)}>
                            Manage members
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-xs" onSelect={() => onCategories?.(d)}>
                            Categories
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {inactive ? (
                            <DropdownMenuItem className="text-xs" onSelect={() => patchDepartment(d.id, { status: "active" })}>
                              Reactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-xs text-red-600 focus:text-red-600"
                              onSelect={() => setDeactivating(d)}
                            >
                              Deactivate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <p className="text-[11px] text-slate-500">
          Row menu: Edit · Appoint lead · Manage members · Categories · Deactivate
        </p>
      </div>

      {/* Appoint lead */}
      <Dialog open={!!appointing} onOpenChange={(open) => !open && setAppointing(null)}>
        <DialogContent className="gap-4 sm:max-w-md">
          {appointing && (
            <AppointLeadForm
              key={appointing.id}
              department={appointing}
              users={users}
              leadIds={leadIds}
              currentLead={userById(appointing.leadId)}
              onCancel={() => setAppointing(null)}
              onConfirm={appointLead}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Deactivate confirmation */}
      <AlertDialog open={!!deactivating} onOpenChange={(o) => !o && setDeactivating(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate {deactivating?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              It stays in this list, greyed out, and you can reactivate it at any
              time. This is recorded in the audit log.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deactivate(deactivating)}>
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}