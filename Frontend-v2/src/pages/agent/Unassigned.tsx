import { AgentSidebar } from "#components/AgentHome/agentsidebar"

export default function Unassigned() {
  return (
    <div className="flex min-h-screen bg-white text-slate-900">
      <AgentSidebar activePath="/agent/ticket-queue" />

      <main className="min-w-0 flex-1 p-6">
        <h1 className="text-[15px] font-semibold">Unassigned</h1>
      </main>
    </div>
  )
}