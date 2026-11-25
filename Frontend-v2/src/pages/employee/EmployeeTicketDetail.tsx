import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import TicketStatusBadge from "#components/TicketStatusBagde";
import PersonAvatar from "#components/PersonAvatar";
import WhoLine from "#components/WhoLine";
import ProgressBar from "#components/ProgressBar";
import Timeline from "#components/Timeline";
import Composer from "#components/Composer";
import DetailsCard from "#components/DetailsCard";
import ChangeCard from "#components/ChangeCard";
import ResolvedCard from "#components/ResolvedCard";
import GreenCard from "#components/GreenCard";
import RatingCard from "#components/RatingCard";
import { useAuth } from "#context/AuthContext";
import * as ticketService from "../../services/ticketService";
import type { Ticket as ApiTicket, TicketComment } from "../../types/ticket.types";

const RESOLVE_WINDOW_DAYS = 5;

const dayDiff = (a: Date, b: Date) =>
  Math.round(
    (new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime() -
      new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime()) /
      86_400_000
  );

function mapApiStatusToUi(apiStatus: string, hasAssignee: boolean): string {
  switch (apiStatus) {
    case "Pending approval":
      return "pending_approval";
    case "Waiting on employee":
      return "waiting_on_you";
    case "Resolved":
      return "resolved";
    case "Closed":
      return "closed";
    case "Cancelled":
      return "cancelled";
    case "In progress":
      return "open";
    case "Open":
    default:
      return hasAssignee ? "open" : "new";
  }
}

