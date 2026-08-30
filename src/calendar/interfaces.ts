import type { TEventColor } from "@/calendar/types";

export interface IUser {
  id: string;
  name: string;
  image: string | null;
  role?: {
    id: string;
    name: string;
    longName: string | null;
  } | null;
}

export interface IEvent {
  id: string;
  startDate: string;
  endDate: string;
  title: string;
  color: TEventColor;
  description: string;
  user: IUser;

  customer: {
    name: string;
    email: string;
    phone: string | null;
  };

  serviceIds: string[];
  serviceCategoryId: string;
  status: string;
  note: string | null;
}

export interface ICalendarCell {
  day: number;
  currentMonth: boolean;
  date: Date;
}
