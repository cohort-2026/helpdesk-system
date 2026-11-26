import { useState } from "react";
import { Link } from "react-router";
import { useTickets } from "#hooks/useTickets";
import { Button } from "../../../components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import TicketStatusBadge from "#components/TicketStatusBagde";
import PersonAvatar from "#components/PersonAvatar";

const tabs = ["Active", "Waiting on you", "Resolved", "Closed", "Cancelled"];

function isWaiting(status: string) {
  return status === "Pending approval";
}

function isActive(status: string) {
  return !["Resolved", "Closed", "Cancelled"].includes(status);
}

function formatCreatedAt(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : `Opened ${date.toLocaleDateString()}`;
}

export default function MyRequests() {
  const [tab, setTab] = useState("Active");
  // const { user, loading: authLoading } = useAuth();
  // const userId = user?.id || user?.user_id;
  const { tickets, loading, error, refetch } = useTickets({
    filters: { limit: 100 },
    autoFetch: true,
  });

  const countFor = (label: string) => {
    if (label === "Active")
      return tickets.filter((ticket) => isActive(ticket.ticket_status)).length;
    if (label === "Waiting on you")
      return tickets.filter((ticket) => isWaiting(ticket.ticket_status)).length;
    return tickets.filter(
      (ticket) => ticket.ticket_status.toLowerCase() === label.toLowerCase(),
    ).length;
  };

  const filtered = tickets.filter((ticket) => {
    if (tab === "Active") return isActive(ticket.ticket_status);
    if (tab === "Waiting on you") return isWaiting(ticket.ticket_status);
    return ticket.ticket_status.toLowerCase() === tab.toLowerCase();
  });
  const waitingTicket = tickets.find((ticket) =>
    isWaiting(ticket.ticket_status),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My requests</h1>
          <p className="text-muted-foreground">
            Your requests, and who is working on them.
          </p>
        </div>
        <Button
          asChild
          className="bg-indigo-600 text-white hover:bg-indigo-700"
        >
          <Link to="/employee/submit-request">+ New request</Link>
        </Button>
      </div>

      {waitingTicket && (
        <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm">
            <span className="font-medium">
              {waitingTicket.assignee_name || "Support"} needs a reply from you
              on HD-{waitingTicket.ticket_id}
            </span>
            <br />
            <span className="text-muted-foreground">{waitingTicket.title}</span>
          </p>
          <Button asChild variant="outline" className="bg-white">
            <Link to={`/employee/tickets/${waitingTicket.ticket_id}`}>
              Reply
            </Link>
          </Button>
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {tabs.map((label) => (
            <TabsTrigger key={label} value={label}>
              {label}{" "}
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs">
                {countFor(label)}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-2" aria-label="Loading requests">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-16 animate-pulse rounded-lg border bg-muted/40"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-medium text-red-800">
            Couldn’t load your requests
          </p>
          <p className="mt-1 text-sm text-red-700">{error}</p>
          <Button
            variant="outline"
            className="mt-4 bg-white"
            onClick={() => refetch()}
          >
            Try again
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border p-10 text-center">
          <p className="font-medium">
            {tickets.length === 0
              ? "No requests yet"
              : `No ${tab.toLowerCase()} requests`}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {tickets.length === 0
              ? "When you submit a request, it will show here. Click it to see details."
              : "Your requests in other statuses are available in the other tabs."}
          </p>
          {tickets.length === 0 && (
            <Button
              asChild
              className="mt-4 bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <Link to="/employee/submit-request">
                Create your first request
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((ticket) => (
            <Link
              key={ticket.ticket_id}
              to={`/employee/tickets/${ticket.ticket_id}`}
              className="flex items-center gap-4 rounded-lg border bg-white px-4 py-3 hover:bg-muted/50"
            >
              <div className="w-48 shrink-0">
                <p className="truncate text-sm font-medium">
                  HD-{ticket.ticket_id} · {ticket.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {ticket.category_name ??
                    ticket.request_type_name ??
                    "Uncategorized"}
                </p>
              </div>
              <span className="w-32 shrink-0 rounded-full border px-2 py-1 text-center text-xs capitalize">
                {ticket.ticket_status}
                {/* <TicketStatusBadge status={ticket.ticket_status.toLowerCase()} /> */}
              </span>
              <span className="flex-1 text-sm">
                {ticket.assignee_name ? (
                  <>
                    <PersonAvatar
                      person={{
                        initials: ticket.assignee_name
                          .split(/\s+/)
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase(),
                        color: "bg-blue-500",
                      }}
                      className="mr-2"
                    />
                    {ticket.assignee_name}
                  </>
                ) : (
                  "Unassigned"
                )}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatCreatedAt(ticket.created_at)}
              </span>
              <span aria-hidden="true">›</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
