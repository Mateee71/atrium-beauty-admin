import { prisma } from "@/lib/prisma";
import Appointments from "./Appointments";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AppointmentsPage() {
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

  const ownAppointmentRoles = [
    "HAIRDRESSER",
    "NAIL_TECHNICIAN",
    "MASSEUR",
    "BEAUTICIAN",
  ];

  const canSeeOwnAppointmentsOnly =
    currentUser.role?.name &&
    ownAppointmentRoles.includes(currentUser.role.name);

  const appointmentWhere = isAdmin
    ? {}
    : canSeeOwnAppointmentsOnly
      ? {
          stylistId: currentUser.id,
        }
      : {
          id: "__NO_APPOINTMENTS__",
        };

  const users = await prisma.user.findMany({
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
  });

  const appointmentsRaw = await prisma.appointment.findMany({
    where: appointmentWhere,
    include: {
      customer: true,
      stylist: {
        select: {
          id: true,
          name: true,
        },
      },
      services: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  const categoriesRaw = await prisma.category.findMany({
    include: {
      services: true,
    },
  });

  const convertDecimals = (items: any[]) =>
    items.map((item) => ({
      ...item,
      price: item.price ? Number(item.price) : item.price,
      services: item.services?.map((service: any) => ({
        ...service,
        price: service.price ? Number(service.price) : service.price,
      })),
    }));

  const appointments = convertDecimals(appointmentsRaw);
  const categories = convertDecimals(categoriesRaw);

  return (
    <div>
      <Appointments
        users={users}
        appointments={appointments}
        categories={categories}
      />
    </div>
  );
}