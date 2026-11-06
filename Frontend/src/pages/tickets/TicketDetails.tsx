import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchTicketById } from "../../services/ticketService";

type Comment = {
  id: number;
  author: string;
  body: string;
  isInternal: boolean;
  createdAt: string;
};

function normalizeRole(user: any): string {
  const raw =
    user?.role ?? user?.user_role ?? user?.role_name ?? user?.userRole ?? "";
  const r = String(raw).trim().toLowerCase();

  if (r === "system admin" || r === "system_admin" || r === "sysadmin")
    return "System Admin";
  if (r === "platform admin" || r === "platform_admin") return "Platform Admin";
  if (r === "department lead" || r === "department_lead" || r === "lead")
    return "Department Lead";
  if (r === "agent" || r === "support agent" || r === "support_agent")
    return "Agent";
  if (r === "employee") return "Employee";

  if (r === "admin") return "System Admin";
  return "Employee";
}

const STATUSES = [
  "Open",
  "In Progress",
  "Pending Approval",
  "Resolved",
  "Closed",
  "Cancelled",
] as const;

export default function TicketDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth() as any;
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: "Lindiwe Jobe",
      body: "Checking budget approval with Finance.",
      isInternal: true,
      createdAt: "Just now",
    },
  ]);
  const [newComment, setNewComment] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [toast, setToast] = useState("");
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };
  // ----------Role permissions ----------
  const userRole = normalizeRole(user);
  const isEmployee = userRole === "Employee";
  const isAgent = userRole === "Agent";
  const isLead = userRole === "Department Lead";
  const isSystemAdmin = userRole === "System Admin";
  const isPlatformAdmin = userRole === "Platform Admin";
  const isAdmin = isSystemAdmin || isPlatformAdmin;

  // Public comments: everyone. Internal notes: Agent + Lead + Admins only.
  const canSeeInternal = !isEmployee;
  const canAddInternal = isAgent || isLead || isAdmin;
  // Status controls: Agent + Admins only (per #70)
  const canChangeStatus = isAgent || isAdmin;
  // Approval & Reassign: Lead + Admins only
  const canApproveReject = isLead || isAdmin;
  const canReassign = isLead || isAdmin;
  const canManage = canChangeStatus || canReassign;

  const visibleComments = comments.filter(
    (c) => !c.isInternal || canSeeInternal,
  );

  // ---------- Load ticket ----------
  useEffect(() => {
    async function loadTicket() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await fetchTicketById(Number(id));
        setTicket(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadTicket();
  }, [id]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setComments([
      ...comments,
      {
        id: Date.now(),
        author: (user as any)?.name ?? "You",
        body: newComment.trim(),
        isInternal: canAddInternal ? isInternalNote : false,
        createdAt: "Just now",
      },
    ]);
    setNewComment("");
    setIsInternalNote(false);
    showToast("Comment posted");
    // TODO: connect to backend - POST /tickets/:id/comments
  };

  const handleStatusChange = (value: string) => {
    if (!ticket) return;
    setTicket({ ...ticket, ticket_status: value });
    showToast(`Status updated to ${value}`);
    // TODO: connect to backend - PATCH /tickets/:id/status
  };

  const handleApprove = () => {
    if (!ticket) return;
    setTicket({ ...ticket, ticket_status: "Approved" });
    showToast("Ticket approved");
    // TODO: connect to backend - PATCH /tickets/:id/approve
  };

  const handleReject = () => {
    if (!ticket) return;
    setTicket({ ...ticket, ticket_status: "Rejected" });
    showToast("Ticket rejected");
    // TODO: connect to backend - PATCH /tickets/:id/reject
  };

  // ---------- Loading skeleton (#70) ----------
  if (loading) {
    return (
      <div className="p-6 space-y-4 max-w-4xl mx-auto">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-2/3" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
        <div className="bg-white rounded-lg shadow p-6 space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
        </div>
        <div className="bg-white rounded-lg shadow p-6 h-40 animate-pulse" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <p className="text-gray-600">Ticket not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back
        </button>
      </div>
    );
  }

  const status = (ticket.ticket_status as string) ?? "Open";
  const isPendingApproval = status === "Pending Approval";
  const isOpen = status === "Open";
  const isInProgress = status === "In Progress";

  const ticketId = ticket.ticket_id ?? ticket.id ?? id;
  const title = ticket.title ?? "Untitled ticket";
  const description = ticket.description ?? "";
  const department = ticket.department ?? ticket.department_name ?? "-";
  const category = ticket.category ?? ticket.category_name ?? "-";
  const requestType = ticket.request_type ?? ticket.requestType ?? "-";
  const priority = ticket.priority ?? "-";
  const requester =
    ticket.requester ?? ticket.requester_name ?? ticket.created_by ?? "-";
  const assignee =
    ticket.assigned_agent ??
    ticket.assignee ??
    ticket.assigned_to ??
    "Unassigned";
  const createdAt = ticket.created_at
    ? new Date(ticket.created_at).toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back
      </button>

      {/* Header - DYNAMIC, not hard-coded */}
      <div>
        <h1 className="text-2xl font-bold">
          HD-{ticketId} - {title}
        </h1>
        <div className="flex gap-2 mt-2">
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            {priority}
          </span>
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold">Details</h2>
        <p className="text-sm text-gray-700">{description}</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Department</p>
            <p className="font-medium">{department}</p>
          </div>
          <div>
            <p className="text-gray-500">Category</p>
            <p className="font-medium">{category}</p>
          </div>
          <div>
            <p className="text-gray-500">Request Type</p>
            <p className="font-medium">{requestType}</p>
          </div>
          <div>
            <p className="text-gray-500">Priority</p>
            <p className="font-medium">{priority}</p>
          </div>
          <div>
            <p className="text-gray-500">Requester</p>
            <p className="font-medium">{requester}</p>
          </div>
          <div>
            <p className="text-gray-500">Assigned Agent</p>
            <p className="font-medium">{assignee}</p>
          </div>
          <div>
            <p className="text-gray-500">Created</p>
            <p className="font-medium">{createdAt}</p>
          </div>
          <div>
            <p className="text-gray-500">Status</p>
            <p className="font-medium">{status}</p>
          </div>
        </div>
      </div>

      {/* Approval - Lead + Admins only, only when Pending Approval */}
      {canApproveReject && isPendingApproval && (
        <div className="bg-white rounded-lg shadow p-6 space-y-3">
          <h2 className="text-sm font-semibold">
            Approval needed - Department Lead only
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleApprove}
              className="px-4 py-2 bg-black text-white text-sm rounded"
            >
              Approve
            </button>
            <button
              onClick={handleReject}
              className="px-4 py-2 bg-white border text-sm rounded"
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Comment Thread - #70 */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold">Comments</h2>

        {visibleComments.length === 0 ? (
          <p className="text-sm text-gray-500">No comments yet.</p>
        ) : (
          visibleComments.map((c) => (
            <div
              key={c.id}
              className={`p-3 rounded-md border ${
                c.isInternal
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{c.author}</span>
                {c.isInternal && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-200">
                    Internal Note
                  </span>
                )}
                <span className="text-xs text-gray-500">{c.createdAt}</span>
              </div>
              <p className="text-sm mt-1">{c.body}</p>
            </div>
          ))
        )}

        {/* Add comment */}
        <div className="space-y-2 pt-2 border-t">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            className="w-full border rounded-md p-2 text-sm"
          />
          {canAddInternal && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isInternalNote}
                onChange={(e) => setIsInternalNote(e.target.checked)}
              />
              Internal Note - only visible to Agents / Leads
            </label>
          )}
          <button
            onClick={handleAddComment}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            Post Comment
          </button>
          {toast && <p className="text-sm text-green-600">{toast}</p>}
        </div>
      </div>

      {/* Manage Ticket - NEVER for Employee (#70) */}
      {canManage && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold">Manage Ticket</h2>

          {/* Status dropdown - Agent + Admins only */}
          {canChangeStatus && (
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full border rounded-md p-2 text-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Reassign - Lead + Admins only */}
          {canReassign && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Reassign to
              </label>
              <select
                value={(ticket as any)?.assigned_agent ?? ""}
                onChange={(e) => {
                  if (!ticket) return;
                  setTicket({ ...ticket, assigned_agent: e.target.value });
                  showToast(`Reassigned to ${e.target.value}`);
                  // TODO: connect to backend - PATCH /tickets/:id/reassign
                }}
                className="w-full border rounded-md p-2 text-sm"
              >
                <option value="">Select agent...</option>
                <option value="Agent 1">Agent 1</option>
                <option value="Agent 2">Agent 2</option>
                <option value="Agent 3">Agent 3</option>
              </select>
            </div>
          )}
          {toast && <p className="text-sm text-green-600">{toast}</p>}
        </div>
      )}

      {/* Quick Actions - Agent / Lead / Admins */}
      {(isAgent || isLead || isAdmin) && (
        <div className="flex flex-wrap gap-3">
          {isOpen && (
            <button
              onClick={() => handleStatusChange("In Progress")}
              className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm"
            >
              Start Work
            </button>
          )}
          {isInProgress && (
            <button
              onClick={() => handleStatusChange("Resolved")}
              className="px-4 py-2 rounded-md bg-green-600 text-white text-sm"
            >
              Mark as Resolved
            </button>
          )}
          {canApproveReject && isPendingApproval && (
            <>
              <button
                onClick={handleApprove}
                className="px-4 py-2 rounded-md bg-green-600 text-white text-sm"
              >
                Approve
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded-md bg-red-600 text-white text-sm"
              >
                Reject
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
