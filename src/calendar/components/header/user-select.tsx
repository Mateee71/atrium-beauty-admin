import * as React from "react";
import { useCalendar } from "@/calendar/contexts/calendar-context";

import { AvatarGroup } from "@/components/ui/avatar-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function UserSelect() {
  const {
    users,
    selectedUserId,
    setSelectedUserId,
    currentUserId,
    isAdmin,
  } = useCalendar();

  const safeSelectedUserId = isAdmin
    ? selectedUserId || "all"
    : currentUserId || "";

  const visibleUsers = React.useMemo(() => {
    if (isAdmin) return users;
    return users.filter((user) => user.id === currentUserId);
  }, [users, isAdmin, currentUserId]);

  React.useEffect(() => {
    if (!isAdmin && currentUserId && selectedUserId !== currentUserId) {
      setSelectedUserId(currentUserId);
    }
  }, [isAdmin, selectedUserId, currentUserId, setSelectedUserId]);

  if (!isAdmin && !currentUserId) {
    return null;
  }

  return (
    <Select
      value={safeSelectedUserId}
      onValueChange={(value) => setSelectedUserId(value)}
      disabled={!isAdmin}
    >
      <SelectTrigger className="flex-1 md:w-48">
        <SelectValue />
      </SelectTrigger>

      <SelectContent align="end">
        {isAdmin && (
          <SelectItem value="all">
            <div className="flex items-center gap-1">
              <AvatarGroup max={2}>
                {users.map((user) => (
                  <Avatar key={user.id} className="size-6 text-xxs">
                    <AvatarImage src={user.image ?? undefined} alt={user.name} />
                    <AvatarFallback className="text-xxs">
                      {user.name?.[0] ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </AvatarGroup>
              Összes
            </div>
          </SelectItem>
        )}

        {visibleUsers.map((user) => (
          <SelectItem key={user.id} value={user.id} className="flex-1">
            <div className="flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarImage src={user.image ?? undefined} alt={user.name} />
                <AvatarFallback className="text-xxs">
                  {user.name?.[0] ?? "?"}
                </AvatarFallback>
              </Avatar>

              <p className="truncate">{user.name}</p>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}