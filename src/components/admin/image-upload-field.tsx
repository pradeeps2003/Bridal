"use client";

import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { compressImageForUpload, putFileInInput } from "@/lib/media/compress-image";

interface ImageUploadFieldProps {
  id: string;
  name?: string;
  label?: string;
  currentUrl?: string | null;
  required?: boolean;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function ImageUploadField({
  id,
  name = "image_file",
  label = "Image file",
  currentUrl,
  required = false,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(currentUrl ?? "");
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(currentUrl ?? "");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, currentUrl]);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {previewUrl ? (
        <div className="relative overflow-hidden rounded-(--radius-md) border border-(--color-border) bg-(--color-muted)">
          {compressing ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/45 text-sm font-medium text-white">
              Shrinking image…
            </div>
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Selected image preview" className="aspect-[3/2] max-h-48 w-full object-cover" />
        </div>
      ) : null}
      <Input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        required={required}
        disabled={compressing}
        onChange={async (event) => {
          const chosen = event.target.files?.[0];
          if (!chosen) {
            setFile(null);
            setOriginalSize(null);
            setError(null);
            return;
          }
          setError(null);
          setOriginalSize(chosen.size);
          setCompressing(true);
          try {
            const compressed = await compressImageForUpload(chosen);
            if (inputRef.current) putFileInInput(inputRef.current, compressed);
            setFile(compressed);
          } catch (cause) {
            setFile(null);
            setError(cause instanceof Error ? cause.message : "Could not compress that image.");
            event.target.value = "";
          } finally {
            setCompressing(false);
          }
        }}
        className="h-auto cursor-pointer px-3 py-2 text-sm file:mr-3 file:rounded-(--radius-sm) file:border-0 file:bg-(--color-primary) file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-(--color-on-primary)"
      />
      <p className="text-xs text-(--color-muted-foreground)">
        {compressing
          ? "Compressing so the stored file stays under 50KB…"
          : file
            ? `${file.name} · stored ${formatBytes(file.size)}${originalSize ? ` (from ${formatBytes(originalSize)})` : ""}`
            : currentUrl
              ? "Choose a file to replace the current image. Large photos are shrunk to under 50KB."
              : "PNG, JPEG, or WebP up to 10MB. We shrink it to under 50KB before saving."}
      </p>
      {error ? (
        <p role="alert" className="text-xs text-(--color-destructive)">
          {error}
        </p>
      ) : null}
    </div>
  );
}
