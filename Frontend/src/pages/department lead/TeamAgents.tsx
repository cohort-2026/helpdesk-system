import { useEffect, useState } from "react";
import { fetchAgents } from "../../services/ticketService";
import type { AgentUser } from "../../types/ticket.types";

export default function TeamAgents() {
  const [agents, setAgents] = useState<AgentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAgents() {
      try {
        const list = await fetchAgents();
        setAgents(list);
      } catch (err) {
        console.error("Failed to load team agents:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAgents();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Support Team & Agents</h1>
        <p className="text-sm text-gray-600 mt-1">
          View active support agents available for ticket handling and reassignment.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
          No active support agents found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((ag) => (
            <div
              key={ag.user_id}
              className="bg-white rounded-lg border border-gray-200 p-5 shadow-xs hover:border-gray-300 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                  {ag.name[0]}
                  {ag.surname ? ag.surname[0] : ""}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {ag.name} {ag.surname ? ag.surname : ""}
                  </h3>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                    {ag.role}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 space-y-1 text-xs text-gray-600">
                <p>
                  <span className="text-gray-400">Email:</span> {ag.email}
                </p>
                {ag.department_name && (
                  <p>
                    <span className="text-gray-400">Department:</span> {ag.department_name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
