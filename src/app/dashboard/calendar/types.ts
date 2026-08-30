export interface IUser {
  id: string;
  name: string;
  image: string;
}

export interface IEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  color: "blue" | "green" | "red" | "yellow" | "purple" | "orange";
  user: IUser;
}

export interface CalendarProviderProps {
  users: IUser[];
  events: IEvent[];
  children: React.ReactNode;
}
