import { useState } from "react"
import { useParams } from "react-router"
import { AgentSidebar } from "#components/AgentHome/agentsidebar"
import type { Priority } from "#components/AgentHome/prioritybadge"
import { TicketListPane } from "#components/TicketInbox/Ticket-List-Pane"
import { TicketConversationPane } from "#components/TicketInbox/Ticket-conversation-pane"
import { TicketPropertiesPane } from "#components/TicketInbox/Ticket-properties-pane"
import {
  INITIAL_TICKETS,
  INITIAL_TIMELINES,
  PRIORITY_LABEL,
  firstName,
  type Status,
  type TimelineItem,
} from "../components/TicketInbox/ticket-data"

const timeNow = () =>
  new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })

export default function TicketInbox() {
  const { id } = useParams() // the HD-1048 part of /agent/tickets/HD-1048
  const [tickets, setTickets] = useState(INITIAL_TICKETS)
  const [timelines, setTimelines] = useState(INITIAL_TIMELINES)

  const ticket = tickets.find((t) => t.id === id)

  const addToTimeline = (ticketId: string, item: TimelineItem) => {
    setTimelines((old) => ({ ...old, [ticketId]: [...(old[ticketId] ?? []), item] }))
  }

  const makeEvent = (text: string): TimelineItem => ({
    kind: "event",
    id: crypto.randomUUID(),
    text,
    time: timeNow(),
  })

  const setStatus = (status: Status) => {
    if (!ticket) return
    setTickets((old) => old.map((t) => (t.id === ticket.id ? { ...t, status } : t)))
    addToTimeline(ticket.id, makeEvent(`Thabo Nkosi set status to ${status}`))
  }

  const changePriority = (priority: Priority) => {
    if (!ticket || priority === ticket.priority) return
    setTickets((old) => old.map((t) => (t.id === ticket.id ? { ...t, priority } : t)))
    addToTimeline(
      ticket.id,
      makeEvent(
        `Thabo Nkosi changed priority ${PRIORITY_LABEL[ticket.priority]} → ${PRIORITY_LABEL[priority]}`
      )
    )
  }

  // Later, send this to your API too
  const sendMessage = (text: string, internal: boolean, setWaiting: boolean) => {
    if (!ticket) return
    addToTimeline(ticket.id, {
      kind: "reply",
      id: crypto.randomUUID(),
      author: "Thabo Nkosi",
      initials: "TN",
      colour: "bg-indigo-600",
      role: internal ? undefined : `to ${firstName(ticket.requester)}`,
      body: text,
      time: timeNow(),
      internal,
    })
    if (setWaiting) setStatus("Waiting on employee")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white text-slate-900">
      <AgentSidebar activePath="/agent/open" />
      <TicketListPane tickets={tickets} selectedId={id} />

      {ticket ? (
        <>
          <TicketConversationPane
            ticket={ticket}
            timeline={timelines[ticket.id] ?? []}
            onSetStatus={setStatus}
            onSend={sendMessage}
          />
          <TicketPropertiesPane ticket={ticket} onChangePriority={changePriority} />
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center bg-slate-50 text-xs text-slate-500">
          {id ? "Ticket not found." : "Pick a ticket from the list to open it."}
        </div>
      )}
    </div>
  )
}