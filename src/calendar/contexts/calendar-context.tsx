"use client";

import { createContext, useContext, useEffect, useState } from "react";

import type { Dispatch, SetStateAction } from "react";
import type { IEvent, IUser } from "@/calendar/interfaces";
import type {
  TBadgeVariant,
  TVisibleHours,
  TWorkingHours,
} from "@/calendar/types";

interface ICalendarContext {
  selectedDate: Date;
  setSelectedDate: (date: Date | undefined) => void;

  selectedUserId: IUser["id"] | "all";
  setSelectedUserId: (userId: IUser["id"] | "all") => void;

  currentUserId: IUser["id"];
  isAdmin: boolean;

  badgeVariant: TBadgeVariant;
  setBadgeVariant: (variant: TBadgeVariant) => void;

  users: IUser[];
  categories: any[];

  workingHours: TWorkingHours;
  setWorkingHours: Dispatch<SetStateAction<TWorkingHours>>;

  visibleHours: TVisibleHours;
  setVisibleHours: Dispatch<SetStateAction<TVisibleHours>>;

  events: IEvent[];
  setLocalEvents: Dispatch<SetStateAction<IEvent[]>>;
}

const CalendarContext = createContext({} as ICalendarContext);

const WORKING_HOURS = {
  0: { from: 0, to: 0 },
  1: { from: 8, to: 17 },
  2: { from: 8, to: 17 },
  3: { from: 8, to: 17 },
  4: { from: 8, to: 17 },
  5: { from: 8, to: 17 },
  6: { from: 8, to: 12 },
};

const VISIBLE_HOURS = { from: 7, to: 18 };

export function CalendarProvider({
  children,
  users,
  events,
  categories,
  currentUserId,
  isAdmin,
}: {
  children: React.ReactNode;
  users: IUser[];
  events: IEvent[];
  categories: any[];
  currentUserId: IUser["id"];
  isAdmin: boolean;
}) {
  const [badgeVariant, setBadgeVariant] = useState<TBadgeVariant>("colored");
  const [visibleHours, setVisibleHours] =
    useState<TVisibleHours>(VISIBLE_HOURS);
  const [workingHours, setWorkingHours] =
    useState<TWorkingHours>(WORKING_HOURS);

  const [selectedDate, setSelectedDate] = useState(new Date());

  const [selectedUserId, setSelectedUserIdState] = useState<IUser["id"] | "all">(
    isAdmin ? "all" : currentUserId
  );

  const [localEvents, setLocalEvents] = useState<IEvent[]>(events);
  
  useEffect(() => {
    setLocalEvents(events);
  }, [events]);

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
  };

  const handleSelectUser = (userId: IUser["id"] | "all") => {
    if (!isAdmin) {
      setSelectedUserIdState(currentUserId);
      return;
    }

    setSelectedUserIdState(userId);
  };

  return (
    <CalendarContext.Provider
      value={{
        selectedDate,
        setSelectedDate: handleSelectDate,

        selectedUserId,
        setSelectedUserId: handleSelectUser,

        currentUserId,
        isAdmin,

        badgeVariant,
        setBadgeVariant,

        users,
        categories,

        visibleHours,
        setVisibleHours,

        workingHours,
        setWorkingHours,

        events: localEvents,
        setLocalEvents,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar(): ICalendarContext {
  const context = useContext(CalendarContext);

  if (!context) {
    throw new Error("useCalendar must be used within a CalendarProvider.");
  }

  return context;
}