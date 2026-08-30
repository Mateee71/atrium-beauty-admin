import { CalendarProvider } from "@/calendar/contexts/calendar-context";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { TEventColor } from "@/calendar/types";
import type { IUser } from "@/calendar/interfaces";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const currentUser = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    include: {
      role: true,
    },
  });

  if (!currentUser) {
    redirect("/login");
  }

  const isAdmin = currentUser.role?.name === "ADMIN";

  const usersRaw = await prisma.user.findMany({
    include: {
      role: true,
    },
  });

  const users: IUser[] = usersRaw.map((user) => ({
    id: user.id,
    name: user.name || "Névtelen felhasználó",
    image: user.image,
    role: user.role,
  }));

  const categoriesRaw = await prisma.category.findMany({
    include: {
      services: true,
    },
  });

  const categories = categoriesRaw.map((category) => ({
    ...category,
    services: category.services.map((service) => ({
      ...service,
      price: service.price ? Number(service.price) : service.price,
    })),
  }));


  const appointmentWhere = isAdmin
  ? {
      status: {
        notIn: ["resigned", "RESIGNED"],
      },
    }
  : {
      stylistId: currentUser.id,
      status: {
        notIn: ["resigned", "RESIGNED"],
      },
    };

const appointments = await prisma.appointment.findMany({
  where: appointmentWhere,
  include: {
    customer: true,
    stylist: {
      select: {
        id: true,
        name: true,
        image: true,
        role: {
          select: {
            id: true,
            name: true,
            longName: true,
          },
        },
      },
    },
    services: {
      include: {
        category: {
          include: {
            role: true,
          },
        },
      },
    },
  },
  orderBy: {
    date: "asc",
  },
});

const getEventColor = (appointment: any): TEventColor => {
  const roleName =
    appointment.stylist?.role?.name ||
    appointment.services?.[0]?.category?.role?.name ||
    "";

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

const events = appointments
  .filter((appointment) => appointment.stylist)
  .map((appointment) => {
    const startDate = appointment.date;
    const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);

    const serviceNames = appointment.services
      .map((service) => service.name)
      .join(", ");

    const firstService = appointment.services[0];

    return {
      id: appointment.id,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      title: `${appointment.customer.name} - ${serviceNames || "Szolgáltatás"}`,
      color: getEventColor(appointment),
      description: appointment.note || serviceNames || "",
      user: {
        id: appointment.stylist!.id,
        name: appointment.stylist!.name || "Ismeretlen szakember",
        image: appointment.stylist!.image,
      },
      customer: {
        name: appointment.customer.name,
        email: appointment.customer.email,
        phone: appointment.customer.phone,
      },
      serviceIds: appointment.services.map((service) => service.id),
      serviceCategoryId: firstService?.categoryId || "",
      status: appointment.status,
      note: appointment.note,
    };
  });


  return (
    <CalendarProvider
      users={users}
      events={events}
      categories={categories}
      currentUserId={currentUser.id}
      isAdmin={isAdmin}
    >
      {children}
    </CalendarProvider>
  );
}