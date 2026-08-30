import { NextRequest, NextResponse } from "next/server";
import { updateUser } from "@/lib/actions";

export async function POST(request: NextRequest) {
  try {
    const { id, name, email, phone, role, image, bio } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: "User ID missing" }, { status: 400 });
    }

    const result = await updateUser(id, { name, email, phone, role, image, bio });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message || "Unknown error" }, { status: 500 });
  }
}
