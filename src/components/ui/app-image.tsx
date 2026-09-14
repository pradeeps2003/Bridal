"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

const BLUR =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 10'%3E%3Cfilter id='b'%3E%3CfeGaussianBlur stdDeviation='1'/%3E%3C/filter%3E%3Crect width='16' height='10' fill='%23c4b5b0' filter='url(%23b)'/%3E%3C/svg%3E";

type AppImageProps = ImageProps & {
  frameClassName?: string;
};

export function AppImage({ className, frameClassName, alt, onLoad, fill, quality = 70, ...props }: AppImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={cn(
        "overflow-hidden bg-[var(--color-muted)]",
        fill ? "absolute inset-0" : "relative",
        frameClassName,
      )}
    >
      {!loaded ? (
        <div className="absolute inset-0 animate-pulse bg-[var(--color-muted)]" aria-hidden="true" />
      ) : null}
      <Image
        alt={alt}
        fill={fill}
        quality={quality}
        placeholder="blur"
        blurDataURL={BLUR}
        {...props}
        className={cn(
          "transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
        onLoad={(event) => {
          setLoaded(true);
          onLoad?.(event);
        }}
      />
    </div>
  );
}
