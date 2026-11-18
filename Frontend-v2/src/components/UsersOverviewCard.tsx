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
import Count from "#components/Count";

const users = [
  {
    name: "Thandi Mthembu",
    initials: "TM",
    department: "IT Support",
    role: "Lead",
  },
  {
    name: "Nomvula Sithole",
    initials: "NS",
    department: "Human Resources",
    role: "Agent",
  },
  {
    name: "Lerato Soke",
    initials: "Ls",
    department: "Human Resources",
    role: "Employee",
  },
  {
    name: "Bongani Mabaso",
    initials: "BM",
    department: "Finance",
    role: "Employee",
  },
  {
    name: "Yolanda Ndlovu",
    initials: "YN",
    department: "IT Support",
    role: "Agent",
  },
];

function UsersCard() {
  return (
    <Card className="gap-0 overflow-hidden rounded-xl py-0 shadow-none">
      <CardHeader className="border-b px-4 py-3">
        <CardTitle className="text-xs font-semibold">Users</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              {["Name", "Initials", "Role", "Department"].map((h) => (
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
            {users.map((user) => (
              <TableRow key={user.name}>
                <TableCell className="px-4 py-3 text-xs font-semibold">
                  {user.name}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Avatar className="size-5">
                    <AvatarFallback
                      className={cn("text-[8px] font-semibold text-white bg-indigo-800")}
                    >
                      {user.initials}
                    </AvatarFallback>
                  </Avatar>{" "}
                </TableCell>
                <TableCell className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className="border-amber-300 bg-amber-50 px-1.5 text-[10px] font-medium text-amber-700"
                    >
                        {user.role}
                    </Badge>
                </TableCell>
              <TableCell className="px-4 py-3 text-xs font-semibold">
                  {user.department}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default UsersCard;
