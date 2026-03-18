import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_LOGO_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_PALETTE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_LOGO_TYPES = ["image/png", "image/jpeg", "image/svg+xml"];
const ALLOWED_PALETTE_TYPES = ["image/png", "image/jpeg", "application/pdf"];
const ALLOWED_FONT_TYPES = [
  "font/woff",
  "font/woff2",
  "font/ttf",
  "font/otf",
  "application/font-woff",
  "application/font-woff2",
  "application/x-font-ttf",
  "application/x-font-opentype",
];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const type = formData.get("type") as string; // "logo" | "palette" | "font"

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate type and size
  let allowedTypes: string[];
  let maxSize: number;

  switch (type) {
    case "logo":
      allowedTypes = ALLOWED_LOGO_TYPES;
      maxSize = MAX_LOGO_SIZE;
      break;
    case "palette":
      allowedTypes = ALLOWED_PALETTE_TYPES;
      maxSize = MAX_PALETTE_SIZE;
      break;
    case "font":
      allowedTypes = ALLOWED_FONT_TYPES;
      maxSize = MAX_LOGO_SIZE;
      break;
    default:
      return NextResponse.json({ error: "Invalid upload type" }, { status: 400 });
  }

  if (file.size > maxSize) {
    return NextResponse.json(
      { error: `File too large. Max ${maxSize / 1024 / 1024}MB` },
      { status: 400 }
    );
  }

  // Relaxed type check — browsers may report different MIME types for fonts
  const fileType = file.type || "";
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const isAllowedByType = allowedTypes.some((t) => fileType.includes(t.split("/")[1]));
  const isAllowedByExt =
    type === "font"
      ? ["woff", "woff2", "ttf", "otf"].includes(ext)
      : type === "logo"
      ? ["png", "jpg", "jpeg", "svg"].includes(ext)
      : ["png", "jpg", "jpeg", "pdf"].includes(ext);

  if (!isAllowedByType && !isAllowedByExt) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }

  // Save file
  const userDir = path.join(UPLOAD_DIR, session.user.id);
  await mkdir(userDir, { recursive: true });

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filename = `${timestamp}-${safeName}`;
  const filePath = path.join(userDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const url = `/uploads/${session.user.id}/${filename}`;

  return NextResponse.json({ url, filename: file.name, path: filePath });
}
