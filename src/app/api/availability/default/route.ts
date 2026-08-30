import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const weekDays = [0, 1, 2, 3, 4, 5, 6];

function normalizeDate(date: string) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.email) return null;

  return prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    include: {
      role: true,
    },
  });
}

async function getOrCreateDefaultTemplate() {
  let template = await prisma.availabilityTemplate.findFirst({
    where: {
      isDefault: true,
    },
    include: {
      days: {
        include: {
          intervals: true,
        },
        orderBy: {
          dayOfWeek: "asc",
        },
      },
      overrides: {
        include: {
          intervals: true,
        },
        orderBy: {
          date: "asc",
        },
      },
    },
  });

  if (!template) {
    template = await prisma.availabilityTemplate.create({
      data: {
        name: "Alap elérhetőség",
        isDefault: true,
        days: {
          create: weekDays.map((dayOfWeek) => ({
            dayOfWeek,
            enabled: [1, 2, 3, 4, 5].includes(dayOfWeek),
            intervals: {
              create: [1, 2, 3, 4, 5].includes(dayOfWeek)
                ? [{ startTime: "09:00", endTime: "17:00" }]
                : [],
            },
          })),
        },
      },
      include: {
        days: {
          include: {
            intervals: true,
          },
          orderBy: {
            dayOfWeek: "asc",
          },
        },
        overrides: {
          include: {
            intervals: true,
          },
          orderBy: {
            date: "asc",
          },
        },
      },
    });
  }

  return template;
}

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role?.name !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 },
    );
  }

  const template = await getOrCreateDefaultTemplate();

  return NextResponse.json({ success: true, data: template });
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role?.name !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 },
    );
  }

  const body = await request.json();
  const { days, overrides = [] } = body;

  const template = await getOrCreateDefaultTemplate();

  await prisma.availabilityTemplateDay.deleteMany({
    where: {
      templateId: template.id,
    },
  });

  await prisma.availabilityTemplateOverride.deleteMany({
    where: {
      templateId: template.id,
    },
  });

  await prisma.availabilityTemplate.update({
    where: {
      id: template.id,
    },
    data: {
      days: {
        create: days.map((day: any) => ({
          dayOfWeek: day.dayOfWeek,
          enabled: day.enabled,
          intervals: {
            create: day.enabled
              ? day.intervals.map((interval: any) => ({
                  startTime: interval.startTime,
                  endTime: interval.endTime,
                }))
              : [],
          },
        })),
      },
      overrides: {
        create: overrides.map((override: any) => ({
          date: normalizeDate(override.date),
          disabled: override.disabled,
          intervals: {
            create: override.disabled
              ? []
              : override.intervals.map((interval: any) => ({
                  startTime: interval.startTime,
                  endTime: interval.endTime,
                })),
          },
        })),
      },
    },
  });

  return NextResponse.json({ success: true });
}
