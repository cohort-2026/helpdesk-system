import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignInPage from '../pages/Auth pages/SignInPage';
import EmployeeHomePage from '../pages/employee/EmployeeHomePage';
import AgentHomePage from '../pages/agent/AgentHomePage';
import DepartmentLeadHomePage from '../pages/department lead/DepartmentLeadHomePage';
import SystemAdminHomePage from '../pages/system admin/SystemAdminHomePage';
import PlatformAdminHomePage from '../pages/platform admin/PlatformAdminHomePage';
import ProtectedRoute from '../components/ProtectedRoute';
import EmployeeSubmitRequest from '../pages/employee/EmployeeSubmitRequest';
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<SignInPage />} />

        {/* Protected Employee Routes */}
        <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
          <Route path="/employee" element={<EmployeeHomePage />}>
            <Route index element={<EmployeeDashboard />} />
            <Route path="my-requests" element={<EmployeeDashboard />} />
            <Route path="submit-request" element={<EmployeeSubmitRequest />} />
          </Route>
        </Route>

        {/* Protected Agent Routes */}
        <Route element={<ProtectedRoute allowedRoles={['agent']} />}>
          <Route path="/agent" element={<AgentHomePage />}>
            {/* Child routes for agent can be added here similar to employee, for now we will just render AgentHomePage's layout */}
            <Route path="ticket-queue" element={<div className="p-4">Ticket Queue</div>} />
            <Route path="assigned-tickets" element={<div className="p-4">Assigned Tickets</div>} />
            <Route path="resolved-tickets" element={<div className="p-4">Resolved Tickets</div>} />
          </Route>
        </Route>

        {/* Protected Department Lead Routes */}
        <Route element={<ProtectedRoute allowedRoles={['department lead']} />}>
          <Route path="/department-lead" element={<DepartmentLeadHomePage />} />
        </Route>

        {/* Protected System Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['system admin']} />}>
          <Route path="/system-admin" element={<SystemAdminHomePage />} />
        </Route>

        {/* Protected Platform Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['platform admin']} />}>
          <Route path="/platform-admin" element={<PlatformAdminHomePage />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
