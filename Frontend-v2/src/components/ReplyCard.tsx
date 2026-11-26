import { Card, CardContent } from "#components/ui/card";
import { Paperclip } from "lucide-react";
import PersonAvatar from "./PersonAvatar";


function ReplyCard({ item, time }) {
  const { author } = item;
  return (
    <Card className="gap-0 rounded-xl py-0 shadow-none">
      <CardContent className="space-y-2.5 p-4">
        <div className="flex items-center gap-2">
          <PersonAvatar person={author} />
          <p className="flex-1 text-xs">
            <span className="font-semibold">{author.name}</span>{" "}
            <span className="text-slate-500">{author.you ? "You" : author.team}</span>
          </p>
          <span className="text-[11px] text-slate-400">{time}</span>
        </div>

        <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-800">{item.body}</p>

        {item.attachments?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.attachments.map((a) => (
              <span
                key={a.name}
                className="inline-flex items-center gap-1.5 rounded-md border bg-slate-50 px-2 py-1 text-[11px] text-slate-600"
              >
                <Paperclip className="size-3 text-slate-400" />
                {a.name}
                {a.size && <span className="text-slate-400">· {a.size}</span>}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ReplyCard