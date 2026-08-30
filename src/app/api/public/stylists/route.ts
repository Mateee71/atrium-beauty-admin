import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const stylists = await prisma.user.findMany({
      where: {
        role: {
          name: {
            notIn: ["ADMIN", "USER"],
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: {
          select: {
            id: true,
            name: true,
            longName: true,
          },
        },
        profile: {
          select: {
            phone: true,
            bio: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(stylists);
  } catch (error) {
    console.error("Stylists API error:", error);

    return NextResponse.json(
      { error: "Nem sikerült lekérni a szakembereket." },
      { status: 500 }
    );
  }
}