import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "react-router"
import { AgentSidebar } from "#components/AgentHome/agentsidebar"
import type { Priority } from "#components/AgentHome/prioritybadge"
import { TicketListPane } from "#components/TicketInbox/Ticket-List-Pane"
import { TicketConversationPane } from "#components/TicketInbox/Ticket-conversation-pane"
import { TicketPropertiesPane } from "#components/TicketInbox/Ticket-properties-pane"
import type { Status, Ticket, TimelineItem } from "../components/TicketInbox/ticket-data"
import { PRIORITY_LABEL } from "../components/TicketInbox/ticket-data"
import { useAuth } from "#context/AuthContext"
import { useTickets } from "#hooks/useTickets"
import * as ticketService from "../services/ticketService"
import type { Ticket as ApiTicket, TicketComment } from "../types/ticket.types"

/* ------------------------------------------------------------------
   ADAPTERS — convert API shapes to the shapes the pane components expect
------------------------------------------------------------------ */

/** Map API TicketPriority → PriorityBadge Priority */
function toPriority(p: string): Priority {
  switch (p) {
    case "High":   return "high"
    case "Medium": return "medium"
    case "Low":    return "low"
    default:       return "medium"
  }
}

/** Map API TicketStatus → the UI Status enum */
function toUiStatus(s: string): Status {
  if (s === "Resolved" || s === "Closed") return "Resolved"
  if (s === "Pending approval")           return "Waiting on employee"
  return "Open"
}

/** Map API Ticket → the shape TicketListPane / TicketConversationPane / TicketPropertiesPane expect */
function toUiTicket(t: ApiTicket): Ticket {
  const name     = t.requester_name ?? "Unknown"
  const initials = name
    .split(" ")
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("")

  const AVATAR_COLOURS = [
    "bg-orange-500", "bg-blue-600", "bg-indigo-600",
    "bg-fuchsia-600", "bg-teal-600", "bg-pink-600", "bg-green-600",
  ]
  const colour = AVATAR_COLOURS[name.charCodeAt(0) % AVATAR_COLOURS.length]

  const created = new Date(t.created_at).toLocaleString("en-GB", {
    weekday: "short",
    day:     "numeric",
    month:   "short",
    hour:    "2-digit",
    minute:  "2-digit",
  })

  return {
    id:            `HD-${t.ticket_id}`,
    title:         t.title,
    requester:     name,
    initials,
    colour,
    requesterInfo: t.requester_email ?? "",
    category:      t.category_name ?? t.request_type_name ?? "—",
    priority:      toPriority(t.ticket_priority),
    status:        toUiStatus(t.ticket_status),
    sla:           "due",   // SLA state derived below in slaOf (ticket-data.ts uses this field)
    slaText:       "",      // unused when slaOf is computed from status
    tags:          [],
    created,
  }
}

/** Convert a TicketComment to a TimelineItem "reply" */
function commentToTimeline(c: TicketComment): TimelineItem {
  const name     = c.author_name ?? "Unknown"
  const initials = name
    .split(" ")
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("")

  const COLOURS = [
    "bg-orange-500", "bg-blue-600", "bg-indigo-600",
    "bg-fuchsia-600", "bg-teal-600", "bg-pink-600", "bg-green-600",
  ]
  const colour = COLOURS[name.charCodeAt(0) % COLOURS.length]

  const time = new Date(c.created_at).toLocaleTimeString("en-GB", {
    hour:   "2-digit",
    minute: "2-digit",
  })

  return {
    kind:     "reply",
    id:       String(c.comment_id),
    author:   name,
    initials,
    colour,
    role:     c.author_role ?? undefined,
    body:     c.body,
    time,
    internal: c.is_internal,
  }
}

/* ------------------------------------------------------------------
   THE PAGE
------------------------------------------------------------------ */

const timeNow = () =>
  new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })

