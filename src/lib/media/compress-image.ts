export const TARGET_IMAGE_BYTES = 50 * 1024;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image."));
    };
    image.src = url;
  });
}

async function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not compress the image."))),
      type,
      quality,
    );
  });
}

/**
 * Shrinks an admin upload to WebP under 50KB so slow networks can still load looks quickly.
 */
export async function compressImageForUpload(file: File): Promise<File> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image must be under 10MB.");
  }

  const image = await loadImage(file);
  let width = Math.min(image.width, 960);
  let quality = 0.72;
  let type: "image/webp" | "image/jpeg" = "image/webp";
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser cannot compress images.");

  let blob: Blob | null = null;
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const ratio = width / image.width;
    canvas.width = Math.max(1, Math.round(image.width * ratio));
    canvas.height = Math.max(1, Math.round(image.height * ratio));
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    try {
      blob = await canvasToBlob(canvas, type, quality);
    } catch {
      type = "image/jpeg";
      blob = await canvasToBlob(canvas, type, quality);
    }
    if (blob.size <= TARGET_IMAGE_BYTES) break;
    if (quality > 0.32) quality -= 0.08;
    else width = Math.max(360, Math.round(width * 0.85));
  }

  if (!blob) throw new Error("Could not compress the image.");

  const extension = type === "image/jpeg" ? ".jpg" : ".webp";
  const name = file.name.replace(/\.[^.]+$/, "") + extension;
  return new File([blob], name, { type, lastModified: Date.now() });
}

export function putFileInInput(input: HTMLInputElement, file: File) {
  const transfer = new DataTransfer();
  transfer.items.add(file);
  input.files = transfer.files;
}
