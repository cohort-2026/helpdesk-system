import { Paperclip, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Textarea } from "./ui/textarea";

function Composer({ placeholder, onSend }) {
  const [body, setBody] = useState("");
  const [files, setFiles] = useState([]);
  const inputRef = useRef(null);

  const canSend = body.trim().length > 0;

  const send = () => {
    if (!canSend) return;
    onSend({ body: body.trim(), files });
    setBody("");
    setFiles([]);
  };

  return (
    <Card className="gap-0 rounded-xl py-0 shadow-none">
      <CardContent className="p-0">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => (e.metaKey || e.ctrlKey) && e.key === "Enter" && send()}
          placeholder={placeholder}
          aria-label="Reply"
          className="min-h-16 resize-none rounded-b-none border-0 px-4 pt-3 text-xs shadow-none focus-visible:ring-0"
        />

        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pb-2">
            {files.map((f, i) => (
              <span key={`${f.name}-${i}`} className="inline-flex items-center gap-1.5 rounded-md border bg-slate-50 px-2 py-1 text-[11px] text-slate-600">
                {f.name}
                <button
                  type="button"
                  aria-label={`Remove ${f.name}`}
                  onClick={() => setFiles((list) => list.filter((_, j) => j !== i))}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t px-3 py-2">
          <input
            ref={inputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => {
              setFiles((list) => [...list, ...Array.from(e.target.files ?? [])]);
              e.target.value = "";
            }}
          />
          <Button type="button" variant="ghost" size="icon" aria-label="Attach a file" className="size-7 text-slate-500" onClick={() => inputRef.current?.click()}>
            <Paperclip className="size-4" />
          </Button>
          <Button type="button" size="sm" disabled={!canSend} onClick={send} className="bg-indigo-600 text-xs font-semibold hover:bg-indigo-700">
            Send reply
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default Composer