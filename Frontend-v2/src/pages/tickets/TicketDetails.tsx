import { useParams } from "react-router";

export default function TicketDetails() {
  const { id } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold tracking-tight text-slate-900">
        Ticket #{id}
      </h1>
      <p className="mt-1 text-xs text-slate-500">Ticket details view</p>
    </div>
  );
}
