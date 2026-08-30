import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Interval = {
  startTime: string;
  endTime: string;
};

function parseDateKey(date: string) {
  const value = new Date(`${date}T00:00:00`);
  value.setHours(0, 0, 0, 0);
  return value;
}

function sameDate(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function getSlotsFromIntervals(intervals: Interval[], date: Date) {
  const slots: string[] = [];

  intervals.forEach((interval) => {
    const [startHour, startMinute] = interval.startTime.split(":").map(Number);
    const [endHour, endMinute] = interval.endTime.split(":").map(Number);

    const cursor = new Date(date);
    cursor.setHours(startHour, startMinute, 0, 0);

    const end = new Date(date);
    end.setHours(endHour, endMinute, 0, 0);

    while (cursor < end) {
      slots.push(
        `${String(cursor.getHours()).padStart(2, "0")}:${String(
          cursor.getMinutes()
        ).padStart(2, "0")}`
      );

      cursor.setMinutes(cursor.getMinutes() + 30);
    }
  });

  return slots;
}

function intersectIntervals(base: Interval[], custom: Interval[]) {
  const result: Interval[] = [];

  base.forEach((baseInterval) => {
    custom.forEach((customInterval) => {
      const startTime =
        baseInterval.startTime > customInterval.startTime
          ? baseInterval.startTime
          : customInterval.startTime;

      const endTime =
        baseInterval.endTime < customInterval.endTime
          ? baseInterval.endTime
          : customInterval.endTime;

      if (startTime < endTime) {
        result.push({ startTime, endTime });
      }
    });
  });

  return result;
}

function getTemplateIntervals(template: any, date: Date): Interval[] | null {
  const override = template?.overrides?.find((item: any) =>
    sameDate(new Date(item.date), date)
  );

  if (override) {
    if (override.disabled) return [];
    return override.intervals.map((interval: any) => ({
      startTime: interval.startTime,
      endTime: interval.endTime,
    }));
  }

  const day = template?.days?.find((item: any) => item.dayOfWeek === date.getDay());

  if (!day?.enabled) return [];

  return day.intervals.map((interval: any) => ({
    startTime: interval.startTime,
    endTime: interval.endTime,
  }));
}

function getUserIntervals(availability: any, date: Date): Interval[] | null {
  if (!availability) return null;

  const override = availability.overrides?.find((item: any) =>
    sameDate(new Date(item.date), date)
  );

  if (override) {
    if (override.disabled) return [];
    return override.intervals.map((interval: any) => ({
      startTime: interval.startTime,
      endTime: interval.endTime,
    }));
  }

  const day = availability.days?.find((item: any) => item.dayOfWeek === date.getDay());

  if (!day?.enabled) return [];

  return day.intervals.map((interval: any) => ({
    startTime: interval.startTime,
    endTime: interval.endTime,
  }));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const stylistId = searchParams.get("stylistId");
  const dateParam = searchParams.get("date");

  if (!stylistId || !dateParam) {
    return NextResponse.json(
      { success: false, error: "Hiányzó stylistId vagy date." },
      { status: 400 }
    );
  }

  const date = parseDateKey(dateParam);

  const [userAvailability, defaultAvailability, appointments] =
    await Promise.all([
      prisma.userAvailability.findUnique({
        where: { userId: stylistId },
        include: {
          days: { include: { intervals: true } },
          overrides: { include: { intervals: true } },
        },
      }),
      prisma.availabilityTemplate.findFirst({
        where: { isDefault: true },
        include: {
          days: { include: { intervals: true } },
          overrides: { include: { intervals: true } },
        },
      }),
      prisma.appointment.findMany({
        where: {
          stylistId,
          date: {
            gte: new Date(`${dateParam}T00:00:00`),
            lte: new Date(`${dateParam}T23:59:59.999`),
          },
          status: {
            notIn: ["RESIGNED", "resigned"],
          },
        },
        select: {
          date: true,
        },
      }),
    ]);

  const defaultIntervals = getTemplateIntervals(defaultAvailability, date) || [];
  const userIntervals = getUserIntervals(userAvailability, date);

  const effectiveIntervals =
    userIntervals === null
      ? defaultIntervals
      : intersectIntervals(defaultIntervals, userIntervals);

  const bookedTimes = appointments.map((appointment) => {
    return `${String(appointment.date.getHours()).padStart(2, "0")}:${String(
      appointment.date.getMinutes()
    ).padStart(2, "0")}`;
  });

  const now = new Date();

  const availableTimes = getSlotsFromIntervals(effectiveIntervals, date).filter(
    (time) => {
      const [hours, minutes] = time.split(":").map(Number);
      const slotDate = new Date(date);
      slotDate.setHours(hours, minutes, 0, 0);

      return slotDate > now && !bookedTimes.includes(time);
    }
  );

  return NextResponse.json({
    success: true,
    disabled: effectiveIntervals.length === 0,
    intervals: effectiveIntervals,
    bookedTimes,
    availableTimes,
  });
}