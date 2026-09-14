"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function HeroBookButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    // Preload the book page
    router.prefetch("/book");
    // Navigate after brief delay to show loading state
    setTimeout(() => {
      router.push("/book");
    }, 100);
  };

  return (
    <Button 
      size="lg" 
      variant="modern" 
      onClick={handleClick}
      loading={isLoading}
      disabled={isLoading}
      className="h-12 w-full rounded-full px-7 sm:w-auto"
    >
      Book your date
    </Button>
  );
}
