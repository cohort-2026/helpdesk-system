import {Inbox} from "lucide-react";

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
        <Inbox className="size-4" />
      </div>
      <div className="leading-tight">
        <p className="text-xs font-semibold text-slate-900">Helpdesk</p>
      </div>
    </div>
  );
}

export default Brand