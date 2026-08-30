import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const stylistId = searchParams.get("stylistId");
  const date = searchParams.get("date");

  if (!stylistId || !date) {
    return NextResponse.json(
      { error: "Hiányzó stylistId vagy date." },
      { status: 400 }
    );
  }

  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59.999`);

  const appointments = await prisma.appointment.findMany({
    where: {
      stylistId,
      date: {
        gte: dayStart,
        lte: dayEnd,
      },
      status: {
        notIn: ["RESIGNED", "resigned"],
      },
    },
    select: {
      date: true,
    },
  });

  const bookedTimes = appointments.map((appointment) => {
    const hours = String(appointment.date.getHours()).padStart(2, "0");
    const minutes = String(appointment.date.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
  });

  return NextResponse.json({ bookedTimes });
}