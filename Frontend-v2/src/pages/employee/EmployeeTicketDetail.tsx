import { useState } from "react";
import {
  ChevronLeft
} from "lucide-react";

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

const RESOLVE_WINDOW_DAYS = 5;

const LERATO = { name: "Lerato Mokoena", initials: "LM", you: true, color: "bg-emerald-700" };
const THABO = { name: "Thabo Nkosi", initials: "TN", team: "IT Support", color: "bg-indigo-700" };

const at = (day, h, m) => new Date(2026, 10, day, h, m).toISOString();
const todayAt = (h, m) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

const sampleRequest = {
  id: "HD-1048",
  title: "VPN drops every 10 minutes on home fibre",
  status: "open",
  category: "Network, Wi-Fi & VPN",
  team: "IT Support",
  priority: "high",
  submittedAt: at(10, 8, 14),
  nextUpdateAt: todayAt(16, 14),
  resolvedAt: null,
  approver: null,
  agent: THABO,
  timeline: [
    { id: "t1", kind: "event", icon: "submitted", at: at(10, 8, 14), parts: ["You submitted this request \u00B7 Network, Wi-Fi & VPN"] },
    {
      id: "t2", kind: "reply", author: LERATO, at: at(10, 8, 14),
      body: "Since Monday my VPN (FortiClient) disconnects roughly every 10 minutes when I work from home in Midrand. Office Wi-Fi is fine. Month-end close is Friday, so this is urgent for me.",
      attachments: [],
    },
    { id: "t3", kind: "event", icon: "picked", at: at(10, 8, 31), parts: [{ b: "Thabo Nkosi" }, " picked this up"] },
    {
      id: "t4", kind: "reply", author: THABO, at: at(10, 9, 2),
      body: "Hi Lerato, thanks for the detail. Please switch to the \u201CJohannesburg-TCP\u201D profile in FortiClient and follow the check in the attached guide. Send me a screenshot of the result and I'll take it from there.",
      attachments: [{ name: "vpn-check-guide.pdf", size: "240 KB" }],
    },
    { id: "t5", kind: "event", icon: "waiting", at: at(10, 9, 2), parts: ["Status changed to ", { b: "Waiting on you", tone: "amber" }] },
    {
      id: "t6", kind: "reply", author: LERATO, at: at(10, 11, 40),
      body: "Done, screenshot attached. The TCP profile has held for 40 minutes so far!",
      attachments: [{ name: "vpn-check.png", size: "184 KB" }],
    },
    { id: "t7", kind: "event", icon: "status", at: at(10, 11, 40), parts: ["Status changed to ", { b: "Open", tone: "indigo" }, " (you replied)"] },
  ],
};

const dayDiff = (a, b) =>
  Math.round(
    (new Date(a.getFullYear(), a.getMonth(), a.getDate()) -
      new Date(b.getFullYear(), b.getMonth(), b.getDate())) / 86_400_000
  );

export default function HelpdeskRequestDetail({
  request: initial = sampleRequest,
  onBack,
  onSendReply,
  onCancelRequest,
  onConfirmFixed,
  onStillBroken,
  onRate,
}) {
  const [request, setRequest] = useState(initial);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(null);

  const { status, agent } = request;
  const terminal = status === "closed" || status === "cancelled";

  // Adds a status change to the request and the public timeline
  const change = (next, event) =>
    setRequest((r) => ({
      ...r,
      status: next,
      timeline: [...r.timeline, { id: crypto.randomUUID(), kind: "event", at: new Date().toISOString(), ...event }],
    }));

  const sendReply = ({ body, files }) => {
    onSendReply?.({ body, files });
    const reply = {
      id: crypto.randomUUID(),
      kind: "reply",
      author: LERATO,
      at: new Date().toISOString(),
      body,
      attachments: files.map((f) => ({ name: f.name, size: `${Math.max(1, Math.round(f.size / 1024))} KB` })),
    };
    setRequest((r) => ({ ...r, timeline: [...r.timeline, reply] }));
    // Replying hands the ball back to the team
    if (status === "waiting_on_you" || status === "resolved") {
      change("open", {
        icon: "status",
        parts: ["Status changed to ", { b: "Open", tone: "indigo" }, " (you replied)"],
      });
    }
  };

  const cancel = () => {
    onCancelRequest?.(request);
    change("cancelled", { icon: "cancelled", parts: ["You cancelled this request"] });
    setConfirmCancel(false);
  };

  const confirmFixed = () => {
    onConfirmFixed?.(request);
    change("closed", {
      icon: "fixed",
      parts: ["You confirmed it's fixed \u00B7 Status changed to ", { b: "Closed", tone: "emerald" }],
    });
    setShowRating(true);
  };

  const stillBroken = () => {
    onStillBroken?.(request);
    change("open", {
      icon: "status",
      parts: ["Status changed to ", { b: "Open", tone: "indigo" }, " (you said it's still broken)"],
    });
  };

  const rate = (n) => {
    setRating(n);
    onRate?.(n);
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
            onClick={onBack}
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
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{request.title}</h1>
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
                placeholder={"Add a reply\u2026"}
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
              <ResolvedCard agent={agent} daysLeft={daysLeft} onFixed={confirmFixed} onStillBroken={stillBroken} />
            )}

            {status === "closed" && showRating && <RatingCard rating={rating} onRate={rate} />}
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
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={cancel}>
              Cancel request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
