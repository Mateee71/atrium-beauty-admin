"use client";

import { useRouter } from "next/navigation";
import CreateAppointmentDialog from "@/components/appointments/CreateAppointmentDialog";
import { useCalendar } from "@/calendar/contexts/calendar-context";

import type { IEvent } from "@/calendar/interfaces";
import type { TEventColor } from "@/calendar/types";

interface IProps {
  children: React.ReactNode;
  startDate?: Date;
  startTime?: { hour: number; minute: number };
}

const getEventColorByRole = (roleName?: string | null): TEventColor => {
  switch (roleName) {
    case "HAIRDRESSER":
      return "blue";
    case "BEAUTICIAN":
      return "green";
    case "NAIL_TECHNICIAN":
      return "purple";
    case "MASSEUR":
      return "orange";
    default:
      return "gray";
  }
};

export function AddEventDialog({ children, startDate }: IProps) {
  const {
    users,
    categories,
    selectedUserId,
    setLocalEvents,
  } = useCalendar();

  const router = useRouter();

  const defaultStylistId = selectedUserId !== "all" ? selectedUserId : "";

  return (
    <CreateAppointmentDialog
      users={users}
      categories={categories}
      trigger={children}
      defaultDate={startDate}
      defaultStylistId={defaultStylistId}
      onCreated={(appointment) => {
        const selectedStylist = users.find(
          (user) => user.id === appointment.stylistId
        );

        const start = new Date(appointment.date);
        const end = new Date(start.getTime() + 30 * 60 * 1000);

        const serviceNames = appointment.services
          ?.map((service: any) => service.name)
          .join(", ");

        const firstService = appointment.services?.[0];

        const newEvent: IEvent = {
          id: appointment.id,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          title: `${appointment.customer.name} - ${serviceNames || "Szolgáltatás"}`,
          color: getEventColorByRole(selectedStylist?.role?.name),
          description: appointment.note || serviceNames || "",
          user: {
            id: selectedStylist?.id || appointment.stylistId,
            name: selectedStylist?.name || "Ismeretlen szakember",
            image: selectedStylist?.image || null,
            role: selectedStylist?.role,
          },
          customer: {
            name: appointment.customer.name,
            email: appointment.customer.email,
            phone: appointment.customer.phone,
          },
          serviceIds: appointment.services.map((service: any) => service.id),
          serviceCategoryId: firstService?.categoryId || "",
          status: appointment.status,
          note: appointment.note,
        };

        setLocalEvents((prev) => [...prev, newEvent]);
        router.refresh();
      }}
    />
  );
}