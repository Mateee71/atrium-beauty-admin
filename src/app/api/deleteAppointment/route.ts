import { NextResponse } from "next/server";
import { deleteAppointment } from "@/lib/actions";

export async function POST(request: Request) {
  const { id } = await request.json();

  if (!id) {
    return NextResponse.json(
      { success: false, error: "Missing appointment id" },
      { status: 400 },
    );
  }

  const result = await deleteAppointment(id);

  if (result.success) {
    return NextResponse.json({ success: true, data: result.data });
  } else {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 },
    );
  }
}
