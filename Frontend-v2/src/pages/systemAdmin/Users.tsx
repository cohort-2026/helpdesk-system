import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal, Plus, Search } from "lucide-react";

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
import UserSheet from "#components/UserSheet";

/* ----------------------------- Config ----------------------------- */

const PAGE_SIZE = 15;

export const DEPARTMENTS = [
  "IT Support",
  "Human Resources",
  "Facilities",
  "Finance",
  "Operations",
];

export const ROLES = {
  employee: {
    label: "Employee",
    segment: "Employee",
    badge: "border-slate-200 bg-slate-100 text-slate-700",
  },
  agent: {
    label: "Agent",
    segment: "Agent",
    badge: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
  lead: {
    label: "Department Lead",
    segment: "Lead",
    badge: "border-violet-200 bg-violet-50 text-violet-700",
  },
};

const STATUSES = {
  active: { label: "Active", dot: "bg-emerald-500", text: "text-emerald-700" },
  invited: { label: "Invited", dot: "bg-amber-500", text: "text-amber-700" },
  deactivated: {
    label: "Deactivated",
    dot: "bg-slate-400",
    text: "text-slate-500",
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

const toOptions = (map) =>
  Object.entries(map).map(([value, { label }]) => ({ value, label }));

const ROLE_FILTER = [{ value: "all", label: "All" }, ...toOptions(ROLES)];
const STATUS_FILTER = [{ value: "all", label: "All" }, ...toOptions(STATUSES)];
const DEPARTMENT_FILTER = [
  { value: "all", label: "All" },
  ...DEPARTMENTS.map((d) => ({ value: d, label: d })),
];

/* ---------------------------- Sample data ---------------------------- */
// Replace with your API. Dates are ISO strings; null = never signed in.

const at = (daysAgo, h, m) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

const initialUsers = [
  { id: "u1", firstName: "Lerato", surname: "Mokoena", email: "lerato.mokoena@mzansifreight.co.za", role: "employee", department: "Finance", status: "active", lastSignIn: at(0, 8, 45) },
  { id: "u2", firstName: "Thabo", surname: "Nkosi", email: "thabo.nkosi@mzansifreight.co.za", role: "agent", department: "IT Support", status: "active", lastSignIn: at(0, 9, 12) },
  { id: "u3", firstName: "Thandi", surname: "Mthembu", email: "thandi.mthembu@mzansifreight.co.za", role: "lead", department: "IT Support", status: "active", lastSignIn: at(1, 16, 30) },
  { id: "u4", firstName: "Priya", surname: "Naidoo", email: "priya.naidoo@mzansifreight.co.za", role: "agent", department: "Human Resources", status: "active", lastSignIn: at(0, 7, 58) },
  { id: "u5", firstName: "Bongani", surname: "Zulu", email: "bongani.zulu@mzansifreight.co.za", role: "agent", department: "Facilities", status: "active", lastSignIn: at(3, 14, 5) },
  { id: "u6", firstName: "Johan", surname: "van Wyk", email: "johan.vanwyk@mzansifreight.co.za", role: "employee", department: "Finance", status: "active", lastSignIn: at(6, 11, 20) },
  { id: "u7", firstName: "Dawid", surname: "Pretorius", email: "dawid.pretorius@mzansifreight.co.za", role: "employee", department: null, status: "deactivated", lastSignIn: at(40, 10, 0) },
  { id: "u8", firstName: "Sizwe", surname: "Ndlovu", email: "sizwe.ndlovu@mzansifreight.co.za", role: "employee", department: "Operations", status: "invited", lastSignIn: null },
];

const navItems = [
  { label: "Overview", icon: Plus, active: true, href: "/system-admin" },
  { label: "Users", icon: Plus, count: 214, href: "/system-admin/users" },
  { label: "Departments", icon: Plus, count: 5 },
  { label: "Categories & routing", icon: Plus },
  { label: "SLA policies", icon: Plus },
  { label: "Business hours", icon: Plus },
  { label: "Reports", icon: Plus },
];

/* ----------------------------- Helpers ----------------------------- */

export const initialsOf = (u) => `${u.firstName[0] ?? ""}${u.surname[0] ?? ""}`.toUpperCase();
export const fullName = (u) => `${u.firstName} ${u.surname}`;
export const avatarColor = (id) =>
  AVATAR_COLORS[[...id].reduce((sum, c) => sum + c.charCodeAt(0), 0) % AVATAR_COLORS.length];

function formatLastSignIn(iso) {
  if (!iso) return "Never";
  const d = new Date(iso);
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const day = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((day(new Date()) - day(d)) / 86_400_000);
  if (diff === 0) return `Today, ${time}`;
  if (diff === 1) return `Yesterday, ${time}`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/* ---------------------------- Small parts ---------------------------- */

function RoleBadge({ role }) {
  return (
    <Badge
      variant="outline"
      className={cn("px-1.5 py-0 text-[10px] font-medium", ROLES[role].badge)}
    >
      {ROLES[role].label}
    </Badge>
  );
}

export function StatusLabel({ status }) {
  const s = STATUSES[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs", s.text)}>
      <span className={cn("size-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-auto gap-1.5 bg-white px-2.5 text-xs">
        <SelectValue>
          {label}: {options.find((o) => o.value === value)?.label}
        </SelectValue>
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
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ role: "all", department: "all", status: "all" });
  const [page, setPage] = useState(1);
  const [sheet, setSheet] = useState({ open: false, user: null });
  const [toDeactivate, setToDeactivate] = useState(null);

  const setFilter = (key) => (value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter(
      (u) =>
        (filters.role === "all" || u.role === filters.role) &&
        (filters.department === "all" || u.department === filters.department) &&
        (filters.status === "all" || u.status === filters.status) &&
        (!q || `${fullName(u)} ${u.email}`.toLowerCase().includes(q))
    );
  }, [users, query, filters]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);

  const updateUser = (id, patch) =>
    setUsers((list) => list.map((u) => (u.id === id ? { ...u, ...patch } : u)));

  const handleSave = (form, user) => {
    if (user) {
      updateUser(user.id, { role: form.role, department: form.department });
    } else {
      setUsers((list) => [
        {
          id: crypto.randomUUID(),
          firstName: form.firstName.trim(),
          surname: form.surname.trim(),
          email: form.email.trim().toLowerCase(),
          role: form.role,
          department: form.department,
          status: "invited", // stays "invited" until their first sign-in
          lastSignIn: null,
          forcePasswordChange: form.forcePasswordChange,
        },
        ...list,
      ]);
    }
    setSheet({ open: false, user: null });
  };

  const deactivate = (user) => {
    updateUser(user.id, { status: "deactivated" });
    setToDeactivate(null);
    setSheet({ open: false, user: null });
  };

  const reactivate = (user) => {
    // Someone who never signed in goes back to "Invited", not "Active"
    updateUser(user.id, { status: user.lastSignIn ? "active" : "invited" });
    setSheet({ open: false, user: null });
  };

  return (
    <div className="min-w-0 flex-1 bg-slate-50/50 min-h-screen">
      <header className="flex items-start justify-between border-b bg-white px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">Users</h1>
          <p className="mt-0.5 text-xs text-slate-500">
            {users.length} people at Mzansi Freight
          </p>
        </div>
        <Button
          size="sm"
          className="bg-indigo-600 text-xs font-semibold hover:bg-indigo-700"
          onClick={() => setSheet({ open: true, user: null })}
        >
          <Plus className="size-3.5" />
          Add user
        </Button>
      </header>

      <div className="space-y-3 p-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect label="Role" value={filters.role} onChange={setFilter("role")} options={ROLE_FILTER} />
          <FilterSelect label="Department" value={filters.department} onChange={setFilter("department")} options={DEPARTMENT_FILTER} />
          <FilterSelect label="Status" value={filters.status} onChange={setFilter("status")} options={STATUS_FILTER} />
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
                {["Name", "Role", "Department", "Status", "Last sign-in"].map((h) => (
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
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-xs text-slate-500">
                    No people match these filters.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((u) => {
                const inactive = u.status === "deactivated";
                return (
                  <TableRow key={u.id} className={cn(inactive && "bg-slate-50/60")}>
                    <TableCell className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8">
                          <AvatarFallback
                            className={cn(
                              "text-[10px] font-semibold text-white",
                              inactive ? "bg-slate-400" : avatarColor(u.id)
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
                      <RoleBadge role={u.role} />
                    </TableCell>
                    <TableCell className="px-4 py-2.5 text-xs text-slate-700">
                      {u.department ?? "\u2014"}
                    </TableCell>
                    <TableCell className="px-4 py-2.5">
                      <StatusLabel status={u.status} />
                    </TableCell>
                    <TableCell className="px-4 py-2.5 text-xs text-slate-500">
                      {formatLastSignIn(u.lastSignIn)}
                    </TableCell>
                    <TableCell className="px-2 py-2.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-7" aria-label={`Actions for ${fullName(u)}`}>
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-xs" onSelect={() => setSheet({ open: true, user: u })}>
                            Edit
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
              })}
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
        onOpenChange={(open) => setSheet((s) => ({ ...s, open }))}
        user={sheet.user}
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
              They won't be able to sign in. Their tickets and history are kept,
              and you can reactivate them at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deactivate(toDeactivate)}
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}