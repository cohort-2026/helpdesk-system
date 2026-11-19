import { useMemo } from "react";
import { Avatar, AvatarFallback } from "#components/ui/avatar";
import { Badge } from "#components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#components/ui/table";
import { cn } from "#lib/utils";
import Count from "#components/Count";
import { useDepartments } from "#hooks/useDepartments";
import { useUsers } from "#context/UsersContext";
import { avatarColor } from "../pages/systemAdmin/Users";

function DepartmentsCard() {
  const { departments, loading: deptLoading } = useDepartments();
  const { users, loading: usersLoading } = useUsers();

  const userById = (id: any) =>
    users.find((u) => String(u.user_id) === String(id) || String(u.id) === String(id));

  const agentCountsByDept = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const u of users) {
      if (u.department_id && u.role === "Agent") {
        const id = String(u.department_id);
        counts[id] = (counts[id] || 0) + 1;
      }
    }
    return counts;
  }, [users]);

  const loading = deptLoading || usersLoading;

  return (
    <Card className="gap-0 overflow-hidden rounded-xl py-0 shadow-none">
      <CardHeader className="border-b px-4 py-3 flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-semibold">Departments</CardTitle>
        <span className="text-[11px] text-slate-500 font-normal">
          {departments.filter((d) => d.status !== "inactive").length} active
        </span>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              {["Department", "Lead", "Agents", "Status"].map((h) => (
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
            {loading && departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-16 text-center text-xs text-slate-400">
                  Loading departments...
                </TableCell>
              </TableRow>
            ) : departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-16 text-center text-xs text-slate-400">
                  No departments created yet.
                </TableCell>
              </TableRow>
            ) : (
              departments.map((d) => {
                const lead = userById(d.lead_id);
                const leadName = lead
                  ? `${lead.name} ${lead.surname || ""}`.trim()
                  : d.lead_name
                  ? `${d.lead_name} ${d.lead_surname || ""}`.trim()
                  : d.departmentLead;
                const initials = lead
                  ? `${lead.name[0] || ""}${lead.surname?.[0] || ""}`.toUpperCase()
                  : leadName
                  ? leadName.slice(0, 2).toUpperCase()
                  : "";
                const agentCount = agentCountsByDept[String(d.department_id)] || 0;
                const isInactive = d.status === "inactive";

                return (
                  <TableRow key={d.department_id} className={cn(isInactive && "bg-slate-50/50 text-slate-400")}>
                    <TableCell className="px-4 py-3 text-xs font-semibold">
                      {d.department_name}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {leadName ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="size-5">
                            <AvatarFallback
                              className={cn(
                                "text-[8px] font-semibold text-white",
                                isInactive ? "bg-slate-400" : avatarColor(d.lead_id || d.department_name)
                              )}
                            >
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs">{leadName}</span>
                        </div>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-amber-300 bg-amber-50 px-1.5 text-[10px] font-medium text-amber-700"
                        >
                          No lead
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Count value={agentCount} />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          "px-1.5 py-0 text-[10px] font-medium",
                          isInactive
                            ? "border-slate-200 bg-slate-100 text-slate-500"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        )}
                      >
                        {isInactive ? "Inactive" : "Active"}
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

export default DepartmentsCard;
