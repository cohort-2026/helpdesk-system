import { useState } from "react";
import { Link } from "react-router";
import { ShieldCheck } from "lucide-react";

import { Avatar, AvatarFallback } from "#components/ui/avatar";
import { Badge } from "#components/ui/badge";
import { Button } from "#components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "#components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#components/ui/select";
import { Table, TableBody, TableCell, TableRow } from "#components/ui/table";

/* ---------- Fake data (swap for the API later) ---------- */

const kpis = [
  { label: "Open backlog", value: "46", note: "+6 vs last Tuesday", tone: "default" },
  { label: "Unassigned", value: "12", note: "oldest 3h 10m", tone: "warning" },
  { label: "Breached", value: "2", note: "both first response", tone: "danger" },
  { label: "Avg first response", value: "42m", note: "92% within target", tone: "default" },
  { label: "Avg resolution", value: "9h 20m", note: "87% within SLA", tone: "default" },
  { label: "CSAT", value: "94%", note: "48 ratings · reopen rate 4%", tone: "default" },
] as const;

const urgentTickets = [
  { id: "HD-1045", title: "Can't log in to Sage after password change", assignee: "TM", priority: "Urgent", status: "Breached 25m" },
  { id: "HD-1050", title: "Laptop screen cracked after a fall", assignee: null, priority: "High", status: "Breached 10m" },
  { id: "HD-1049", title: "Finance shared drive access", assignee: null, priority: "Normal", status: "Due in 35m" },
  { id: "HD-1048", title: "VPN drops every 10 minutes", assignee: "SM", priority: "High", status: "Due in 1h 54m" },
];

const agents = [
  { name: "Thabo Nkosi", initials: "TN", open: 6, waiting: 2, breached: 1 },
  { name: "Sipho Mahlangu", initials: "SM", open: 9, waiting: 2, breached: 1 },
  { name: "Megan Fourie", initials: "MF", open: 4, waiting: 1, breached: 0 },
  { name: "Lindiwe Shabalala", initials: "LS", open: 7, waiting: 1, breached: 0 },
];

/* ---------- Small helpers ---------- */

const tileColours = {
  default: "",
  warning: "border-amber-300 bg-amber-50",
  danger: "border-red-200 bg-red-50",
};

const valueColours = {
  default: "",
  warning: "text-amber-900",
  danger: "text-red-700",
};

function priorityClass(priority: string) {
  if (priority === "Urgent") return "bg-red-100 text-red-700";
  if (priority === "High") return "bg-orange-100 text-orange-700";
  return "bg-blue-100 text-blue-700";
}

function statusClass(status: string) {
  return status.startsWith("Breached")
    ? "bg-red-100 text-red-700"
    : "bg-amber-100 text-amber-800";
}

/* ---------- Page ---------- */

export default function DepartmentLeadDashboard() {
  const [range, setRange] = useState("30");

  // Used to make the workload bars the right length
  const busiest = Math.max(...agents.map((a) => a.open + a.waiting));

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            IT Support · Tuesday 10 November, 14:20
          </p>
        </div>

        <Select value={range} onValueChange={(value) => setRange(value ?? "30")}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Six number tiles */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className={tileColours[kpi.tone]}>
            <CardContent className="space-y-1 p-4">
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className={`text-3xl font-semibold ${valueColours[kpi.tone]}`}>
                {kpi.value}
              </p>
              <p className="text-xs text-muted-foreground">{kpi.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Breached & due soon + Agent workload */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Breached &amp; due soon</CardTitle>
            <Link
              to="/department-lead/tickets"
              className="text-xs font-medium text-indigo-600 hover:underline"
            >
              View all →
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableBody>
                {urgentTickets.map((t) => (
                  <TableRow key={t.id} className="cursor-pointer">
                    <TableCell className="w-20 font-mono text-xs text-muted-foreground">
                      {t.id}
                    </TableCell>
                    <TableCell>
                      {/* The whole row opens the ticket */}
                      <Link
                        to={`/department-lead/tickets/${t.id}`}
                        className="text-sm hover:underline"
                      >
                        {t.title}
                      </Link>
                    </TableCell>
                    <TableCell className="w-24 text-xs">
                      {t.assignee ? (
                        <Avatar className="size-6">
                          <AvatarFallback className="bg-indigo-600 text-[10px] text-white">
                            {t.assignee}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <span className="text-red-600">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="w-20">
                      <Badge className={priorityClass(t.priority)}>
                        {t.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-32">
                      <Badge className={statusClass(t.status)}>{t.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Agent workload</CardTitle>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-sm bg-indigo-600" /> Open
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-sm bg-amber-400" /> Waiting on employee
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {agents.map((a) => (
              <div key={a.name} className="flex items-center gap-3">
                <Avatar className="size-6">
                  <AvatarFallback className="text-[10px]">{a.initials}</AvatarFallback>
                </Avatar>
                <span className="w-32 text-sm">{a.name}</span>

                {/* Stacked bar: open (indigo) then waiting (amber) */}
                <div className="flex h-2 flex-1">
                  <div
                    className="rounded-l bg-indigo-600"
                    style={{ width: `${(a.open / busiest) * 100}%` }}
                  />
                  <div
                    className="rounded-r bg-amber-400"
                    style={{ width: `${(a.waiting / busiest) * 100}%` }}
                  />
                </div>

                <span className="w-5 text-right text-sm font-medium">
                  {a.open + a.waiting}
                </span>
                <span className="w-16 text-xs text-red-600">
                  {a.breached > 0 ? `${a.breached} breached` : ""}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Approvals */}
      <Card className="border-indigo-200 bg-indigo-50">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <ShieldCheck className="size-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">3 requests waiting for your approval</p>
            <p className="text-xs text-muted-foreground">
              Oldest: Finance folder access, 1 day
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/department-lead/approvals">Review</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}