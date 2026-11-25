import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Ticket = {
  ref: string;
  title: string;
  status: string;
  category: string;
  department: string;
  priority: string;
  submittedAt: string;
  nextUpdateBy: string;
  assigneeName: string;
  timeline: {
    id: string;
    type: "event" | "reply";
    who: string;
    time: string;
    text: string;
    file?: string;
  }[];
};

const STEPS = [
  "Submitted",
  "Assigned",
  "Being worked on",
  "Resolved",
  "Closed",
];

function stepFor(status: string) {
  const s = (status || "").toLowerCase();
  if (s.includes("closed")) return 5;
  if (s.includes("resolved")) return 4;
  if (
    s.includes("progress") ||
    s.includes("working") ||
    s.includes("waiting") ||
    s.includes("open")
  )
    return 3;
  if (s.includes("unassign")) return 1;
  if (s.includes("assign")) return 2;
  return 1;
}

export default function EmployeeTicketDetail() {
  const params = useParams();
  const id = params.id || params.ticketId || params.ticket_id;
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [reply, setReply] = useState("");

  useEffect(() => {
    fetch(`/api/tickets/${id}`)
      .then((r) => r.json())
      .then((data) => {
        const t = data.ticket || data;
        setTicket({
          ...t,
          status: t.ticket_status || t.status,
          category: t.ticket_category_name || t.category,
          team: t.ticket_department_name || t.team,
          priority: t.ticket_priority || t.priority,
        });
      });
  }, [id]);

  if (!ticket) return <p className="p-6">Loading...</p>;

  const step = stepFor(ticket.status);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>{ticket.ref}</CardTitle>
            <Badge>{ticket.status}</Badge>
          </div>
          <p className="text-lg font-medium">{ticket.title}</p>
          <p className="text-sm text-muted-foreground">
            {ticket.assigneeName} from {ticket.department} is working on this
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-2 text-muted-foreground">
            {STEPS.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          {(ticket.timeline || []).map((item) =>
            item.type === "event" ? (
              <p key={item.id} className="text-sm text-muted-foreground">
                {item.text} · {item.time}
              </p>
            ) : (
              <div
                key={item.id}
                className="flex gap-3 border rounded-lg p-3 bg-white"
              >
                <Avatar>
                  <AvatarFallback>
                    {item.who.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {item.who}{" "}
                    <span className="text-muted-foreground">{item.time}</span>
                  </p>
                  <p className="text-sm mt-1">{item.text}</p>
                  {item.file && (
                    <p className="text-xs text-blue-600 mt-1">{item.file}</p>
                  )}
                </div>
              </div>
            ),
          )}
        </CardContent>
      </Card>

      <Card>
        ``
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <p>Reference: {ticket.ref}</p>
          <p>Category: {ticket.category}</p>
          <p>Team: {ticket.department}</p>
          <p>Priority: {ticket.priority}</p>
          <p>Submitted: {ticket.submittedAt}</p>
          <p>Next update by: {ticket.nextUpdateBy}</p>
        </CardContent>
      </Card>

      {ticket.status === "New" && (
        <AlertDialog>
          <AlertDialogTrigger>
            <Button variant="destructive">Cancel request</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <p>Cancel this request?</p>
            <div className="flex gap-2 justify-end">
              <AlertDialogCancel>Keep it</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  fetch(`/api/tickets/${id}/cancel`, { method: "POST" })
                }
              >
                Yes, cancel
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {ticket.status === "Resolved" && (
        <div className="flex gap-2">
          <Button
            onClick={() =>
              fetch(`/api/tickets/${id}/close`, { method: "POST" })
            }
          >
            Yes, it&apos;s fixed
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              fetch(`/api/tickets/${id}/reopen`, { method: "POST" })
            }
          >
            Still broken
          </Button>
        </div>
      )}

      {ticket.status !== "Closed" && (
        <Card>
          <CardContent className="pt-6 space-y-2">
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Reply to Thabo..."
            />
            <Button
              onClick={() =>
                fetch(`/api/tickets/${id}/comments`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ body: reply }),
                })
              }
            >
              Send reply
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