export default function EmployeeTicketDetail({
  request: initialProp,
  onBack: onBackProp,
}: {
  request?: any;
  onBack?: () => void;
}) {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBack = onBackProp || (() => navigate("/employee/my-requests"));

  const rawId = paramId ? paramId.replace("HD-", "") : null;
  const ticketIdNum = rawId && /^\d+$/.test(rawId) ? parseInt(rawId, 10) : null;

  const [loading, setLoading] = useState<boolean>(!initialProp && !!ticketIdNum);
  const [error, setError] = useState<string | null>(null);

  const [apiTicket, setApiTicket] = useState<ApiTicket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [optimisticEvents, setOptimisticEvents] = useState<any[]>([]);

  // Current logged in user representation
  const currentUserObj = useMemo(() => {
    const fullName = [user?.name, user?.surname].filter(Boolean).join(" ") || "You";
    const initials = fullName
      .split(" ")
      .map((w) => w[0]?.toUpperCase() ?? "")
      .slice(0, 2)
      .join("") || "ME";
    return {
      name: fullName,
      initials,
      you: true,
      color: "bg-emerald-700",
    };
  }, [user]);

  // Fetch ticket details, comments, and feedback
  const loadTicket = useCallback(async () => {
    if (!ticketIdNum) return;
    try {
      setLoading(true);
      setError(null);
      const [ticketData, commentList, feedbackData] = await Promise.all([
        ticketService.fetchTicketById(ticketIdNum),
        ticketService.fetchTicketComments(ticketIdNum).catch(() => []),
        ticketService.fetchTicketFeedback(ticketIdNum).catch(() => null),
      ]);
      setApiTicket(ticketData);
      setComments(commentList);
      if (feedbackData?.rating) {
        setRating(feedbackData.rating);
        setShowRating(true);
      }
    } catch (err) {
      console.error("Failed to load ticket:", err);
      setError(err instanceof Error ? err.message : "Failed to load ticket details");
    } finally {
      setLoading(false);
    }
  }, [ticketIdNum]);

  useEffect(() => {
    if (!initialProp && ticketIdNum) {
      loadTicket();
    }
  }, [initialProp, ticketIdNum, loadTicket]);

  // Build the request UI model
  const request = useMemo(() => {
    if (initialProp) return initialProp;
    if (!apiTicket) return null;

    const hasAssignee = !!apiTicket.assignee_id;
    const uiStatus = mapApiStatusToUi(apiTicket.ticket_status, hasAssignee);

    const agentObj = apiTicket.assignee_name
      ? {
          name: apiTicket.assignee_name,
          initials: apiTicket.assignee_name
            .split(" ")
            .map((w) => w[0]?.toUpperCase() ?? "")
            .slice(0, 2)
            .join(""),
          team: apiTicket.department_name || "Support",
          color: "bg-indigo-700",
        }
      : null;

    // Build timeline items
    const timelineItems: any[] = [];

    // 1. Creation event
    timelineItems.push({
      id: "ev_created",
      kind: "event",
      icon: "submitted",
      at: apiTicket.created_at,
      parts: [
        "You submitted this request",
        ...(apiTicket.category_name ? [" · ", apiTicket.category_name] : []),
      ],
    });

    // 2. Initial request description as the first reply
    if (apiTicket.description) {
      timelineItems.push({
        id: "ev_desc",
        kind: "reply",
        author: currentUserObj,
        at: apiTicket.created_at,
        body: apiTicket.description,
        attachments: [],
      });
    }

    // 3. Assignee picked up event
    if (agentObj) {
      timelineItems.push({
        id: "ev_assigned",
        kind: "event",
        icon: "picked",
        at: apiTicket.updated_at || apiTicket.created_at,
        parts: [{ b: agentObj.name }, " picked this up"],
      });
    }

    // 4. Server comments (only visible public comments for employees)
    const sortedComments = [...comments].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    for (const c of sortedComments) {
      if (c.is_internal) continue; // Employee cannot see internal notes
      const isYou = String(c.author_id) === String(user?.id || user?.user_id);
      const author = isYou
        ? currentUserObj
        : {
            name: c.author_name || "Agent",
            initials: (c.author_name || "Agent")
              .split(" ")
              .map((w) => w[0]?.toUpperCase() ?? "")
              .slice(0, 2)
              .join(""),
            team: apiTicket.department_name || "Support",
            color: "bg-indigo-700",
          };

      timelineItems.push({
        id: `c_${c.comment_id}`,
        kind: "reply",
        author,
        at: c.created_at,
        body: c.body,
        attachments: [],
      });
    }

    // 5. Add optimistic events
    for (const opt of optimisticEvents) {
      timelineItems.push(opt);
    }

    return {
      id: `HD-${apiTicket.ticket_id}`,
      title: apiTicket.title,
      status: uiStatus,
      rawStatus: apiTicket.ticket_status,
      category: apiTicket.category_name || "General",
      team: apiTicket.department_name || "IT Support",
      priority: (apiTicket.ticket_priority || "Low").toLowerCase(),
      submittedAt: apiTicket.created_at,
      nextUpdateAt: null,
      resolvedAt:
        apiTicket.ticket_status === "Resolved" || apiTicket.ticket_status === "Closed"
          ? apiTicket.updated_at
          : null,
      approver: null,
      agent: agentObj,
      extra_fields: apiTicket.extra_fields || {},
      timeline: timelineItems,
    };
  }, [initialProp, apiTicket, comments, currentUserObj, optimisticEvents, user]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="mt-3 text-xs text-slate-500">Loading ticket details...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center">
        <p className="text-sm font-medium text-red-600">{error || "Ticket not found"}</p>
        <button
          onClick={handleBack}
          className="mt-4 inline-flex items-center gap-1 rounded-md bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700"
        >
          <ChevronLeft className="size-3.5" /> Back to My Requests
        </button>
      </div>
    );
  }

  const { status, agent } = request;
  const terminal = status === "closed" || status === "cancelled";

  const sendReply = async ({ body, files }: { body: string; files: any[] }) => {
    if (!ticketIdNum) return;

    const reply = {
      id: crypto.randomUUID(),
      kind: "reply",
      author: currentUserObj,
      at: new Date().toISOString(),
      body,
      attachments: files.map((f) => ({
        name: f.name,
        size: `${Math.max(1, Math.round(f.size / 1024))} KB`,
      })),
    };
    setOptimisticEvents((prev) => [...prev, reply]);

    try {
      await ticketService.addTicketComment(ticketIdNum, body, false);

      // If waiting on employee or resolved, replying re-opens the conversation
      if (status === "waiting_on_you" || status === "resolved") {
        await ticketService.updateTicketStatus(ticketIdNum, "Open");
        setOptimisticEvents((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            kind: "event",
            at: new Date().toISOString(),
            parts: ["Status changed to ", { b: "Open", tone: "indigo" }, " (you replied)"],
          },
        ]);
      }
      loadTicket();
    } catch (err) {
      console.error("Failed to send reply:", err);
    }
  };

  const cancel = async () => {
    if (!ticketIdNum) return;
    try {
      await ticketService.updateTicketStatus(ticketIdNum, "Cancelled");
      setOptimisticEvents((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          kind: "event",
          at: new Date().toISOString(),
          parts: ["You cancelled this request"],
        },
      ]);
      setConfirmCancel(false);
      loadTicket();
    } catch (err) {
      console.error("Failed to cancel ticket:", err);
    }
  };

  const confirmFixed = async () => {
    if (!ticketIdNum) return;
    try {
      await ticketService.updateTicketStatus(ticketIdNum, "Closed");
      setOptimisticEvents((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          kind: "event",
          at: new Date().toISOString(),
          parts: [
            "You confirmed it's fixed · Status changed to ",
            { b: "Closed", tone: "emerald" },
          ],
        },
      ]);
      setShowRating(true);
      loadTicket();
    } catch (err) {
      console.error("Failed to close ticket:", err);
    }
  };

  const stillBroken = async () => {
    if (!ticketIdNum) return;
    try {
      await ticketService.updateTicketStatus(ticketIdNum, "Open");
      setOptimisticEvents((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          kind: "event",
          at: new Date().toISOString(),
          parts: [
            "Status changed to ",
            { b: "Open", tone: "indigo" },
            " (you said it's still broken)",
          ],
        },
      ]);
      loadTicket();
    } catch (err) {
      console.error("Failed to reopen ticket:", err);
    }
  };

  const rate = async (n: number) => {
    setRating(n);
    if (!ticketIdNum) return;
    try {
      await ticketService.submitTicketFeedback(ticketIdNum, n);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    }
  };

  const daysLeft = request.resolvedAt
    ? Math.max(0, RESOLVE_WINDOW_DAYS - dayDiff(new Date(), new Date(request.resolvedAt)))
    : RESOLVE_WINDOW_DAYS;

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-5xl space-y-5 px-6 py-5">
        {/* Header */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900"
          >
            <ChevronLeft className="size-3.5" />
            My requests
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-slate-400">{request.id}</span>
              <TicketStatusBadge status={status} />
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              {request.title}
            </h1>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
              {agent && !["new", "pending_approval", "cancelled"].includes(status) && (
                <PersonAvatar person={agent} className="size-4 [&_span]:text-[7px]" />
              )}
              <p>{WhoLine(request)}</p>
            </div>
          </div>

          <ProgressBar status={status} />
        </div>

        {/* Body */}
        <div className="grid gap-5 lg:grid-cols-[1fr_16rem]">
          <section className="min-w-0 space-y-3" aria-label="Conversation">
            <Timeline items={request.timeline} />
            {!terminal && (
              <Composer
                placeholder={"Add a reply…"}
                onSend={sendReply}
              />
            )}
          </section>

          <aside className="space-y-3">
            <DetailsCard request={request} />

            {["new", "pending_approval", "assigned", "open", "waiting_on_you"].includes(status) && (
              <ChangeCard
                canCancel={status === "new" || status === "pending_approval"}
                onCancel={() => setConfirmCancel(true)}
              />
            )}

            {["assigned", "open", "waiting_on_you"].includes(status) && agent && (
              <GreenCard title={`When agent resolves it`}>
                <p>
                  You'll get two buttons here:{" "}
                  <strong className="font-semibold">Yes, it's fixed</strong> or{" "}
                  <strong className="font-semibold">Still broken</strong> (for {RESOLVE_WINDOW_DAYS} days), then a quick rating.
                </p>
              </GreenCard>
            )}

            {status === "resolved" && agent && (
              <ResolvedCard
                agent={agent}
                daysLeft={daysLeft}
                onFixed={confirmFixed}
                onStillBroken={stillBroken}
              />
            )}

            {(status === "closed" || showRating) && (
              <RatingCard rating={rating} onRate={rate} />
            )}
          </aside>
        </div>
      </main>

      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this request?</AlertDialogTitle>
            <AlertDialogDescription>
              {request.team} will be told it's no longer needed. You can always submit a new request later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep request</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={cancel}
            >
              Cancel request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
