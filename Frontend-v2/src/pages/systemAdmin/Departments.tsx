import { useState, useMemo } from "react";
import { MoreHorizontal, Plus, Users, UserRound, RefreshCw } from "lucide-react";

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
import { Dialog, DialogContent } from "#components/ui/dialog";
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
import DepartmentDialog from "#components/DepartmentDialog";
import ManageMembersModal from "#components/ManageMembersModal";
import { useDepartments, type Department } from "#hooks/useDepartments";
import { useUsers, type User } from "#context/UsersContext";

export default function Departments() {
  const {
    departments,
    loading: departmentsLoading,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    assignLead,
    addMembers,
    removeMember,
    fetchAll,
  } = useDepartments();

  const { users, fetchUsers, loading: usersLoading } = useUsers();

  const [appointing, setAppointing] = useState<Department | null>(null);
  const [deactivating, setDeactivating] = useState<Department | null>(null);
  const [dialogDept, setDialogDept] = useState<Department | null | "new">(null);
  const [managingMembersDept, setManagingMembersDept] = useState<Department | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const userById = (id: any): User | undefined => {
    if (!id) return undefined;
    return users.find((u) => String(u.user_id) === String(id) || String(u.id) === String(id));
  };

  // Calculate agent/member counts per department
  const memberCountsByDept = useMemo(() => {
    const counts: Record<string, { agents: number; total: number }> = {};
    for (const u of users) {
      if (u.department_id !== null && u.department_id !== undefined) {
        const dId = String(u.department_id);
        if (!counts[dId]) {
          counts[dId] = { agents: 0, total: 0 };
        }
        counts[dId].total += 1;
        if (u.role === "Agent") {
          counts[dId].agents += 1;
        }
      }
    }
    return counts;
  }, [users]);

  // Leads available for dropdowns
  const availableLeads = useMemo(() => {
    return users.filter((u) => u.role === "Department Lead" || u.role === "Agent");
  }, [users]);

  const handleCreateOrUpdate = async (payload: {
    name: string;
    description?: string;
    status?: string;
    leadId?: string | number | null;
  }) => {
    try {
      if (dialogDept === "new") {
        await createDepartment(payload);
        showFeedback("success", `Department "${payload.name}" created successfully.`);
      } else if (dialogDept) {
        await updateDepartment(dialogDept.department_id, payload);
        showFeedback("success", `Department "${payload.name}" updated successfully.`);
      }
      setDialogDept(null);
      await fetchUsers();
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to save department.");
      throw err;
    }
  };

  const handleAppointLead = async (leadUser: User) => {
    if (!appointing) return;
    try {
      await assignLead(appointing.department_id, leadUser.user_id);
      showFeedback("success", `${fullName(leadUser)} appointed as lead of ${appointing.department_name}.`);
      setAppointing(null);
      await fetchUsers();
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to appoint department lead.");
      throw err;
    }
  };

  const handleDeactivate = async (dept: Department) => {
    try {
      await deleteDepartment(dept.department_id);
      showFeedback("success", `Department "${dept.department_name}" deactivated.`);
      setDeactivating(null);
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to deactivate department.");
    }
  };

  const handleReactivate = async (dept: Department) => {
    try {
      await updateDepartment(dept.department_id, { status: "active" });
      showFeedback("success", `Department "${dept.department_name}" reactivated.`);
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to reactivate department.");
    }
  };

  const handleAddMembers = async (deptId: string | number, userIds: (string | number)[]) => {
    await addMembers(deptId, userIds);
    await fetchUsers();
    showFeedback("success", "Department members updated.");
  };

  const handleRemoveMember = async (deptId: string | number, userId: string | number) => {
    await removeMember(deptId, userId);
    await fetchUsers();
    showFeedback("success", "Member removed from department.");
  };

  const loading = departmentsLoading || usersLoading;

  return (
    <div className="min-w-0 flex-1 bg-slate-50/50 min-h-screen">
      <header className="flex items-start justify-between gap-4 border-b bg-white px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">Departments</h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Each department is a private queue with its own lead, agents and team members
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchAll(true);
              fetchUsers();
            }}
            className="text-xs"
            title="Refresh"
          >
            <RefreshCw className="size-3.5 mr-1" />
            Refresh
          </Button>
          <Button
            size="sm"
            className="shrink-0 bg-indigo-600 text-xs font-semibold hover:bg-indigo-700"
            onClick={() => setDialogDept("new")}
          >
            <Plus className="size-3.5" />
            Add department
          </Button>
        </div>
      </header>

      {feedback && (
        <div
          className={`mx-6 mt-4 rounded-md p-3 text-xs border ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="space-y-2 p-4">
        <div className="overflow-x-auto rounded-xl border bg-white">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                {["Department", "Lead", "Agents", "Members", "Status"].map((h) => (
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
              {loading && departments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-xs text-slate-500">
                    Loading departments...
                  </TableCell>
                </TableRow>
              ) : departments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-xs text-slate-500">
                    No departments found. Click "Add department" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                departments.map((d) => {
                  const lead = userById(d.lead_id);
                  const inactive = d.status === "inactive";
                  const counts = memberCountsByDept[String(d.department_id)] || { agents: 0, total: 0 };
                  const leadDisplayName = lead
                    ? fullName(lead)
                    : d.lead_name
                    ? `${d.lead_name} ${d.lead_surname || ""}`.trim()
                    : d.departmentLead || null;

                  return (
                    <TableRow key={d.department_id} className={cn(inactive && "bg-slate-50/70 text-slate-400")}>
                      <TableCell className={cn("px-4 py-3 text-xs font-semibold", inactive && "text-slate-400")}>
                        <div>
                          <span>{d.department_name}</span>
                          {d.description && (
                            <p className="text-[11px] font-normal text-slate-400 truncate max-w-xs">
                              {d.description}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="px-4 py-3">
                        {leadDisplayName ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="size-5">
                              <AvatarFallback
                                className={cn(
                                  "text-[8px] font-semibold text-white",
                                  inactive ? "bg-slate-400" : avatarColor(d.lead_id ? String(d.lead_id) : d.department_name)
                                )}
                              >
                                {lead ? initialsOf(lead) : leadDisplayName.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs">{leadDisplayName}</span>
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

                      <TableCell className="px-4 py-3 text-xs font-medium">
                        {counts.agents}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-xs text-slate-600">
                        {counts.total}
                      </TableCell>

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
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                aria-label={`Actions for ${d.department_name}`}
                              />
                            }
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-xs" onSelect={() => setDialogDept(d)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs" onSelect={() => setAppointing(d)}>
                              <UserRound className="size-3.5 mr-1 text-slate-400" />
                              Appoint lead
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs" onSelect={() => setManagingMembersDept(d)}>
                              <Users className="size-3.5 mr-1 text-slate-400" />
                              Manage members
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {inactive ? (
                              <DropdownMenuItem className="text-xs" onSelect={() => handleReactivate(d)}>
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
                })
              )}
            </TableBody>
          </Table>
        </div>

        <p className="text-[11px] text-slate-500">
          Row menu: Edit · Appoint lead · Manage members · Deactivate/Reactivate
        </p>
      </div>

      {/* Create / Edit Department Dialog */}
      <Dialog open={dialogDept !== null} onOpenChange={(open) => !open && setDialogDept(null)}>
        <DialogContent className="gap-4 sm:max-w-md">
          {dialogDept !== null && (
            <DepartmentDialog
              department={dialogDept === "new" ? null : dialogDept}
              leads={availableLeads}
              onCancel={() => setDialogDept(null)}
              onSave={handleCreateOrUpdate}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Appoint lead Dialog */}
      <Dialog open={appointing !== null} onOpenChange={(open) => !open && setAppointing(null)}>
        <DialogContent className="gap-4 sm:max-w-md">
          {appointing && (
            <AppointLeadForm
              department={appointing}
              users={users}
              currentLead={userById(appointing.lead_id)}
              onCancel={() => setAppointing(null)}
              onConfirm={handleAppointLead}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Manage Members Modal */}
      <Dialog open={managingMembersDept !== null} onOpenChange={(open) => !open && setManagingMembersDept(null)}>
        <DialogContent className="gap-4 sm:max-w-lg">
          {managingMembersDept && (
            <ManageMembersModal
              department={managingMembersDept}
              allUsers={users}
              onAddMembers={handleAddMembers}
              onRemoveMember={handleRemoveMember}
              onClose={() => setManagingMembersDept(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Deactivate confirmation */}
      <AlertDialog open={!!deactivating} onOpenChange={(o) => !o && setDeactivating(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate {deactivating?.department_name}?</AlertDialogTitle>
            <AlertDialogDescription>
              It stays in this list as inactive, and you can reactivate it at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deactivating && handleDeactivate(deactivating)}
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
