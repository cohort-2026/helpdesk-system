import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal, Plus, Search, RefreshCw } from "lucide-react";

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#components/ui/dropdown-menu";
import { Input } from "#components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#components/ui/table";
import { cn } from "#lib/utils";
import UserSheet, { type UserFormData } from "#components/UserSheet";
import { useUsers, type User, type UserRole } from "#context/UsersContext";
import { useDepartments } from "#hooks/useDepartments";

/* ----------------------------- Config ----------------------------- */

const PAGE_SIZE = 15;

export const ROLES: Record<string, { label: string; badge: string }> = {
  Employee: {
    label: "Employee",
    badge: "border-slate-200 bg-slate-100 text-slate-700",
  },
  Agent: {
    label: "Agent",
    badge: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
  "Department Lead": {
    label: "Department Lead",
    badge: "border-violet-200 bg-violet-50 text-violet-700",
  },
  "System Admin": {
    label: "System Admin",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
};

const AVATAR_COLORS = [
  "bg-emerald-700",
  "bg-indigo-700",
  "bg-slate-800",
  "bg-violet-600",
  "bg-amber-600",
  "bg-orange-600",
  "bg-sky-700",
];

/* ----------------------------- Helpers ----------------------------- */

export const initialsOf = (u: any) =>
  `${u?.name?.[0] ?? u?.firstName?.[0] ?? ""}${u?.surname?.[0] ?? ""}`.toUpperCase() || "U";

export const fullName = (u: any) =>
  `${u?.name ?? u?.firstName ?? ""} ${u?.surname ?? ""}`.trim() || u?.email || "User";

export const avatarColor = (id: any) => {
  const s = String(id || "");
  const hash = [...s].reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

export function StatusLabel({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        active ? "text-emerald-700" : "text-slate-500"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          active ? "bg-emerald-500" : "bg-slate-400"
        )}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const meta = ROLES[role] || {
    label: role,
    badge: "border-slate-200 bg-slate-100 text-slate-700",
  };
  return (
    <Badge
      variant="outline"
      className={cn("px-1.5 py-0 text-[10px] font-medium", meta.badge)}
    >
      {meta.label}
    </Badge>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={(val) => val && onChange(val)}>
      <SelectTrigger className="h-8 w-auto gap-1.5 bg-white px-2.5 text-xs">
        <SelectValue placeholder={`${label}: ${options.find((o) => o.value === value)?.label || "All"}`} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="text-xs">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function Users() {
  const {
    users,
    loading: usersLoading,
    fetchUsers,
    createUser,
    updateUser,
    toggleUserStatus,
    allowedRoles,
  } = useUsers();

  const { departments, loading: deptsLoading, fetchAll: fetchDepts } = useDepartments();

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    role: "all",
    department: "all",
    status: "all",
  });
  const [page, setPage] = useState(1);
  const [sheet, setSheet] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null,
  });
  const [toDeactivate, setToDeactivate] = useState<User | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const setFilter = (key: string) => (value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  // Map of department_id to department name
  const departmentMap = useMemo(() => {
    const map = new Map<number | string, string>();
    departments.forEach((d) => {
      map.set(Number(d.department_id), d.department_name);
      map.set(String(d.department_id), d.department_name);
    });
    return map;
  }, [departments]);

  // Options for filters
  const roleFilterOptions = useMemo(() => {
    const list = [
      { value: "all", label: "All Roles" },
      ...allowedRoles.map((r) => ({ value: r, label: r })),
    ];
    return list;
  }, [allowedRoles]);

  const departmentFilterOptions = useMemo(() => {
    const list = [
      { value: "all", label: "All Departments" },
      ...departments.map((d) => ({
        value: String(d.department_id),
        label: d.department_name,
      })),
      { value: "none", label: "Unassigned" },
    ];
    return list;
  }, [departments]);

  const statusFilterOptions = [
    { value: "all", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const matchesRole = filters.role === "all" || u.role === filters.role;

      const userDeptId = u.department_id ? String(u.department_id) : "none";
      const matchesDept =
        filters.department === "all" ||
        (filters.department === "none" && (u.department_id === null || u.department_id === undefined)) ||
        filters.department === userDeptId;

      const isUserActive = u.active !== false;
      const matchesStatus =
        filters.status === "all" ||
        (filters.status === "active" && isUserActive) ||
        (filters.status === "inactive" && !isUserActive);

      const matchesSearch =
        !q ||
        fullName(u).toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q));

      return matchesRole && matchesDept && matchesStatus && matchesSearch;
    });
  }, [users, query, filters]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);

  const handleSave = async (form: UserFormData, userToEdit: User | null) => {
    const deptId = form.department_id !== "none" ? Number(form.department_id) : null;

    if (userToEdit) {
      const res = await updateUser(userToEdit.user_id, {
        role: form.role as UserRole,
        department_id: deptId,
      });
      if (res) {
        showFeedback("success", `Updated ${fullName(userToEdit)} successfully.`);
      }
    } else {
      const res = await createUser({
        name: form.firstName.trim(),
        surname: form.surname.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role as UserRole,
        department_id: deptId,
      });
      if (res) {
        showFeedback("success", `User ${form.firstName} ${form.surname} created.`);
      }
    }
    setSheet({ open: false, user: null });
  };

  const deactivate = async (userToDeact: User) => {
    try {
      await toggleUserStatus(userToDeact.user_id, true);
      showFeedback("success", `${fullName(userToDeact)} has been deactivated.`);
      setToDeactivate(null);
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to deactivate user.");
    }
  };

  const reactivate = async (userToReact: User) => {
    try {
      await toggleUserStatus(userToReact.user_id, false);
      showFeedback("success", `${fullName(userToReact)} has been reactivated.`);
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to reactivate user.");
    }
  };

  const loading = usersLoading || deptsLoading;

  return (
    <div className="min-w-0 flex-1 bg-slate-50/50 min-h-screen">
      <header className="flex items-start justify-between border-b bg-white px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">Users</h1>
          <p className="mt-0.5 text-xs text-slate-500">
            {users.length} registered users in organisation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchUsers();
              fetchDepts(true);
            }}
            className="text-xs"
            title="Refresh"
          >
            <RefreshCw className="size-3.5 mr-1" />
            Refresh
          </Button>
          <Button
            size="sm"
            className="bg-indigo-600 text-xs font-semibold hover:bg-indigo-700"
            onClick={() => setSheet({ open: true, user: null })}
          >
            <Plus className="size-3.5" />
            Add user
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

      <div className="space-y-3 p-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            label="Role"
            value={filters.role}
            onChange={setFilter("role")}
            options={roleFilterOptions}
          />
          <FilterSelect
            label="Department"
            value={filters.department}
            onChange={setFilter("department")}
            options={departmentFilterOptions}
          />
          <FilterSelect
            label="Status"
            value={filters.status}
            onChange={setFilter("status")}
            options={statusFilterOptions}
          />
          <div className="relative min-w-52 flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Search name or email"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="h-8 bg-white pl-8 text-xs"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border bg-white">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                {["Name", "Role", "Department", "Status"].map((h) => (
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
              {loading && users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-xs text-slate-500">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-xs text-slate-500">
                    No users match these filters.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((u) => {
                  const inactive = u.active === false;
                  const deptName = u.department_id ? departmentMap.get(u.department_id) || `Dept #${u.department_id}` : "\u2014";

                  return (
                    <TableRow key={u.user_id} className={cn(inactive && "bg-slate-50/60")}>
                      <TableCell className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-8">
                            <AvatarFallback
                              className={cn(
                                "text-[10px] font-semibold text-white",
                                inactive ? "bg-slate-400" : avatarColor(u.user_id)
                              )}
                            >
                              {initialsOf(u)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="leading-tight">
                            <p className={cn("text-xs font-semibold", inactive && "text-slate-400")}>
                              {fullName(u)}
                            </p>
                            <p className={cn("text-[11px] text-slate-500", inactive && "text-slate-400")}>
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2.5">
                        <RoleBadge role={String(u.role)} />
                      </TableCell>
                      <TableCell className="px-4 py-2.5 text-xs text-slate-700">
                        {deptName}
                      </TableCell>
                      <TableCell className="px-4 py-2.5">
                        <StatusLabel active={!inactive} />
                      </TableCell>
                      <TableCell className="px-2 py-2.5">
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                aria-label={`Actions for ${fullName(u)}`}
                              />
                            }
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-xs"
                              onClick={() => setSheet({ open: true, user: u })}
                            >
                              Edit user
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {inactive ? (
                              <DropdownMenuItem className="text-xs" onSelect={() => reactivate(u)}>
                                Reactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="text-xs text-red-600 focus:text-red-600"
                                onSelect={() => setToDeactivate(u)}
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

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            {filtered.length === 0
              ? "Showing 0"
              : `Showing ${start + 1}\u2013${start + rows.length} of ${filtered.length}`}{" "}
            · {PAGE_SIZE} per page
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">
              Page {currentPage} of {pageCount}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              aria-label="Previous page"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              aria-label="Next page"
              disabled={currentPage === pageCount}
              onClick={() => setPage(currentPage + 1)}
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <UserSheet
        open={sheet.open}
        onOpenChange={(open: boolean) => setSheet((s) => ({ ...s, open }))}
        user={sheet.user}
        departments={departments}
        allowedRoles={allowedRoles}
        onSave={handleSave}
        onRequestDeactivate={setToDeactivate}
        onReactivate={reactivate}
      />

      <AlertDialog open={!!toDeactivate} onOpenChange={(o) => !o && setToDeactivate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Deactivate {toDeactivate && fullName(toDeactivate)}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              They will not be able to sign in. Their tickets and history are retained,
              and you can reactivate them at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => toDeactivate && deactivate(toDeactivate)}
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
