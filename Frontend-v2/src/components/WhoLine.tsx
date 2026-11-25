function WhoLine(r) {
  const agent = r.agent && <strong className="font-semibold text-slate-900">{r.agent.name}</strong>;
  switch (r.status) {
    case "new":
      return <>Waiting to be picked up by {r.team}</>;
    case "pending_approval":
      return <>Waiting for {r.approver ?? "an approver"}'s approval</>;
    case "assigned":
      return <>{agent} from {r.team} has picked this up</>;
    case "open":
      return <>{agent} from {r.team} is working on this</>;
    case "waiting_on_you":
      return <>{agent} is waiting for your reply</>;
    case "resolved":
      return <>{agent} marked this as resolved</>;
    case "closed":
      return <>This request is closed</>;
    case "cancelled":
      return <>You cancelled this request</>;
    default:
      return null;
  }
}

export default WhoLine