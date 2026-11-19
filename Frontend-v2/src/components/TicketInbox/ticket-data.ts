import type { Priority } from "#components/AgentHome/prioritybadge"
import type { SlaState } from "#components/AgentHome/sla-chip"

export type Status = "Open" | "Waiting on employee" | "Resolved"

export type Ticket = {
  id: string
  title: string
  requester: string
  initials: string
  colour: string // avatar colour
  requesterInfo: string
  category: string
  priority: Priority
  status: Status
  sla: SlaState
  slaText: string
  tags: string[]
  created: string
  related?: { id: string; title: string }
}

// One thing in the conversation: either a grey "event" line or a message
export type TimelineItem =
  | { kind: "event"; id: string; text: string; time: string }
  | {
      kind: "reply"
      id: string
      author: string
      initials: string
      colour: string
      role?: string
      body: string
      time: string
      internal?: boolean
      file?: string
    }

export const PRIORITY_LABEL: Record<Priority, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Normal",
  low: "Low",
}

export const firstName = (fullName: string) => fullName.split(" ")[0]

// The time label to show for a ticket (changes when it is waiting or resolved)
export function slaOf(t: Ticket): { state: SlaState; text: string } {
  if (t.status === "Waiting on employee") return { state: "waiting", text: "Waiting" }
  if (t.status === "Resolved") return { state: "due", text: "Resolved" }
  return { state: t.sla, text: t.slaText }
}

export const INITIAL_TICKETS: Ticket[] = [
  { id: "HD-1045", title: "Can't log in to Sage after password change", requester: "Johan van Wyk", initials: "JW", colour: "bg-orange-500", requesterInfo: "Finance · Sandton", category: "Passwords", priority: "urgent", status: "Open", sla: "breached", slaText: "Breached 25m", tags: ["sage", "password"], created: "Tue 10 Nov, 07:50" },
  { id: "HD-1048", title: "VPN drops every 10 minutes on home fibre", requester: "Lerato Mokoena", initials: "LM", colour: "bg-green-600", requesterInfo: "Finance · Rosebank, Johannesburg", category: "Network & VPN", priority: "high", status: "Open", sla: "soon", slaText: "Due in 1h 54m", tags: ["vpn", "remote-work"], created: "Tue 10 Nov, 08:14", related: { id: "HD-0987", title: "VPN drops (Vumatel CGNAT)" } },
  { id: "HD-1036", title: "Power BI Pro licence (approved)", requester: "Ayesha Patel", initials: "AP", colour: "bg-pink-600", requesterInfo: "Sales · Durban", category: "Software purchase", priority: "medium", status: "Open", sla: "due", slaText: "Due 17:30", tags: ["licence"], created: "Mon 9 Nov, 15:20" },
  { id: "HD-1041", title: "Outlook not syncing on my iPhone", requester: "Lerato Mokoena", initials: "LM", colour: "bg-green-600", requesterInfo: "Finance · Rosebank, Johannesburg", category: "Email & phone", priority: "medium", status: "Waiting on employee", sla: "due", slaText: "Due 16:00", tags: ["outlook", "iphone"], created: "Mon 9 Nov, 11:05" },
  { id: "HD-1031", title: "Dock not detecting second screen", requester: "Pieter Botha", initials: "PB", colour: "bg-blue-600", requesterInfo: "Operations · Midrand", category: "Hardware", priority: "low", status: "Open", sla: "due", slaText: "Due Thu 09:00", tags: ["dock", "monitor"], created: "Mon 9 Nov, 09:30" },
]

export const INITIAL_TIMELINES: Record<string, TimelineItem[]> = {
  "HD-1048": [
    { kind: "event", id: "a1", text: "Lerato Mokoena created this via the portal · Network & VPN", time: "08:14" },
    { kind: "reply", id: "a2", author: "Lerato Mokoena", initials: "LM", colour: "bg-green-600", role: "Requester", time: "08:14", body: "Since Monday my VPN (FortiClient) disconnects roughly every 10 minutes when I work from home in Midrand. Office Wi-Fi is fine. I'm on Vumatel fibre with a Huawei router. Month-end close is Friday, so this is urgent for me." },
    { kind: "event", id: "a3", text: "Thabo Nkosi changed priority Normal → High · due times recalculated", time: "08:31" },
    { kind: "event", id: "a4", text: "Thabo Nkosi claimed · New → Open", time: "08:31" },
    { kind: "reply", id: "a5", author: "Thabo Nkosi", initials: "TN", colour: "bg-indigo-600", internal: true, time: "08:40", body: "FortiGate logs show her sessions dropping on DPD timeout. Same pattern as HD-0987 (Vumatel CGNAT). @Sipho Mahlangu was the TCP profile the fix last time?" },
    { kind: "reply", id: "a6", author: "Thabo Nkosi", initials: "TN", colour: "bg-indigo-600", role: "to Lerato", time: "09:02", file: "vpn-check-guide.pdf", body: "Hi Lerato, thanks for the detail. Please switch to the “Johannesburg-TCP” profile in FortiClient and follow the attached guide, then send me a screenshot." },
    { kind: "event", id: "a7", text: "First response sent in 48 min (target 1 h)", time: "09:02" },
  ],
  "HD-1045": [
    { kind: "event", id: "b1", text: "Johan van Wyk created this via the portal · Passwords", time: "07:50" },
    { kind: "reply", id: "b2", author: "Johan van Wyk", initials: "JW", colour: "bg-orange-500", role: "Requester", time: "07:50", body: "I changed my password this morning and now Sage says my login is invalid. I can't process payments." },
  ],
  "HD-1036": [
    { kind: "event", id: "c1", text: "Ayesha Patel created this via the portal · Software purchase", time: "15:20" },
    { kind: "reply", id: "c2", author: "Ayesha Patel", initials: "AP", colour: "bg-pink-600", role: "Requester", time: "15:20", body: "Please can I get the Power BI Pro licence? My manager has already approved it." },
  ],
  "HD-1041": [
    { kind: "event", id: "d1", text: "Lerato Mokoena created this via the portal · Email & phone", time: "11:05" },
    { kind: "reply", id: "d2", author: "Lerato Mokoena", initials: "LM", colour: "bg-green-600", role: "Requester", time: "11:05", body: "My Outlook stopped syncing on my iPhone since the last update." },
  ],
  "HD-1031": [
    { kind: "event", id: "e1", text: "Pieter Botha created this via the portal · Hardware", time: "09:30" },
    { kind: "reply", id: "e2", author: "Pieter Botha", initials: "PB", colour: "bg-blue-600", role: "Requester", time: "09:30", body: "My second monitor isn't detected when I plug into the dock." },
  ],
}

