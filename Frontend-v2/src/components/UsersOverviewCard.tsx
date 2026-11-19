import { useMemo } from "react";
import { Avatar, AvatarFallback } from "#components/ui/avatar";
import { Badge } from "#components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#components/ui/table";
import { cn } from "#lib/utils";
import { useUsers } from "#context/UsersContext";
import { useDepartments } from "#hooks/useDepartments";
import { avatarColor } from "../pages/systemAdmin/Users";

function UsersCard() {
  const { users, loading: usersLoading } = useUsers();
  const { departments, loading: deptLoading } = useDepartments();

  const deptMap = useMemo(() => {
    const map = new Map<string, string>();
    departments.forEach((d) => {
      map.set(String(d.department_id), d.department_name);
    });
    return map;
  }, [departments]);

  // Show latest 5 or 6 users
  const recentUsers = useMemo(() => {
    return users.slice(0, 6);
  }, [users]);

  const loading = usersLoading || deptLoading;

  return (
    <Card className="gap-0 overflow-hidden rounded-xl py-0 shadow-none">
      <CardHeader className="border-b px-4 py-3 flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-semibold">Users</CardTitle>
        <span className="text-[11px] text-slate-500 font-normal">
          {users.length} total
        </span>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              {["Name", "Role", "Department", "Status"].map((h) => (
                <TableHead
                  key={h}
                  className="h-8 px-4 text-[10px] font-medium text-slate-500"
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-16 text-center text-xs text-slate-400">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : recentUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-16 text-center text-xs text-slate-400">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              recentUsers.map((user) => {
                const initials = `${user.name?.[0] || ""}${user.surname?.[0] || ""}`.toUpperCase() || "U";
                const deptName = user.department_id
                  ? deptMap.get(String(user.department_id)) || `Dept #${user.department_id}`
                  : "Unassigned";

                return (
                  <TableRow key={user.user_id}>
                    <TableCell className="px-4 py-2.5 text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <Avatar className="size-5">
                          <AvatarFallback
                            className={cn(
                              "text-[8px] font-semibold text-white",
                              avatarColor(user.user_id)
                            )}
                          >
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.name} {user.surname}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-2.5">
                      <Badge
                        variant="outline"
                        className="border-slate-200 bg-slate-50 px-1.5 text-[10px] font-medium text-slate-700"
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-2.5 text-xs text-slate-600">
                      {deptName}
                    </TableCell>
                    <TableCell className="px-4 py-2.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          "px-1.5 py-0 text-[10px] font-medium",
                          user.active === false
                            ? "border-slate-200 bg-slate-100 text-slate-500"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        )}
                      >
                        {user.active === false ? "Inactive" : "Active"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default UsersCard;
