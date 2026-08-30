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

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Missing userId" },
      { status: 400 },
    );
  }

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const isAdmin = currentUser.role?.name === "ADMIN";

  if (!isAdmin && currentUser.id !== userId) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 },
    );
  }

  let availability = await prisma.userAvailability.findUnique({
    where: {
      userId,
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

  if (!availability) {
    availability = await prisma.userAvailability.create({
      data: {
        userId,
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

  const defaultAvailability = await prisma.availabilityTemplate.findFirst({
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

  return NextResponse.json({
    success: true,
    data: availability,
    defaultAvailability,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, days, overrides } = body;

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Missing userId" },
      { status: 400 },
    );
  }

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const isAdmin = currentUser.role?.name === "ADMIN";

  if (!isAdmin && currentUser.id !== userId) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 },
    );
  }

  const availability = await prisma.userAvailability.upsert({
    where: {
      userId,
    },
    create: {
      userId,
    },
    update: {},
  });

  await prisma.availabilityDay.deleteMany({
    where: {
      userAvailabilityId: availability.id,
    },
  });

  await prisma.availabilityOverride.deleteMany({
    where: {
      userAvailabilityId: availability.id,
    },
  });

  await prisma.userAvailability.update({
    where: {
      id: availability.id,
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
