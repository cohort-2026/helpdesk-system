import { Star } from "lucide-react";
import GreenCard from "./GreenCard";
import { cn } from "#lib/utils";

function RatingCard({ rating, onRate }) {
  return (
    <GreenCard title={rating ? "Thanks for the rating" : "Glad that's sorted. How was the help?"}>
      <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            disabled={!!rating}
            onClick={() => onRate(n)}
            className="rounded p-0.5 disabled:cursor-default"
          >
            <Star className={cn("size-5", n <= (rating ?? 0) ? "fill-amber-400 text-amber-400" : "text-emerald-600")} />
          </button>
        ))}
      </div>
    </GreenCard>
  );
}

export default RatingCard