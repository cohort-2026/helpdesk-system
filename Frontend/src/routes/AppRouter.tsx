import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import SignInPage from '../pages/Auth pages/SignInPage';
import EmployeeHomePage from '../pages/employee/EmployeeHomePage';
import AgentHomePage from '../pages/agent/AgentHomePage';
import DepartmentLeadHomePage from '../pages/department lead/DepartmentLeadHomePage';
import SystemAdminHomePage from '../pages/system admin/SystemAdminHomePage';
import PlatformAdminHomePage from '../pages/platform admin/PlatformAdminHomePage';

// Components
import ProtectedRoute from '../components/ProtectedRoute';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<SignInPage />} />

        {/* Protected Employee Routes */}
        <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
          <Route path="/employee" element={<EmployeeHomePage />} />
        </Route>

        {/* Protected Agent Routes */}
        <Route element={<ProtectedRoute allowedRoles={['agent']} />}>
          <Route path="/agent" element={<AgentHomePage />} />
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
