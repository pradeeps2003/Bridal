import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export const BRAND_LOGO = "/logo.png";

export function BrandLogo({
  href = "/",
  className,
  imageClassName,
  priority = false,
  label = "Glow with Rubi home",
}: {
  href?: string | null;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  label?: string;
}) {
  const image = (
    <Image
      src={`${BRAND_LOGO}?v=5`}
      alt="Glow with Rubi makeup artist"
      width={727}
      height={644}
      priority={priority}
      unoptimized
      sizes="280px"
      style={{ width: "auto", height: "100%" }}
      className={cn("h-full w-auto max-h-full object-contain object-left", imageClassName)}
    />
  );

  const frame = cn(
    "inline-flex h-14 max-h-14 w-auto shrink-0 items-center overflow-hidden sm:h-16 sm:max-h-16",
    className,
  );

  if (!href) {
    return <div className={frame}>{image}</div>;
  }

  return (
    <Link href={href} className={frame} aria-label={label}>
      {image}
    </Link>
  );
}
