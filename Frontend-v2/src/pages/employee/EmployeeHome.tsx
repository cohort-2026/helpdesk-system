import EmployeeHeader from "#components/EmployeeHeader";
import { Outlet } from "react-router";
import React from "react";

const EmployeeHome = () => {
  return (
    <div>
      <EmployeeHeader />
      <Outlet />
    </div>
  );
};
export default EmployeeHome;
