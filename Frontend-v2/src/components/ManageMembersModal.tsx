import { useState } from "react";
import { Search, UserMinus, UserPlus, Users as UsersIcon } from "lucide-react";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "#components/ui/dialog";
import { Button } from "#components/ui/button";
import { Input } from "#components/ui/input";
import { Avatar, AvatarFallback } from "#components/ui/avatar";
import { Badge } from "#components/ui/badge";
import { avatarColor, fullName, initialsOf } from "../pages/systemAdmin/Users";
import type { Department } from "#hooks/useDepartments";
import type { User } from "#context/UsersContext";

interface ManageMembersModalProps {
  department: Department;
  allUsers: User[];
  onAddMembers: (departmentId: string | number, userIds: (string | number)[]) => Promise<void>;
  onRemoveMember: (departmentId: string | number, userId: string | number) => Promise<void>;
  onClose: () => void;
}

export default function ManageMembersModal({
  department,
  allUsers,
  onAddMembers,
  onRemoveMember,
  onClose,
}: ManageMembersModalProps) {
  const [activeTab, setActiveTab] = useState<"current" | "add">("current");
  const [search, setSearch] = useState("");
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deptIdNum = Number(department.department_id);

  // Current members of this department (Agents and Employees)
  const currentMembers = allUsers.filter(
    (u) => Number(u.department_id) === deptIdNum
  );

  // Eligible non-members to add: must be active Agents or Employees without a department or in another department
  const eligibleUsers = allUsers.filter(
    (u) =>
      Number(u.department_id) !== deptIdNum &&
      (u.role === "Agent" || u.role === "Employee") &&
      u.active !== false
  );

  const filteredCurrent = currentMembers.filter((u) =>
    `${fullName(u)} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const filteredEligible = eligibleUsers.filter((u) =>
    `${fullName(u)} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleSelect = (userId: string) => {
    setSelectedToAdd((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAddSubmit = async () => {
    if (selectedToAdd.length === 0) return;
    try {
      setLoadingAction(true);
      setError(null);
      await onAddMembers(department.department_id, selectedToAdd);
      setSelectedToAdd([]);
      setActiveTab("current");
    } catch (err: any) {
      setError(err.message || "Failed to add members");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRemove = async (userId: string) => {
    try {
      setLoadingAction(true);
      setError(null);
      await onRemoveMember(department.department_id, userId);
    } catch (err: any) {
      setError(err.message || "Failed to remove member");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <UsersIcon className="size-4" />
          </div>
          <div>
            <DialogTitle className="text-base">
              Members · {department.department_name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Manage employees and agents assigned to this department.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {error && (
        <div className="rounded-md bg-red-50 p-2.5 text-xs text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b text-xs font-medium">
        <button
          type="button"
          onClick={() => {
            setActiveTab("current");
            setSearch("");
          }}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === "current"
              ? "border-indigo-600 text-indigo-600 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Assigned Members ({currentMembers.length})
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("add");
            setSearch("");
          }}
          className={`px-4 py-2 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "add"
              ? "border-indigo-600 text-indigo-600 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <UserPlus className="size-3.5" />
          Add Members
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder={activeTab === "current" ? "Search members..." : "Search available users..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 pl-9 text-xs"
        />
      </div>

      {/* List content */}
      <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
        {activeTab === "current" ? (
          filteredCurrent.length === 0 ? (
            <p className="rounded-lg border border-dashed p-6 text-center text-xs text-slate-500">
              {currentMembers.length === 0
                ? "No members are currently assigned to this department."
                : "No matching members found."}
            </p>
          ) : (
            filteredCurrent.map((u) => {
              const isLead = String(department.lead_id) === String(u.user_id);
              return (
                <div
                  key={u.user_id}
                  className="flex items-center justify-between rounded-lg border bg-white p-2.5 text-xs hover:bg-slate-50/50"
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-7">
                      <AvatarFallback className={`text-[10px] font-semibold text-white ${avatarColor(u.user_id)}`}>
                        {initialsOf(u)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="leading-tight">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900">{fullName(u)}</span>
                        {isLead && (
                          <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-[9px] text-indigo-700">
                            Dept Lead
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">{u.email} · {u.role}</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={loadingAction || isLead}
                    onClick={() => handleRemove(u.user_id)}
                    className="h-7 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                    title={isLead ? "Cannot remove appointed lead here (use Appoint Lead)" : "Remove from department"}
                  >
                    <UserMinus className="size-3.5 mr-1" />
                    Remove
                  </Button>
                </div>
              );
            })
          )
        ) : (
          filteredEligible.length === 0 ? (
            <p className="rounded-lg border border-dashed p-6 text-center text-xs text-slate-500">
              {eligibleUsers.length === 0
                ? "No active Agents or Employees available to add."
                : "No matching users found."}
            </p>
          ) : (
            filteredEligible.map((u) => {
              const selected = selectedToAdd.includes(u.user_id);
              return (
                <div
                  key={u.user_id}
                  onClick={() => handleToggleSelect(u.user_id)}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-2.5 text-xs transition-colors ${
                    selected
                      ? "border-indigo-600 bg-indigo-50/40"
                      : "bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => handleToggleSelect(u.user_id)}
                      className="size-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <Avatar className="size-7">
                      <AvatarFallback className={`text-[10px] font-semibold text-white ${avatarColor(u.user_id)}`}>
                        {initialsOf(u)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="leading-tight">
                      <span className="font-semibold text-slate-900">{fullName(u)}</span>
                      <p className="text-[11px] text-slate-500">{u.email} · {u.role}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {u.role}
                  </Badge>
                </div>
              );
            })
          )
        )}
      </div>

      <DialogFooter className="flex-row justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" className="text-xs" onClick={onClose} disabled={loadingAction}>
          Close
        </Button>
        {activeTab === "add" && (
          <Button
            type="button"
            size="sm"
            disabled={selectedToAdd.length === 0 || loadingAction}
            onClick={handleAddSubmit}
            className="bg-indigo-600 text-xs font-semibold hover:bg-indigo-700"
          >
            {loadingAction ? "Adding..." : `Add Selected (${selectedToAdd.length})`}
          </Button>
        )}
      </DialogFooter>
    </div>
  );
}
