import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import EmployeeHome from "../pages/employee/EmployeeHome";
import UserProfile from "../pages/userProfile/UserProfile";
import AgentHome from "../pages/agent/AgentHome";
import ProtectedRoute from "../components/ProtectedRoute";
import DepartmentLeadHome from "../pages/department/DepartmentLeadHome";
import SystemAdminHome from "../pages/systemAdmin/SystemAdminHome";
import PlatformAdminHome from "../pages/platform/PlatformAdminHome";
import SignIn from "../pages/auth/SignIn";
import ResetPassword from "../pages/auth/RestPassword";
import ForgotPassword from "../pages/auth/ForgotPassword";
import MyOpen from "../pages/agent/MyOpen";


const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<SignIn/>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Employee Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Employee"]} />}>
          <Route path="/employee" element={<EmployeeHome />}>
            <Route index element={<EmployeeHome />} />
            <Route path="my-requests" />
            <Route path="tickets/:id" />
            <Route path="submit-request"/>
            <Route path="profile" element={<UserProfile />} />
          </Route>
        </Route>

        {/* Protected Agent Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Agent"]} />}>
          <Route path="/agent">
          <Route path="/agent" element={<AgentHome />} />
          <Route path="/agent/open" element={<MyOpen />} />
            <Route index element={<AgentHome />}  />
            <Route path="ticket-queue" />
            <Route path="assigned-tickets" />
            <Route path="resolved-tickets"  />
            <Route path="tickets/:id" />
            <Route path="profile" element={<UserProfile />} />
          </Route>
        </Route>

        {/* Protected Department Lead Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Department Lead"]} />}>
          <Route path="/department-lead" element={<DepartmentLeadHome />}>
            <Route path="ticket-queue" />
            <Route path="approvals"/>
            <Route path="team" />
            <Route path="reports"  />
            <Route path="tickets/:id" />
            <Route path="profile" element={<UserProfile />} />
          </Route>
        </Route>

        {/* Protected System Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["System Admin"]} />}>
          <Route path="/system-admin" element={<SystemAdminHome />}>
            <Route path="users"  />
            <Route path="departments" />
            <Route path="reports"  />
            <Route path="tickets/:id"  />
            <Route path="profile" element={<UserProfile />} />
          </Route>
        </Route>

        {/* Protected Platform Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Platform Admin"]} />}>
          <Route path="/platform-admin" element={<PlatformAdminHome />}>
            <Route path="users" />
            <Route path="tickets/:id" />
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
