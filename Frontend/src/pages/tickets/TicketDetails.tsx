import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  fetchTicketById,
  fetchTicketComments,
  addTicketComment,
  updateComment,
  deleteComment,
  submitTicketFeedback,
  updateTicketStatus,
  approveTicket,
  rejectTicket,
  assignTicket,
  fetchAgents,
} from "../../services/ticketService";
import type {
  Ticket,
  TicketComment,
  TicketFeedback,
  AgentUser,
} from "../../types/ticket.types";
import Loader from "../../components/ui/Loader";
import { Button } from "../../components/ui/Button";

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

const ALL_STATUSES = [
  "Open",
  "In progress",
  "Pending approval",
  "Resolved",
  "Closed",
  "Cancelled",
] as const;

export default function TicketDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth() as any;
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [feedback, setFeedback] = useState<TicketFeedback | null>(null);
  const [agents, setAgents] = useState<AgentUser[]>([]);

  // Comment input state
  const [newComment, setNewComment] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Comment editing state
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Feedback input state
  const [starRating, setStarRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Actions loading state
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Role permissions
  const userRole = normalizeRole(user);
  const currentUserId = String(user?.user_id ?? user?.id ?? "");
  const isEmployee = userRole === "Employee";
  const isAgent = userRole === "Agent";
  const isLead = userRole === "Department Lead";
  const isSystemAdmin = userRole === "System Admin";
  const isPlatformAdmin = userRole === "Platform Admin";
  const isAdmin = isSystemAdmin || isPlatformAdmin;

  // Capabilities
  const canSeeInternal = !isEmployee;
  const canAddInternal = isAgent || isLead || isAdmin;
  const canChangeStatus = isAgent || isLead || isAdmin;
  const canApproveReject = isLead || isAdmin;
  const canReassign = isLead || isAdmin;

  // Load ticket & comments
  const loadTicketData = async () => {
    if (!id) return;
    try {
      const ticketIdNum = Number(id);
      const data = await fetchTicketById(ticketIdNum);
      setTicket(data);
      if (data.feedback) {
        setFeedback(data.feedback);
      }

      // Fetch comments
      const commentsData = await fetchTicketComments(ticketIdNum);
      setComments(commentsData);

      // If lead or admin, fetch agent list for reassignment
      if (canReassign) {
        try {
          const agentList = await fetchAgents(
            data.ticket_department_id ?? undefined,
          );
          setAgents(agentList);
        } catch (err) {
          console.warn("Could not load agents list:", err);
        }
      }
    } catch (err: any) {
      console.error("Failed to load ticket:", err);
      showToast(err.message || "Failed to load ticket details", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicketData();
  }, [id, userRole]);

  // Check if comment is editable/deletable by current user
  const canModifyComment = (c: TicketComment): boolean => {
    if (isAdmin) return true;
    if (String(c.author_id) === currentUserId) {
      // Configurable 15 minute window check
      const ageMinutes =
        (Date.now() - new Date(c.created_at).getTime()) / (1000 * 60);
      return ageMinutes <= 15;
    }
    return false;
  };

  // Add Comment
  const handleAddComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newComment.trim() || !ticket) return;

    setSubmittingComment(true);
    try {
      const created = await addTicketComment(
        ticket.ticket_id,
        newComment.trim(),
        canAddInternal ? isInternalNote : false,
      );
      setComments((prev) => [...prev, created]);
      setNewComment("");
      setIsInternalNote(false);
      showToast(
        created.is_internal
          ? "Internal note posted successfully"
          : "Comment posted successfully",
      );
    } catch (err: any) {
      showToast(err.message || "Failed to post comment", "error");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Start Editing Comment
  const handleStartEdit = (c: TicketComment) => {
    setEditingCommentId(c.comment_id);
    setEditingCommentText(c.body);
  };

  // Save Edited Comment
  const handleSaveEdit = async (commentId: number) => {
    if (!editingCommentText.trim()) return;
    setSavingEdit(true);
    try {
      const updated = await updateComment(commentId, editingCommentText.trim());
      setComments((prev) =>
        prev.map((c) =>
          c.comment_id === commentId
            ? { ...c, body: updated.body, updated_at: updated.updated_at }
            : c,
        ),
      );
      setEditingCommentId(null);
      setEditingCommentText("");
      showToast("Comment updated successfully");
    } catch (err: any) {
      showToast(err.message || "Failed to edit comment", "error");
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Comment
  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.comment_id !== commentId));
      showToast("Comment deleted successfully");
    } catch (err: any) {
      showToast(err.message || "Failed to delete comment", "error");
    }
  };

  // Submit Feedback
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) return;
    if (starRating < 1 || starRating > 5) {
      showToast("Please select a rating between 1 and 5 stars.", "error");
      return;
    }

    setSubmittingFeedback(true);
    try {
      const submitted = await submitTicketFeedback(
        ticket.ticket_id,
        starRating,
        feedbackComment.trim() || undefined,
      );
      setFeedback(submitted);
      showToast("Thank you! Feedback submitted successfully.");
    } catch (err: any) {
      showToast(err.message || "Failed to submit feedback", "error");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Update Status
  const handleStatusChange = async (newStatus: string) => {
    if (!ticket || actionLoading) return;
    setActionLoading(true);
    try {
      const updated = await updateTicketStatus(ticket.ticket_id, newStatus);
      setTicket((prev) =>
        prev ? { ...prev, ticket_status: updated.ticket_status } : null,
      );
      showToast(`Status updated to "${newStatus}"`);
      // Reload comments to catch any system audit notes
      const updatedComments = await fetchTicketComments(ticket.ticket_id);
      setComments(updatedComments);
    } catch (err: any) {
      showToast(err.message || "Failed to update status", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Approve Ticket (Lead/Admin)
  const handleApprove = async () => {
    if (!ticket || actionLoading) return;
    const note = window.prompt("Optional approval note:") ?? undefined;
    setActionLoading(true);
    try {
      const updated = await approveTicket(ticket.ticket_id, note);
      setTicket((prev) =>
        prev ? { ...prev, ticket_status: updated.ticket_status } : null,
      );
      showToast("Ticket approved successfully!");
      const updatedComments = await fetchTicketComments(ticket.ticket_id);
      setComments(updatedComments);
    } catch (err: any) {
      showToast(err.message || "Failed to approve ticket", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Reject Ticket (Lead/Admin)
  const handleReject = async () => {
    if (!ticket || actionLoading) return;
    const reason = window.prompt("Please enter the reason for rejection:");
    if (reason === null) return; // User cancelled prompt

    setActionLoading(true);
    try {
      const updated = await rejectTicket(ticket.ticket_id, reason || undefined);
      setTicket((prev) =>
        prev ? { ...prev, ticket_status: updated.ticket_status } : null,
      );
      showToast("Ticket rejected.", "error");
      const updatedComments = await fetchTicketComments(ticket.ticket_id);
      setComments(updatedComments);
    } catch (err: any) {
      showToast(err.message || "Failed to reject ticket", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Reassign Ticket (Lead/Admin)
  const handleReassign = async (newAssigneeId: string) => {
    if (!ticket || actionLoading) return;
    if (!newAssigneeId) return;

    setActionLoading(true);
    try {
      const updated = await assignTicket(ticket.ticket_id, newAssigneeId);
      setTicket((prev) =>
        prev
          ? {
              ...prev,
              assignee_id: updated.assignee_id,
              assignee_name: updated.assignee_name,
              assignee_email: updated.assignee_email,
              ticket_status: updated.ticket_status,
            }
          : null,
      );
      showToast(
        `Ticket reassigned to ${updated.assignee_name || "selected agent"}`,
      );
    } catch (err: any) {
      showToast(err.message || "Failed to reassign ticket", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered comments: employees only see public comments; staff see all
  const visibleComments = useMemo(() => {
    return comments.filter((c) => !c.is_internal || canSeeInternal);
  }, [comments, canSeeInternal]);

  // Loading skeleton
  if (loading) {
    return <Loader />;
  }

  if (!ticket) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center py-12">
        <p className="text-gray-600 text-lg">
          Ticket not found or you are not authorized to view it.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:underline"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  const rawStatus = (ticket.ticket_status as string) || "Open";
  const normalizedStatus = rawStatus.toLowerCase();
  const isPendingApproval = normalizedStatus === "pending approval";
  const isOpen = normalizedStatus === "open";
  const isInProgress = normalizedStatus === "in progress";
  const isResolved = normalizedStatus === "resolved";
  const isClosed = normalizedStatus === "closed";
  const isTerminal = isResolved || isClosed || normalizedStatus === "cancelled";

  const isTicketRequester = String(ticket.requester_id) === currentUserId;

  const priorityColor =
    ticket.ticket_priority === "High"
      ? "bg-red-100 text-red-800 border-red-200"
      : ticket.ticket_priority === "Medium"
        ? "bg-amber-100 text-amber-800 border-amber-200"
        : "bg-blue-100 text-blue-800 border-blue-200";

  const statusColor =
    isResolved || isClosed
      ? "bg-green-100 text-green-800 border-green-200"
      : isPendingApproval
        ? "bg-purple-100 text-purple-800 border-purple-200"
        : isInProgress
          ? "bg-blue-100 text-blue-800 border-blue-200"
          : normalizedStatus === "cancelled"
            ? "bg-gray-100 text-gray-800 border-gray-300"
            : "bg-amber-100 text-amber-800 border-amber-200";

  const formattedDate = (dateVal?: string | Date) => {
    if (!dateVal) return "-";
    return new Date(dateVal).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto pb-16">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-md shadow-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
            toast.type === "error"
              ? "bg-red-600 text-white"
              : "bg-emerald-600 text-white"
          }`}
        >
          {toast.type === "error" ? "⚠️" : "✓"} {toast.message}
        </div>
      )}
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold text-body-text">Ticket Details</h1>
      </div>
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors"
        >
          ← Back
        </button>
      </div>

      {/* Ticket Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
              HD-{ticket.ticket_id}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 border ${priorityColor}`}
            >
              {ticket.ticket_priority} Priority
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 border ${statusColor}`}
            >
              {ticket.ticket_status}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            {ticket.title}
          </h1>
        </div>

        {/* Quick Action Buttons for Agents & Admins */}
        {canChangeStatus && (
          <div className="flex flex-wrap items-center gap-2">
            {isOpen && (
              <Button
                type="button"
                variant="secondary"
                disabled={actionLoading}
                onClick={() => handleStatusChange("In progress")}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm transition disabled:opacity-50"
              >
                Assign to Me
              </Button>
            )}
            {isInProgress && (
              <button
                disabled={actionLoading}
                onClick={() => handleStatusChange("Resolved")}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md shadow-sm transition disabled:opacity-50"
              >
                Mark as Resolved
              </button>
            )}
            {isResolved && (
              <button
                disabled={actionLoading}
                onClick={() => handleStatusChange("Closed")}
                className="px-3.5 py-1.5 bg-gray-800 hover:bg-gray-900 text-white text-xs font-medium rounded-md shadow-sm transition disabled:opacity-50"
              >
                Close Ticket
              </button>
            )}
            {isTerminal && (
              <button
                disabled={actionLoading}
                onClick={() => handleStatusChange("In progress")}
                className="px-3.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium rounded-md shadow-sm transition disabled:opacity-50"
              >
                Re-open
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pending Approval Alert & Actions for Department Lead */}
      {isPendingApproval && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-purple-900">
              Request Pending Approval
            </h3>
            <p className="text-xs text-purple-700 mt-0.5">
              This request requires Department Lead review and authorization
              before work can proceed.
            </p>
          </div>
          {canApproveReject ? (
            <div className="flex items-center gap-2">
              <button
                disabled={actionLoading}
                onClick={handleApprove}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md shadow transition disabled:opacity-50"
              >
                Approve Request
              </button>
              <button
                disabled={actionLoading}
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md shadow transition disabled:opacity-50"
              >
                Reject Request
              </button>
            </div>
          ) : (
            <span className="text-xs font-medium text-purple-600 bg-purple-100 px-3 py-1.5 rounded-full">
              Waiting for Department Lead approval
            </span>
          )}
        </div>
      )}

      {/* Ticket Details Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">
          Ticket Information
        </h2>
        {ticket.description ? (
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-md border border-gray-100">
            {ticket.description}
          </p>
        ) : (
          <p className="text-sm text-gray-400 italic">
            No description provided.
          </p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pt-2">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Department
            </p>
            <p className="font-semibold text-gray-800 mt-0.5">
              {ticket.department_name || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </p>
            <p className="font-semibold text-gray-800 mt-0.5">
              {ticket.category_name || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Request Type
            </p>
            <p className="font-semibold text-gray-800 mt-0.5">
              {ticket.request_type_name || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </p>
            <p className="font-semibold text-gray-800 mt-0.5">
              {formattedDate(ticket.created_at)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Requester
            </p>
            <p className="font-semibold text-gray-800 mt-0.5">
              {ticket.requester_name || "Unknown"}
            </p>
            {ticket.requester_email && (
              <p className="text-xs text-gray-500">{ticket.requester_email}</p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Assigned Agent
            </p>
            <p className="font-semibold text-gray-800 mt-0.5">
              {ticket.assignee_name ? (
                ticket.assignee_name
              ) : (
                <span className="text-amber-600 font-normal">Unassigned</span>
              )}
            </p>
            {ticket.assignee_email && (
              <p className="text-xs text-gray-500">{ticket.assignee_email}</p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Priority
            </p>
            <p className="font-semibold text-gray-800 mt-0.5">
              {ticket.ticket_priority}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </p>
            <p className="font-semibold text-gray-800 mt-0.5">
              {ticket.ticket_status}
            </p>
          </div>
        </div>
      </div>

      {/* Administrative Management: Agent Status Actions & Lead Reassign */}
      {canChangeStatus && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900 flex items-center justify-between">
            <span>Management & Status Actions</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quick Status Select */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Update Ticket Status
              </label>
              <select
                value={ticket.ticket_status}
                disabled={actionLoading}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Lead Reassignment */}
            {canReassign && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Reassign to Agent
                </label>
                <select
                  value={ticket.assignee_id || ""}
                  disabled={actionLoading}
                  onChange={(e) => handleReassign(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                >
                  <option value="">Select support agent...</option>
                  {agents
                    .filter((ag) => ag.role === "Agent")
                    .map((ag) => (
                      <option key={ag.user_id} value={ag.user_id}>
                        {ag.name} {ag.surname ? ag.surname : ""} ({ag.role}) -{" "}
                        {ag.email}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resolution Feedback Section (When Resolved or Closed) */}
      {(isResolved || isClosed) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <span>Resolution Feedback</span>
           
            </h2>
            {feedback && (
              <span className="text-xs text-gray-500">
                Submitted on {formattedDate(feedback.created_at)}
              </span>
            )}
          </div>

          {feedback ? (
            /* Display submitted feedback */
            <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-800">
                  Quality Rating:
                </span>
                <div className="flex items-center text-amber-500 text-lg">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star}>
                      {star <= feedback.rating ? "★" : "☆"}
                    </span>
                  ))}
                </div>
                <span className="text-xs font-semibold text-emerald-800 ml-1">
                  ({feedback.rating} / 5)
                </span>
              </div>
              {feedback.comment && (
                <p className="text-sm text-gray-800 italic bg-white p-3 rounded border border-emerald-100">
                  "{feedback.comment}"
                </p>
              )}
              {feedback.user_name && (
                <p className="text-xs text-emerald-700">
                  Provided by {feedback.user_name}
                </p>
              )}
            </div>
          ) : isTicketRequester ? (
            /* Requester can submit feedback */
            <form
              onSubmit={handleSubmitFeedback}
              className="space-y-4 bg-gray-50 p-4 rounded-md border border-gray-200"
            >
              <p className="text-sm text-gray-700">
                How satisfied are you
                with the resolution provided by our support team?
              </p>

              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Select Rating (1 to 5 Stars) *
                </label>
                <div className="flex items-center gap-1.5 text-2xl cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setStarRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-amber-400 hover:scale-110 transition-transform focus:outline-none"
                    >
                      {star <= (hoverRating || starRating) ? "★" : "☆"}
                    </button>
                  ))}
                  <span className="text-xs font-medium text-gray-600 ml-2">
                    {starRating > 0
                      ? `${starRating} Star${starRating > 1 ? "s" : ""}`
                      : "Click a star to rate"}
                  </span>
                </div>
              </div>

              {/* Commentary */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Optional Feedback / Commentary
                </label>
                <textarea
                  rows={3}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Tell us what went well or how we can improve..."
                  className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={submittingFeedback || starRating === 0}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md shadow transition disabled:opacity-50"
              >
                {submittingFeedback
                  ? "Submitting..."
                  : "Submit Resolution Feedback"}
              </button>
            </form>
          ) : (
            <p className="text-sm text-gray-500 italic">
              Awaiting resolution feedback from ticket requester (
              {ticket.requester_name || "Employee"}).
            </p>
          )}
        </div>
      )}

      {/* Comments & Communication Thread */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <span>Ticket Communication</span>
            <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
              {visibleComments.length}{" "}
              {visibleComments.length === 1 ? "message" : "messages"}
            </span>
          </h2>
          {canSeeInternal && (
            <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
              Internal Notes visible to you
            </span>
          )}
        </div>

        {/* Comment list */}
        <div className="space-y-4">
          {visibleComments.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No comments posted yet. Start the conversation below.
            </div>
          ) : (
            visibleComments.map((c) => {
              const isAuthor = String(c.author_id) === currentUserId;
              const isBeingEdited = editingCommentId === c.comment_id;
              const isInternal = c.is_internal;
              const canModify = canModifyComment(c);

              return (
                <div
                  key={c.comment_id}
                  className={`rounded-lg p-4 border transition-colors ${
                    isInternal
                      ? "bg-amber-50/80 border-amber-300 shadow-xs"
                      : isAuthor
                        ? "bg-blue-50/50 border-blue-200"
                        : "bg-gray-50/80 border-gray-200"
                  }`}
                >
                  {/* Comment Author Header */}
                  <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-gray-100/60">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {c.author_name || "User"}
                      </span>
                      {c.author_role && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200/80 text-gray-700 font-medium">
                          {c.author_role}
                        </span>
                      )}
                      {isInternal && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 font-semibold flex items-center gap-1">
                          Internal Note
                        </span>
                      )}
                      {isAuthor && (
                        <span className="text-xs text-blue-700 font-medium bg-blue-100/60 px-2 py-0.5 rounded">
                          You
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {formattedDate(c.created_at)}
                        {c.updated_at &&
                          c.updated_at !== c.created_at &&
                          " (edited)"}
                      </span>
                    </div>

                    {/* Actions: Edit & Delete if permitted */}
                    {canModify && !isBeingEdited && (
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          onClick={() => handleStartEdit(c)}
                          className="text-gray-500 hover:text-blue-600 font-medium"
                        >
                          Edit
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleDeleteComment(c.comment_id)}
                          className="text-gray-500 hover:text-red-600 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Comment Body or Inline Editor */}
                  {isBeingEdited ? (
                    <div className="space-y-2 mt-2">
                      <textarea
                        rows={3}
                        value={editingCommentText}
                        onChange={(e) => setEditingCommentText(e.target.value)}
                        className="w-full border border-blue-400 rounded-md p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setEditingCommentId(null)}
                          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium rounded"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={savingEdit || !editingCommentText.trim()}
                          onClick={() => handleSaveEdit(c.comment_id)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded disabled:opacity-50"
                        >
                          {savingEdit ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed mt-1">
                      {c.body}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Add Comment / Internal Note Box */}
        <form onSubmit={handleAddComment} className="pt-4 border-t space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              {canAddInternal && isInternalNote
                ? "Post Internal Note (Staff Only)"
                : "Post a Comment"}
            </label>
            {canAddInternal && (
              <label className="flex items-center gap-2 text-xs font-medium text-amber-800 cursor-pointer bg-amber-50 px-2.5 py-1 rounded border border-amber-200 hover:bg-amber-100 transition">
                <input
                  type="checkbox"
                  checked={isInternalNote}
                  onChange={(e) => setIsInternalNote(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                Internal Note
              </label>
            )}
          </div>

          <textarea
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={
              canAddInternal && isInternalNote
                ? "Write an internal note for agents and leads..."
                : "Type a public update or reply..."
            }
            className={`w-full border rounded-md p-3 text-sm focus:outline-none focus:ring-2 transition ${
              canAddInternal && isInternalNote
                ? "border-amber-300 bg-amber-50/40 focus:ring-amber-500"
                : "border-gray-300 bg-white focus:ring-blue-500"
            }`}
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {canAddInternal && isInternalNote
                ? "Internal notes are never sent or visible to employees."
                : "Public comments trigger email notifications to relevant parties."}
            </span>
            <button
              type="submit"
              disabled={submittingComment || !newComment.trim()}
              className={`px-5 py-2 text-white text-xs font-semibold rounded-md shadow-sm transition disabled:opacity-50 ${
                canAddInternal && isInternalNote
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {submittingComment
                ? "Posting..."
                : canAddInternal && isInternalNote
                  ? "Add Internal Note"
                  : "Post Comment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
