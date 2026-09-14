import { createAdminClient } from "@/lib/supabase/admin";
import sharp from "sharp";

export const SITE_ASSETS_BUCKET = "site-assets";
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
export const TARGET_IMAGE_BYTES = 50 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type ImageUploadScope = "packages" | "portfolio" | "about";

export interface ImageUploadResult {
  publicUrl: string;
  path: string;
  contentType: string;
  size: number;
}

export function isUploadFile(value: FormDataEntryValue | null): value is File {
  return typeof File !== "undefined" && value instanceof File && value.size > 0;
}

async function compressToTarget(buffer: Buffer): Promise<Buffer> {
  let width = 960;
  let quality = 72;

  const pipeline = () =>
    sharp(buffer, { failOn: "none" })
      .rotate()
      .toColorspace("srgb")
      .resize({ width, withoutEnlargement: true })
      .webp({ quality });

  let output = await pipeline().toBuffer();

  while (output.length > TARGET_IMAGE_BYTES && (width > 360 || quality > 28)) {
    if (quality > 32) quality -= 8;
    else width = Math.max(360, Math.round(width * 0.85));
    output = await pipeline().toBuffer();
  }

  return output;
}

export async function uploadAdminImage(
  file: File,
  scope: ImageUploadScope,
): Promise<ImageUploadResult> {
  if (!isUploadFile(file)) {
    throw new Error("Please choose an image file.");
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    throw new Error("Please choose a PNG, JPEG, or WebP image.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image must be under 10MB.");
  }

  const original = Buffer.from(await file.arrayBuffer());
  const compressed = await compressToTarget(original);
  const path = `${scope}/${crypto.randomUUID()}.webp`;
  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(SITE_ASSETS_BUCKET).upload(path, compressed, {
    contentType: "image/webp",
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) throw new Error(`Image upload failed: ${error.message}`);

  const { data } = supabase.storage.from(SITE_ASSETS_BUCKET).getPublicUrl(path);
  return {
    publicUrl: data.publicUrl,
    path,
    contentType: "image/webp",
    size: compressed.length,
  };
}
