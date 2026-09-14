"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TestimonialFormProps {
  token: string;
}

export function TestimonialForm({ token }: TestimonialFormProps) {
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  async function handleSubmit(formData: FormData) {
    if (rating === 0) {
      toast.error("Please select a rating", "You must rate your experience before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          rating,
          full_name: formData.get("full_name"),
          event_type: formData.get("event_type"),
          quote: formData.get("quote"),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit testimonial");
      }

      toast.success("Thank you!", "Your testimonial has been submitted for review.");
      window.location.href = "/testimonial/thank-you";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      toast.error("Submission failed", message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <div className="space-y-2">
        <Label htmlFor="full_name">Your Name</Label>
        <Input
          id="full_name"
          name="full_name"
          type="text"
          placeholder="Your Name"
          required
          className="mt-1"
        />
      </div>

      <div className="space-y-2">
        <Label>Rating *</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <label key={star} className="cursor-pointer">
              <input
                type="radio"
                name="rating"
                value={star}
                className="sr-only peer"
                onChange={() => setRating(star)}
              />
              <Star
                className="w-8 h-8 text-gray-300 peer-checked:text-yellow-400 peer-hover:text-yellow-300 transition-colors"
                fill={star <= rating ? "currentColor" : "none"}
              />
            </label>
          ))}
        </div>
        <p className="text-xs text-[var(--color-muted-foreground)]">Click to rate (1-5 stars)</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="event_type">Event Type (Optional)</Label>
        <Input
          id="event_type"
          name="event_type"
          type="text"
          placeholder="e.g. Bridal, Reception, Party"
          className="mt-1"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="quote">Your Testimonial</Label>
        <Textarea
          id="quote"
          name="quote"
          placeholder="Share your experience with us..."
          required
          className="mt-1"
          rows={4}
        />
      </div>

      <Button type="submit" variant="accent" className="w-full" loading={submitting}>
        Submit Testimonial
      </Button>
    </form>
  );
}
