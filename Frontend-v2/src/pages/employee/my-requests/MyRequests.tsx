import { Link } from "react-router";
import { Button } from "../../../components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { useState } from "react";

// Real tickets will come from backend later.
// For now empty = shows the empty state, but the layout is already correct.
type Ticket = {
  id: string;
  ref: string;
  title: string;
  category: string;
  status: string;
  assignee?: string;
  nextPromise?: string;
  lastMessage?: string;
};

const requests: Ticket[] = [];

export default function MyRequests() {
  const [tab, setTab] = useState("Active");

  const norm = (s: string) => s.toLowerCase();
  const isWaiting = (t: Ticket) => norm(t.status).includes("waiting");
  const isActive = (t: Ticket) =>
    ["new", "open", "pending approval"].includes(norm(t.status)) ||
    isWaiting(t);

  const countFor = (label: string) => {
    if (label === "Active") return requests.filter(isActive).length;
    if (label === "Waiting on you") return requests.filter(isWaiting).length;
    return requests.filter((t) => norm(t.status) === norm(label)).length;
  };

  const tabs = ["Active", "Waiting on you", "Resolved", "Closed", "Cancelled"];

  const filtered = requests.filter((t) => {
    if (tab === "Active") return isActive(t);
    if (tab === "Waiting on you") return isWaiting(t);
    return norm(t.status) === norm(tab);
  });

  const waitingTicket = requests.find(isWaiting);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My requests</h1>
          <p className="text-muted-foreground">
            Your requests, and who is working on them.
          </p>
        </div>
        <Button
          asChild
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Link to="/employee/submit-request">+ New request</Link>
        </Button>
      </div>

      {waitingTicket && (
        <div className="flex items-center justify-between rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
          <p className="text-sm">
            <span className="font-medium">
              {waitingTicket.assignee} needs a reply from you on{" "}
              {waitingTicket.ref}
            </span>
            <br />
            <span className="text-muted-foreground">
              "{waitingTicket.lastMessage}"
            </span>
          </p>
          <Button asChild variant="outline" className="bg-white">
            <Link to={`/employee/tickets/${waitingTicket.id}`}>Reply</Link>
          </Button>
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {tabs.map((label) => (
            <TabsTrigger key={label} value={label}>
              {label}{" "}
              <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">
                {countFor(label)}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <div className="border rounded-lg p-10 text-center">
          <p className="font-medium">No requests yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            When you submit a request, it will show here. Click it to see
            details.
          </p>
          <Button
            asChild
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Link to="/employee/submit-request">Create your first request</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => (
            <Link
              key={t.id}
              to={`/employee/tickets/${t.id}`}
              className="flex items-center gap-4 rounded-lg border bg-white px-4 py-3 hover:bg-muted/50"
            >
              <div className="w-48 shrink-0">
                <p className="text-sm font-medium truncate">
                  {t.ref} · {t.title}
                </p>
                <p className="text-xs text-muted-foreground">{t.category}</p>
              </div>
              <span className="w-32 shrink-0 text-xs rounded-full border px-2 py-1 text-center capitalize">
                {t.status}
              </span>
              <span className="flex-1 text-sm">
                {t.assignee || "Unassigned"}
              </span>
              <span className="text-xs text-muted-foreground">
                {t.nextPromise || ""}
              </span>
              <span>›</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