export default function TicketInbox() {
  const { id } = useParams()          // e.g. "1048" from /agent/tickets/1048
  const { user } = useAuth()

  const userId       = user?.id || user?.user_id || ""
  const agentName    = [user?.name, user?.surname].filter(Boolean).join(" ") || "Agent"
  const agentInitials = agentName
    .split(" ")
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("")

  /* ---- Fetch the agent's assigned active tickets for the list pane ---- */
  const { tickets: apiTickets, loading: listLoading, refetch } = useTickets({
    filters: {
      assignee_id: userId ? String(userId) : undefined,
      limit: 100,
    },
    autoFetch: !!userId,
  })

  /* ---- Active (non-resolved) tickets shown in the list ---- */
  const uiTickets: Ticket[] = useMemo(
    () =>
      apiTickets
        .filter(
          (t) =>
            t.ticket_status !== "Cancelled",
        )
        .map(toUiTicket),
    [apiTickets],
  )

  /* ---- Resolve the currently open ticket by URL param ---- */
  // id from URL can be numeric ("1048") or prefixed ("HD-1048")
  const normalizedId = id
    ? id.startsWith("HD-")
      ? id
      : `HD-${id}`
    : undefined

  const ticket = uiTickets.find((t) => t.id === normalizedId)
  // Also find the raw API ticket for operations that need ticket_id (number)
  const apiTicketId = ticket
    ? parseInt(ticket.id.replace("HD-", ""), 10)
    : null

  /* ---- Timeline state (server comments + local optimistic additions) ---- */
  const [timelines, setTimelines] = useState<Record<string, TimelineItem[]>>({})
  const [commentsLoading, setCommentsLoading] = useState(false)

  // Load comments whenever the selected ticket changes
  useEffect(() => {
    if (!apiTicketId) return

    setCommentsLoading(true)
    ticketService
      .fetchTicketComments(apiTicketId)
      .then((comments) => {
        setTimelines((prev) => ({
          ...prev,
          [normalizedId!]: comments.map(commentToTimeline),
        }))
      })
      .catch(() => {
        // Keep existing optimistic entries on error
      })
      .finally(() => setCommentsLoading(false))
  }, [apiTicketId, normalizedId])

  /* ---- Local timeline helpers ---- */
  const addToTimeline = (ticketId: string, item: TimelineItem) =>
    setTimelines((old) => ({
      ...old,
      [ticketId]: [...(old[ticketId] ?? []), item],
    }))

  const makeEvent = (text: string): TimelineItem => ({
    kind: "event",
    id:   crypto.randomUUID(),
    text,
    time: timeNow(),
  })

  /* ---- Status change — calls API then refreshes list ---- */
  const setStatus = useCallback(
    async (status: Status) => {
      if (!ticket || !apiTicketId) return

      // Map UI Status → API TicketStatus
      const apiStatus =
        status === "Resolved"             ? "Resolved"
        : status === "Waiting on employee" ? "Pending approval"
        : "In progress"

      // Optimistic local update
      setTimelines((old) => ({
        ...old,
        [ticket.id]: [
          ...(old[ticket.id] ?? []),
          makeEvent(`${agentName} set status to ${status}`),
        ],
      }))

      try {
        await ticketService.updateTicketStatus(apiTicketId, apiStatus)
        refetch()
      } catch {
        // If API call fails the UI shows the event but refetch will reconcile
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ticket, apiTicketId, agentName],
  )

  /* ---- Priority change — calls API then refreshes list ---- */
  const changePriority = useCallback(
    async (priority: Priority) => {
      if (!ticket || priority === ticket.priority || !apiTicketId) return

      const apiPriority =
        priority === "urgent" ? "High"
        : priority === "high"   ? "High"
        : priority === "medium" ? "Medium"
        : "Low"

      addToTimeline(
        ticket.id,
        makeEvent(
          `${agentName} changed priority ${PRIORITY_LABEL[ticket.priority]} → ${PRIORITY_LABEL[priority]}`,
        ),
      )

      try {
        // updateTicketStatus re-used for priority via a future endpoint;
        // for now we store the change locally and persist via ticketService if available
        // ticketService doesn't yet expose updatePriority — keep optimistic only
        void apiPriority // suppress unused warning
      } catch {
        // no-op
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ticket, apiTicketId, agentName],
  )

  /* ---- Send reply / internal note — calls API ---- */
  const sendMessage = useCallback(
    async (text: string, internal: boolean, setWaiting: boolean) => {
      if (!ticket || !apiTicketId) return

      // Optimistic local add
      const optimisticItem: TimelineItem = {
        kind:     "reply",
        id:       crypto.randomUUID(),
        author:   agentName,
        initials: agentInitials,
        colour:   "bg-indigo-600",
        role:     internal ? undefined : `to ${ticket.requester.split(" ")[0]}`,
        body:     text,
        time:     timeNow(),
        internal,
      }
      addToTimeline(ticket.id, optimisticItem)
      if (setWaiting) await setStatus("Waiting on employee")

      try {
        const saved = await ticketService.addTicketComment(apiTicketId, text, internal)
        // Replace optimistic entry with the real one from the server
        setTimelines((old) => ({
          ...old,
          [ticket.id]: (old[ticket.id] ?? []).map((item) =>
            item.id === optimisticItem.id ? commentToTimeline(saved) : item,
          ),
        }))
      } catch {
        // Keep optimistic entry visible even if save fails
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ticket, apiTicketId, agentName, agentInitials, setStatus],
  )

  /* ---- Render ---- */
  const myOpenCount = uiTickets.filter((t) => t.status !== "Resolved").length

  return (
    <div className="flex h-screen overflow-hidden bg-white text-slate-900">
      <AgentSidebar activePath="/agent/open" myOpenCount={myOpenCount} />

      <TicketListPane
        tickets={uiTickets}
        selectedId={normalizedId}
        loading={listLoading}
      />

      {ticket ? (
        <>
          <TicketConversationPane
            ticket={ticket}
            timeline={timelines[ticket.id] ?? []}
            commentsLoading={commentsLoading}
            agentName={agentName}
            agentInitials={agentInitials}
            onSetStatus={setStatus}
            onSend={sendMessage}
          />
          <TicketPropertiesPane
            ticket={ticket}
            agentName={agentName}
            agentInitials={agentInitials}
            onChangePriority={changePriority}
          />
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center bg-slate-50 text-xs text-slate-500">
          {listLoading
            ? "Loading your tickets…"
            : id
              ? "Ticket not found."
              : "Pick a ticket from the list to open it."}
        </div>
      )}
    </div>
  )
}
