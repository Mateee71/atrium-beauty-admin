import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const data = await req.formData();

  const file = data.get("file") as unknown as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const filePath = path.join(uploadDir, file.name);

  await fs.promises.writeFile(filePath, buffer);

  const publicPath = `/uploads/${file.name}`;

  return NextResponse.json({ filePath: publicPath });
}
