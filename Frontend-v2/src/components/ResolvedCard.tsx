import { Button } from "./ui/button";
import GreenCard from "./GreenCard";
import { firstName } from "./TicketInbox/ticket-data";

function ResolvedCard({ agent, daysLeft, onFixed, onStillBroken }) {
  return (
    <GreenCard title={`Has ${firstName(agent)} fixed this?`}>
      <p>
        {daysLeft > 0
          ? `You have ${daysLeft} ${daysLeft === 1 ? "day" : "days"} to respond.`
          : "This will close automatically."}
      </p>
      <div className="mt-3 flex gap-2">
        <Button type="button" size="sm" onClick={onFixed} className="h-8 flex-1 bg-emerald-700 text-xs font-semibold hover:bg-emerald-800">
          Yes, it's fixed
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onStillBroken} className="h-8 flex-1 border-emerald-300 bg-white text-xs font-semibold">
          Still broken
        </Button>
      </div>
    </GreenCard>
  );
}

export default ResolvedCard