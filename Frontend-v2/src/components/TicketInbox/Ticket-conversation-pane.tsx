import { useEffect, useRef, useState } from "react"
import { AtSign, Check, ChevronDown, Lock, MoreHorizontal, Paperclip, Zap } from "lucide-react"
import { Avatar, AvatarFallback } from "#components/ui/avatar"
import { Badge } from "#components/ui/badge"
import { Button } from "#components/ui/button"
import { firstName, type Status, type Ticket, type TimelineItem } from "./ticket-data"

export function TicketConversationPane({
  ticket,
  timeline,
  commentsLoading = false,
  agentName,
  agentInitials,
  onSetStatus,
  onSend,
}: {
  ticket: Ticket
  timeline: TimelineItem[]
  commentsLoading?: boolean
  agentName: string
  agentInitials: string
  onSetStatus: (status: Status) => void
  onSend: (text: string, internal: boolean, setWaiting: boolean) => void
}) {
  const [tab, setTab] = useState<"public" | "internal">("public")
  const [text, setText] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Scroll to the newest message when something is added
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [timeline.length, ticket.id])

  const send = (setWaiting: boolean) => {
    if (!text.trim()) return
    onSend(text.trim(), tab === "internal", setWaiting)
    setText("")
    setMenuOpen(false)
  }

  const internal = tab === "internal"

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-slate-50">
      {/* ---------- Title + action bar ---------- */}
      <div className="border-b bg-white px-5 py-3">
        <p className="text-[11px] text-slate-500">
          IT Support · <span className="font-mono">{ticket.id}</span>
        </p>
        <h1 className="mt-0.5 text-sm font-semibold">{ticket.title}</h1>

        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
          <Button
            variant={ticket.status === "Open" ? "secondary" : "outline"}
            onClick={() => onSetStatus("Open")}
            className="h-7 rounded-md px-2.5 text-[11px]"
          >
            Open
          </Button>
          <Button
            variant={ticket.status === "Waiting on employee" ? "secondary" : "outline"}
            onClick={() => onSetStatus("Waiting on employee")}
            className="h-7 rounded-md px-2.5 text-[11px]"
          >
            Waiting on employee
          </Button>
          <Button
            variant={ticket.status === "Pending approval" ? "secondary" : "outline"}
            onClick={() => onSetStatus("Pending approval")}
            className="h-7 rounded-md px-2.5 text-[11px]"
          >
            Pending approval
          </Button>
          <Button
            variant={ticket.status === "Resolved" ? "secondary" : "default"}
            onClick={() => onSetStatus("Resolved")}
            className="h-7 gap-1 rounded-md bg-indigo-600 px-2.5 text-[11px] text-white hover:bg-indigo-700"
          >
            <Check className="size-3" /> Resolve
          </Button>
          <Button
            variant={ticket.status === "Closed" ? "secondary" : "outline"}
            onClick={() => onSetStatus("Closed")}
            className="h-7 rounded-md px-2.5 text-[11px]"
          >
            Close
          </Button>
        </div>
      </div>

      {/* ---------- Messages ---------- */}
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {commentsLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border bg-white p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="size-5 rounded-full bg-slate-200" />
                  <div className="h-2.5 w-24 rounded bg-slate-200" />
                </div>
                <div className="h-2 w-full rounded bg-slate-200" />
                <div className="h-2 w-3/4 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : timeline.length === 0 ? (
          <p className="text-center text-xs text-slate-400 mt-8">No messages yet.</p>
        ) : (
          timeline.map((item) =>
          item.kind === "event" ? (
            // Grey line for things that happened (status changes, etc.)
            <div key={item.id} className="flex items-center gap-2 px-1 text-[11px] text-slate-500">
              <span className="size-1.5 rounded-full bg-slate-300" />
              <span className="flex-1">{item.text}</span>
              <span>{item.time}</span>
            </div>
          ) : (
            // White box for replies, yellow box for internal notes
            <div
              key={item.id}
              className={`rounded-lg border p-3 ${
                item.internal ? "border-amber-200 bg-amber-50" : "bg-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <Avatar className="size-5">
                  <AvatarFallback className={`${item.colour} text-[8px] font-semibold text-white`}>
                    {item.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-semibold">{item.author}</span>
                {item.role && <span className="text-[11px] text-slate-500">{item.role}</span>}
                {item.internal && (
                  <Badge variant="outline" className="h-4 gap-0.5 rounded px-1.5 py-0 text-[10px] font-medium text-amber-800 border-amber-300 bg-amber-100">
                    <Lock className="size-2.5" /> Internal note
                  </Badge>
                )}
                <span className="flex-1" />
                <span className="text-[11px] text-slate-500">{item.time}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed">{item.body}</p>
              {item.file && (
                <span className="mt-2 inline-flex items-center gap-1 rounded-md border bg-white px-2 py-1 text-[11px] text-slate-600">
                  <Paperclip className="size-3" /> {item.file}
                </span>
              )}
            </div>
          )
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ---------- Reply box ---------- */}
      <div className="border-t bg-white p-3">
        <div className={`rounded-lg border ${internal ? "border-amber-200 bg-amber-50" : "bg-white"}`}>
          <div className="flex items-center justify-between px-2 pt-2">
            <div className="inline-flex gap-0.5 rounded-md bg-slate-100 p-0.5">
              <button
                type="button"
                onClick={() => setTab("public")}
                className={`rounded px-2.5 py-1 text-[11px] ${!internal ? "bg-white font-medium shadow-sm" : "text-slate-500"}`}
              >
                Public reply
              </button>
              <button
                type="button"
                onClick={() => setTab("internal")}
                className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-[11px] ${internal ? "bg-white font-medium shadow-sm" : "text-slate-500"}`}
              >
                <Lock className="size-3" /> Internal note
              </button>
            </div>
            <span className="text-[10px] text-slate-500">
              {internal ? "Only agents can see this" : `Emailed to ${firstName(ticket.requester)}`}
            </span>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder={internal ? "Write a note only agents can see…" : `Reply to ${firstName(ticket.requester)}…`}
            className="w-full resize-none bg-transparent px-3 py-2 text-xs outline-none placeholder:text-slate-400"
          />

          <div className="flex items-center gap-1.5 px-2 pb-2">
            <button type="button" className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700">
              <Zap className="size-3" /> Macros
            </button>
            <button type="button" aria-label="Attach a file" className="rounded p-1 text-slate-500 hover:bg-slate-100">
              <Paperclip className="size-3.5" />
            </button>
            <button type="button" aria-label="Mention someone" className="rounded p-1 text-slate-500 hover:bg-slate-100">
              <AtSign className="size-3.5" />
            </button>
            <span className="flex-1" />

            {/* Send button with a small menu next to it */}
            <div className="relative flex">
              <Button
                onClick={() => send(false)}
                disabled={!text.trim()}
                className={`h-7 bg-indigo-600 px-3 text-[11px] text-white hover:bg-indigo-700 ${internal ? "rounded-md" : "rounded-r-none"}`}
              >
                {internal ? "Add note" : "Send reply"}
              </Button>
              {!internal && (
                <>
                  <Button
                    onClick={() => setMenuOpen((open) => !open)}
                    aria-label="More send options"
                    className="h-7 rounded-l-none border-l border-indigo-400 bg-indigo-600 px-1.5 text-white hover:bg-indigo-700"
                  >
                    <ChevronDown className="size-3" />
                  </Button>
                  {menuOpen && (
                    <div className="absolute bottom-9 right-0 z-10 w-56 rounded-md border bg-white p-1 shadow-md">
                      <button
                        type="button"
                        onClick={() => send(true)}
                        disabled={!text.trim()}
                        className="w-full rounded px-2 py-1.5 text-left text-xs hover:bg-slate-100 disabled:opacity-50"
                      >
                        Send and set Waiting on employee
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}