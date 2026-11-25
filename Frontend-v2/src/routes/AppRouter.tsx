import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import EmployeeHome from "../pages/employee/EmployeeHome";
import UserProfile from "../pages/userProfile/UserProfile";
import AgentHome from "../pages/agent/AgentHome";
import ProtectedRoute from "../components/ProtectedRoute";
import DepartmentLeadLayout from "../pages/department/DepartmentLeadLayout";
import DepartmentLeadHome from "../pages/department/DepartmentLeadHome";
import DepartmentTicketQueue from "../pages/department/TicketQueue";
import Approvals from "../pages/department/Approvals";
import Team from "../pages/department/Team";
import DepartmentReports from "../pages/department/Reports";
import SystemAdminLayout from "../pages/systemAdmin/SystemAdminLayout";
import SystemAdminHome from "../pages/systemAdmin/SystemAdminHome";
import Users from "../pages/systemAdmin/Users";
import Departments from "../pages/systemAdmin/Departments";
import SystemAdminReports from "../pages/systemAdmin/Reports";
import PlatformAdminLayout from "../pages/platform/PlatformAdminLayout";
import PlatformAdminHome from "../pages/platform/PlatformAdminHome";
import PlatformUsers from "../pages/platform/PlatformUsers";
import TicketDetails from "../pages/tickets/TicketDetails";
import SignIn from "../pages/auth/SignIn";
import ResetPassword from "../pages/auth/RestPassword";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Unassigned from "../pages/agent/Unassigned";
import TicketInbox from "../pages/ticket-inbox";
import SubmitRequest from "@/pages/employee/submit-request/SubmitRequest";
import MyRequests from "@/pages/employee/my-requests/MyRequests";
import EmployeeTicketDetail from "@/pages/employee/EmployeeTicketDetail";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Employee Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Employee"]} />}>
          <Route path="/employee" element={<EmployeeHome />}>
            <Route index element={<MyRequests />} />
            <Route path="my-requests" element={<MyRequests />} />
            <Route path="tickets/:id" element={<EmployeeTicketDetail />} />
            <Route path="submit-request" element={<SubmitRequest />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>
        </Route>

        {/* Protected Agent Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Agent"]} />}>
          <Route path="/agent">
            <Route index element={<AgentHome />} />
            <Route path="open" element={<TicketInbox />} />
            <Route path="ticket-queue" element={<Unassigned />} />
            <Route path="assigned-tickets" />
            <Route path="resolved-tickets" />
            <Route path="tickets/:id" element={<TicketInbox />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>
        </Route>

        {/* Protected Department Lead Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Department Lead"]} />}>
          <Route path="/department-lead" element={<DepartmentLeadLayout />}>
            <Route index element={<DepartmentLeadHome />} />
            <Route path="ticket-queue" element={<DepartmentTicketQueue />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="team" element={<Team />} />
            <Route path="reports" element={<DepartmentReports />} />
            <Route path="tickets/:id" element={<TicketDetails />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>
        </Route>

        {/* Protected System Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["System Admin"]} />}>
          <Route path="/system-admin" element={<SystemAdminLayout />}>
            <Route index element={<SystemAdminHome />} />
            <Route path="users" element={<Users />} />
            <Route path="departments" element={<Departments />} />
            <Route path="reports" element={<SystemAdminReports />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>
        </Route>

        {/* Protected Platform Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Platform Admin"]} />}>
          <Route path="/platform-admin" element={<PlatformAdminLayout />}>
            <Route index element={<PlatformAdminHome />} />
            <Route path="users" element={<PlatformUsers />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
