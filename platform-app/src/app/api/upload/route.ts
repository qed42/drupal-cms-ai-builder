import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readdir } from "fs/promises";
import path from "path";
import fileType from "file-type";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_LOGO_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_PALETTE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGES_PER_SITE = 20;

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
const ALLOWED_IMAGE_MIMES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const type = formData.get("type") as string; // "logo" | "palette" | "font" | "image"

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Image uploads have a separate code path with stricter validation
  if (type === "image") {
    return handleImageUpload(file, formData, session.user.id);
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

// ── Image upload handler (TASK-436) ────────────────────────────────

async function handleImageUpload(
  file: File,
  formData: FormData,
  userId: string
): Promise<NextResponse> {
  const siteId = formData.get("siteId") as string;
  if (!siteId) {
    return NextResponse.json(
      { error: "siteId is required for image uploads" },
      { status: 400 }
    );
  }

  // Size check
  if (file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json(
      { error: "File too large. Max 10MB per image." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // MIME validation via magic bytes (not browser-reported Content-Type)
  const detected = await fileType.fromBuffer(buffer);
  if (!detected || !ALLOWED_IMAGE_MIMES.has(detected.mime)) {
    return NextResponse.json(
      {
        error: `File type not allowed. Accepted: PNG, JPEG, WebP. Detected: ${detected?.mime ?? "unknown"}`,
      },
      { status: 400 }
    );
  }

  // Enforce per-site cumulative limit
  const imageDir = path.join(UPLOAD_DIR, siteId, "images");
  await mkdir(imageDir, { recursive: true });

  let existingCount = 0;
  try {
    const entries = await readdir(imageDir);
    existingCount = entries.length;
  } catch {
    // Directory may not exist yet — that's fine, count is 0
  }

  if (existingCount >= MAX_IMAGES_PER_SITE) {
    return NextResponse.json(
      { error: `Maximum ${MAX_IMAGES_PER_SITE} images per site reached.` },
      { status: 400 }
    );
  }

  // Strip EXIF metadata from JPEG files
  const cleanBuffer = detected.mime === "image/jpeg" ? stripJpegExif(buffer) : buffer;

  // UUID-based filename (no user-controlled path segments)
  const uuid = crypto.randomUUID();
  const ext = detected.ext; // e.g., "jpg", "png", "webp"
  const filename = `${uuid}.${ext}`;
  const filePath = path.join(imageDir, filename);

  await writeFile(filePath, cleanBuffer);

  const url = `/uploads/${siteId}/images/${filename}`;

  return NextResponse.json({
    url,
    filename: file.name,
    path: filePath,
    id: uuid,
  });
}

// ── JPEG EXIF stripping ────────────────────────────────────────────

/**
 * Strip EXIF (APP1) markers from a JPEG buffer while preserving image data.
 *
 * JPEG structure: SOI (0xFFD8) followed by segments. Each segment starts with
 * 0xFF + marker byte. APP1 (0xFFE1) contains EXIF data. We remove all APP1
 * segments and keep everything else.
 */
function stripJpegExif(buffer: Buffer): Buffer {
  // Verify JPEG SOI marker
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return buffer; // Not a valid JPEG, return as-is
  }

  const chunks: Buffer[] = [Buffer.from([0xff, 0xd8])]; // Start with SOI
  let offset = 2;

  while (offset < buffer.length - 1) {
    // Each marker starts with 0xFF
    if (buffer[offset] !== 0xff) break;

    const marker = buffer[offset + 1];

    // SOS (Start of Scan, 0xDA) — rest is image data, copy everything
    if (marker === 0xda) {
      chunks.push(buffer.subarray(offset));
      break;
    }

    // Markers without length (standalone): RST0-RST7, SOI, EOI, TEM
    if (
      (marker >= 0xd0 && marker <= 0xd9) ||
      marker === 0x01
    ) {
      chunks.push(buffer.subarray(offset, offset + 2));
      offset += 2;
      continue;
    }

    // Read segment length (big-endian, includes the 2 length bytes)
    const segLen = buffer.readUInt16BE(offset + 2);
    const segEnd = offset + 2 + segLen;

    // Skip APP1 (0xE1) — contains EXIF data
    if (marker === 0xe1) {
      offset = segEnd;
      continue;
    }

    // Keep all other segments
    chunks.push(buffer.subarray(offset, segEnd));
    offset = segEnd;
  }

  return Buffer.concat(chunks);
}
