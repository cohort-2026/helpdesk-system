import { Avatar, AvatarFallback } from "#components/ui/avatar";
import { Badge } from "#components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#components/ui/table";
import { cn } from "#lib/utils";
import Count from "#components/Count";

const departments = [
  {
    name: "IT Support",
    lead: { name: "Thandi Mthembu", initials: "TM", color: "bg-slate-900" },
    agents: 4,
    open: 46,
    breached: 2,
  },
  {
    name: "Human Resources",
    lead: { name: "Nomvula Sithole", initials: "NS", color: "bg-indigo-800" },
    agents: 2,
    open: 18,
    breached: 0,
  },
  { name: "Facilities", lead: null, agents: 2, open: 21, breached: 3 },
  {
    name: "Finance",
    lead: { name: "Bongani Mabaso", initials: "BM", color: "bg-red-700" },
    agents: 2,
    open: 11,
    breached: 0,
  },
];

function DepartmentsCard() {
  return (
    <Card className="gap-0 overflow-hidden rounded-xl py-0 shadow-none">
      <CardHeader className="border-b px-4 py-3">
        <CardTitle className="text-xs font-semibold">Departments</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              {["Department", "Lead", "Agents", "Open", "Breached"].map((h) => (
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
            {departments.map((d) => (
              <TableRow key={d.name}>
                <TableCell className="px-4 py-3 text-xs font-semibold">
                  {d.name}
                </TableCell>
                <TableCell className="px-4 py-3">
                  {d.lead ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="size-5">
                        <AvatarFallback
                          className={cn(
                            "text-[8px] font-semibold text-white",
                            d.lead.color
                          )}
                        >
                          {d.lead.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{d.lead.name}</span>
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
                  <Count value={d.agents} />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Count value={d.open} />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Count value={d.breached} danger />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      
      </CardContent>
    </Card>
  );
}

export default DepartmentsCard