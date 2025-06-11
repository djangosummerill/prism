import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserAvatar({
  name,
  email,
  avatar,
  className = "",
}: {
  name: string;
  email: string;
  avatar: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarImage src={avatar} alt={name} />
        <AvatarFallback className="rounded-lg">
          {name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{name}</span>
        <span className="text-muted-foreground truncate text-xs">{email}</span>
      </div>
    </div>
  );
}
