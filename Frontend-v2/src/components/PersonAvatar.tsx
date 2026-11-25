import { Avatar, AvatarFallback } from "#components/ui/avatar";
import { cn } from "#lib/utils";

function PersonAvatar({ person, className }) {
  return (
    <Avatar className={cn("size-6", className)}>
      <AvatarFallback className={cn("text-[9px] font-semibold text-white", person.color)}>
        {person.initials}
      </AvatarFallback>
    </Avatar>
  );
}

export default PersonAvatar