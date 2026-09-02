"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";

import { FeedbackDialog } from "@/components/ui/feedback-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [feedback, setFeedback] = useState<{ title: string; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to send message");
      
      const adminWa = json.data?.adminWhatsapp;
      if (adminWa) {
        const adminWaFormatted = adminWa.startsWith("91") ? adminWa : `91${adminWa}`;
        const text = encodeURIComponent(`Hi Glow with Rubi! I have a question.\n\n*Name:* ${data.name}\n*Message:* ${data.message}`);
        window.location.href = `https://wa.me/${adminWaFormatted}?text=${text}`;
      } else {
        setState("success");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setErrorMsg(message);
      setFeedback({ title: "Message could not be sent", message });
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-on-accent)]">
          <Check className="h-6 w-6" />
        </div>
        <h3 className="font-[family-name:var(--font-heading)] text-xl">Message sent</h3>
        <p className="max-w-xs text-sm text-[var(--color-muted-foreground)]">
          We will reply on WhatsApp. To lock a date, use Book Your Date — no need to send the same details again.
        </p>
        <Button variant="modern" asChild className="h-11">
          <Link href="/book">Book a date</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-4">
      {state === "error" && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400">
          {errorMsg || "Failed to send message. Please try again."}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="Your name" required className="rounded-lg" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">WhatsApp number</Label>
          <Input id="phone" name="phone" type="tel" placeholder="+91 8********2" required className="rounded-lg" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Your question</Label>
        <Textarea
          id="message"
          name="message"
          rows={3}
          placeholder="Ask about hair extensions, jewellery setting, or anything that is not a date hold…"
          required
          className="rounded-lg"
        />
      </div>

      <Button variant="modern" size="lg" type="submit" className="h-11 w-full" disabled={state === "loading"}>
        {state === "loading" ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending…
          </span>
        ) : (
          "Send question"
        )}
      </Button>
    </form>
    <FeedbackDialog
      open={!!feedback}
      title={feedback?.title ?? ""}
      message={feedback?.message ?? ""}
      onClose={() => setFeedback(null)}
    />
    </>
  );
}
