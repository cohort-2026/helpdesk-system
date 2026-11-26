import { Card, CardContent } from "#components/ui/card";
import { Button } from "./ui/button";


function ChangeCard({ canCancel, onCancel }) {
  return (
    <Card className="gap-0 rounded-xl py-0 shadow-none">
      <CardContent className="p-4">
        <h2 className="text-xs font-semibold">Need to change something?</h2>
        <p className="mt-1 text-[11px] leading-snug text-slate-500">
          Add details as a reply. You can cancel while a request is New or waiting for approval.
        </p>
        {canCancel && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="mt-3 w-full border-red-200 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            Cancel request
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default ChangeCard