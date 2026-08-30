import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: {
          select: {
            id: true,
            name: true,
            roleId: true,
            role: {
              select: {
                id: true,
                name: true,
                longName: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Services API error:", error);

    return NextResponse.json(
      { error: "Nem sikerült lekérni a szolgáltatásokat." },
      { status: 500 }
    );
  }
}