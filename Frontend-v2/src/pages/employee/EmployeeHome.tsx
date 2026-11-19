import EmployeeHeader from "#components/EmployeeHeader";
import { Outlet } from "react-router";

const EmployeeHome = () => {
  return (
    <div>
      <EmployeeHeader />
      <Outlet />
    </div>
  );
};
export default EmployeeHome;
