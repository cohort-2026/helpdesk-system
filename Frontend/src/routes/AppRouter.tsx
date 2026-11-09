import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import SignInPage from "../pages/Auth pages/SignInPage";
import EmployeeHomePage from "../pages/employee/EmployeeHomePage";
import AgentHomePage from "../pages/agent/AgentHomePage";
import DepartmentLeadHomePage from "../pages/department lead/DepartmentLeadHomePage";
import SystemAdminHomePage from "../pages/system admin/SystemAdminHomePage";
import PlatformAdminHomePage from "../pages/platform admin/PlatformAdminHomePage";
  
import ProtectedRoute from "../components/ProtectedRoute";

import EmployeeSubmitRequest from "../pages/employee/EmployeeSubmitRequest";
import EmployeeDashboard from "../pages/employee/EmployeeDashboard";
import TicketDetails from "../pages/tickets/TicketDetails";

import TicketQueue from "../pages/agent/TicketQueue";
import AssignedTickets from "../pages/agent/AssignedTickets";
import ResolvedTickets from "../pages/agent/ResolvedTickets";
import Dashboard from "../pages/agent/Dashboard";



import Reports from '../pages/department lead/Reports';
import TeamAgents from '../pages/department lead/TeamAgents';
import Approvals from '../pages/department lead/Approvals';
import LeadDashboard from "../pages/department lead/LeadDashboard";
import Users from "../pages/users/Users";
import Departments from "../pages/system admin/Departments";
import UserProfile from "../pages/user profile/UserProfile";

import ForgotPasswordPage from "../pages/Auth pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/Auth pages/ResetPasswordPage";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<SignInPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected Employee Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Employee"]} />}>
          <Route path="/employee" element={<EmployeeHomePage />}>
            <Route index element={<EmployeeDashboard />} />
            <Route path="my-requests" element={<EmployeeDashboard />} />
            <Route path="tickets/:id" element={<TicketDetails />} />
            <Route path="submit-request" element={<EmployeeSubmitRequest />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>
        </Route>

        {/* Protected Agent Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Agent"]} />}>
          <Route path="/agent" element={<AgentHomePage />}>
            <Route index element={<Dashboard />} />
            <Route path="ticket-queue" element={<TicketQueue />} />
            <Route path="assigned-tickets" element={<AssignedTickets />} />
            <Route path="resolved-tickets" element={<ResolvedTickets />} />
            <Route path="tickets/:id" element={<TicketDetails />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>
        </Route>

        {/* Protected Department Lead Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Department Lead"]} />}>
          <Route path="/department-lead" element={<DepartmentLeadHomePage />}>
            <Route index element={<LeadDashboard />} />
            <Route path="ticket-queue" element={<TicketQueue />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="team" element={<TeamAgents />} />
            <Route path="reports" element={<Reports />} />
            <Route path="tickets/:id" element={<TicketDetails />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>
        </Route>

        {/* Protected System Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["System Admin"]} />}>
          <Route path="/system-admin" element={<SystemAdminHomePage />}>
            <Route path="users" element={<Users />} />
            <Route path="departments" element={<Departments />} />
            <Route path="reports" element={<Reports />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>
        </Route>

        {/* Protected Platform Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Platform Admin"]} />}>
          <Route path="/platform-admin" element={<PlatformAdminHomePage />}>
            <Route path="users" element={<Users />} />
            <Route path="tickets/:id" element={<TicketDetails />} />
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
