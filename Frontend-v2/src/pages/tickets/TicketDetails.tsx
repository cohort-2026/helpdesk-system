import EmployeeTicketDetail from "../employee/EmployeeTicketDetail";
import { useNavigate } from "react-router";

export default function TicketDetails() {
  const navigate = useNavigate();
  return <EmployeeTicketDetail onBack={() => navigate(-1)} />;
}
