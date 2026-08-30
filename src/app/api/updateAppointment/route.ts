import { NextResponse } from "next/server";
import { updateAppointment } from "@/lib/actions";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await updateAppointment(body);

    if (result.success) {
      return NextResponse.json({ success: true, data: result.data });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Invalid request or server error" },
      { status: 500 },
    );
  }
}
