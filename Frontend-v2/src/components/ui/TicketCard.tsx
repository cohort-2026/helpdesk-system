import { Badge } from '#components/ui/badge';
function TicketCard({
  ticket,
}: {
  ticket: {
    id: string;
    status: string;
    statusClass: string;
    offset: string;
    title: string;
    meta: string;
  };
}) {
  return (
    <div
      className={`rounded-lg bg-white p-4 text-slate-900 shadow-lg ${ticket.offset}`}
    >
      <div className="flex items-start justify-between">
        <span className="font-mono text-[10px] text-slate-400">{ticket.id}</span>
        <Badge
          variant="outline"
          className={`gap-1.5 rounded-full px-2 py-0 text-[10px] font-medium ${ticket.statusClass}`}
        >
          <span className="size-1.5 rounded-full bg-current" />
          {ticket.status}
        </Badge>
      </div>
      <p className="mt-1 text-sm font-semibold">{ticket.title}</p>
      <p className="mt-1.5 text-[10px] text-slate-500">{ticket.meta}</p>
    </div>
  );
}

export default TicketCard;