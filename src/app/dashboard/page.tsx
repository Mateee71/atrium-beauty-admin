import AppAreaChart from "@/components/AppAreaChart";
import AppBarChart from "@/components/AppBarChart";
import AppPieChart from "@/components/AppPieChart";
import CardList from "@/components/CardList";
import TodoList from "@/components/TodoList";
import { prisma } from "@/lib/prisma";

const monthLabels = ["Jan", "Feb", "Már", "Ápr", "Máj", "Jún", "Júl", "Aug", "Szep", "Okt", "Nov", "Dec"];

const getMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const getDayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const Homepage = async () => {
  const now = new Date();

  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const appointments = await prisma.appointment.findMany({
    where: {
      date: {
        gte: sixMonthsAgo,
      },
    },
    include: {
      customer: true,
      stylist: {
        select: {
          name: true,
          image: true,
          role: true,
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

  const latestCustomersRaw = await prisma.customer.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
    include: {
      appointments: {
        orderBy: {
          date: "desc",
        },
        take: 1,
        include: {
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
      },
    },
  });

  const monthKeys = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    return {
      key: getMonthKey(date),
      month: monthLabels[date.getMonth()],
      fulfilled: 0,
      resigned: 0,
      pending: 0,
    };
  });

  const monthlyAppointments = monthKeys.map((monthItem) => {
    const monthAppointments = appointments.filter(
      (appointment) => getMonthKey(appointment.date) === monthItem.key
    );

    return {
      month: monthItem.month,
      fulfilled: monthAppointments.filter((item) => item.status?.toLowerCase() === "done").length,
      resigned: monthAppointments.filter((item) => item.status?.toLowerCase() === "resigned").length,
      pending: monthAppointments.filter((item) => item.status?.toLowerCase() === "pending").length,
    };
  });

  const currentMonthAppointments = appointments.filter(
    (appointment) => appointment.date >= currentMonthStart && appointment.date < nextMonthStart
  );

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const dailyAppointments = Array.from({ length: daysInMonth }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), index + 1);
    const dayAppointments = currentMonthAppointments.filter(
      (appointment) => getDayKey(appointment.date) === getDayKey(date)
    );

    return {
      day: `${index + 1}.`,
      fulfilled: dayAppointments.filter((item) => item.status?.toLowerCase() === "done").length,
      pending: dayAppointments.filter((item) => item.status?.toLowerCase() === "pending").length,
    };
  });

  const roleColorVars = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];

  const excludedRoleNames = ["ADMIN", "USER"];

  const roleMap = new Map<string, {
    role: string;
    value: number;
    fill: string;
  }>();

  currentMonthAppointments.forEach((appointment) => {
    const roleName = appointment.stylist?.role?.name;
    const roleLabel =
      appointment.stylist?.role?.longName ||
      appointment.stylist?.role?.name ||
      "Nincs beosztás";

    if (!roleName || excludedRoleNames.includes(roleName)) {
      return;
    }

    const existing = roleMap.get(roleName);

    roleMap.set(roleName, {
      role: roleLabel,
      value: (existing?.value || 0) + 1,
      fill: existing?.fill || roleColorVars[roleMap.size % roleColorVars.length],
    });
  });

  const roleDistributionData = Array.from(roleMap.values());

  const customerAppointments = appointments.map((appointment) => ({
    id: appointment.id,
    date: appointment.date.toISOString(),
    title: appointment.customer.name,
    badge:
      appointment.services[0]?.category?.name ||
      appointment.stylist?.role?.longName ||
      "Szolgáltatás",
    icon:
      appointment.services[0]?.category?.role?.icon ||
      appointment.stylist?.role?.icon ||
      null,
    image: null,
    count: appointment.date.toLocaleTimeString("hu-HU", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  const latestCustomers = latestCustomersRaw.map((customer) => ({
    id: customer.id,
    title: customer.name,
    badge: customer.appointments[0]?.services[0]?.category?.name || "Nincs szolgáltatás",
    icon: customer.appointments[0]?.services[0]?.category?.role?.icon || null,
    image: null,
    count: customer.createdAt.toLocaleDateString("hu-HU"),
  }));

  const serviceMap = new Map<string, {
    id: string;
    title: string;
    badge: string;
    image: null;
    icon: string | null;
    count: number;
  }>();

  appointments.forEach((appointment) => {
    appointment.services.forEach((service) => {
      const existing = serviceMap.get(service.id);

      serviceMap.set(service.id, {
        id: service.id,
        title: service.name,
        badge: service.category?.name || "Szolgáltatás",
        image: null,
        icon: service.category?.role?.icon || null,
        count: (existing?.count || 0) + 1,
      });
    });
  });

  const popularServices = Array.from(serviceMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-4">
        <div className="rounded-lg bg-primary-foreground p-4 lg:col-span-2 xl:col-span-1 2xl:col-span-2">
          <AppBarChart data={monthlyAppointments} />
        </div>

        <div className="rounded-lg bg-primary-foreground p-4">
          <CardList title="Legutóbbi ügyfelek" list={latestCustomers} />
        </div>

        <div className="rounded-lg bg-primary-foreground p-4">
          <AppPieChart data={roleDistributionData} />
        </div>

        <div className="rounded-lg bg-primary-foreground p-4">
          <TodoList list={customerAppointments} />
        </div>

        <div className="rounded-lg bg-primary-foreground p-4 lg:col-span-2 xl:col-span-1 2xl:col-span-2">
          <AppAreaChart data={dailyAppointments} />
        </div>

        <div className="rounded-lg bg-primary-foreground p-4">
          <CardList title="Népszerű szolgáltatások" list={popularServices} />
        </div>
      </div>
    </div>
  );
};

export default Homepage;