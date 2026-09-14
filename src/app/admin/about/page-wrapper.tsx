"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateAboutSettingsAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { useNotification } from "@/components/ui/notification-toast";
import type { AboutSettings } from "@/types";
import { ArrowUpRight, ExternalLink } from "lucide-react";

export function AboutPageWrapper({ about }: { about: AboutSettings }) {
  const router = useRouter();
  const { showNotification, NotificationComponent } = useNotification();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    showNotification("loading", "Saving changes...");
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      try {
        await updateAboutSettingsAction(formData);
        showNotification("success", "Changes saved successfully!");
        router.refresh();
      } catch (actionError) {
        showNotification("error", actionError instanceof Error ? actionError.message : "Couldn't save changes. Try again.");
        setError(actionError instanceof Error ? actionError.message : "Couldn't save changes. Try again.");
      }
    });
  }

  return (
    <>
      {NotificationComponent}
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-accent)">Content</p>
            <h1 className="mt-1 font-[family-name:var(--font-heading)] text-3xl text-(--color-foreground) sm:text-4xl">About page</h1>
            <p className="mt-2 max-w-2xl text-sm text-(--color-muted-foreground)">Edit the copy visitors see on your public About page.</p>
          </div>
          <Button variant="outline" asChild><Link href="/about" target="_blank" rel="noopener noreferrer">View page <ExternalLink className="h-4 w-4" aria-hidden="true" /></Link></Button>
        </div>

        <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.8fr)]">
          <Card>
            <CardHeader><h2 className="font-[family-name:var(--font-heading)] text-xl">Page copy</h2><p className="mt-1 text-xs text-(--color-muted-foreground)">Keep the content clear, truthful, and easy to read.</p></CardHeader>
            <CardContent className="space-y-5">
              <div><Label htmlFor="about-badge">Badge</Label><Input id="about-badge" name="badge" defaultValue={about.badge} className="mt-1.5" /></div>
              <div><Label htmlFor="about-title">Page title</Label><Input id="about-title" name="title" defaultValue={about.title} required className="mt-1.5" /></div>
              <div><Label htmlFor="about-description">Page description</Label><Textarea id="about-description" name="description" defaultValue={about.description} required rows={3} className="mt-1.5" /></div>
              <div className="border-t border-(--color-border) pt-5"><p className="text-sm font-semibold text-(--color-foreground)">Artist introduction</p><div className="mt-4 space-y-4"><div><Label htmlFor="about-artist-label">Section label</Label><Input id="about-artist-label" name="artist_label" defaultValue={about.artist_label} className="mt-1.5" /></div><div><Label htmlFor="about-artist-name">Artist name</Label><Input id="about-artist-name" name="artist_name" defaultValue={about.artist_name} required className="mt-1.5" /></div><div><Label htmlFor="about-artist-statement">Artist statement</Label><Textarea id="about-artist-statement" name="artist_statement" defaultValue={about.artist_statement} required rows={3} className="mt-1.5" /></div><ImageUploadField id="about-artist-image" label="Artist photo" currentUrl={about.artist_image_url} /><div><Label htmlFor="about-body">Introduction paragraph</Label><Textarea id="about-body" name="body" defaultValue={about.body} required rows={6} className="mt-1.5" /></div></div></div>
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card><CardHeader><h2 className="font-[family-name:var(--font-heading)] text-xl">What matters</h2><p className="mt-1 text-xs text-(--color-muted-foreground)">Edit the three supporting pillars shown below the introduction.</p></CardHeader><CardContent className="space-y-5">{about.pillars.map((pillar, index) => <div key={index} className="space-y-3 border-b border-(--color-border) pb-5 last:border-0 last:pb-0"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--color-accent)">Pillar {index + 1}</p><div><Label htmlFor={`about-pillar-title-${index}`}>Title</Label><Input id={`about-pillar-title-${index}`} name={`pillar_${index}_title`} defaultValue={pillar.title} required className="mt-1.5" /></div><div><Label htmlFor={`about-pillar-copy-${index}`}>Copy</Label><Textarea id={`about-pillar-copy-${index}`} name={`pillar_${index}_copy`} defaultValue={pillar.copy} required rows={4} className="mt-1.5" /></div></div>)}</CardContent></Card>

            <div className="rounded-(--radius-xl) border border-(--color-border) bg-(--color-card) p-4"><p className="text-sm font-semibold text-(--color-foreground)">Save ledger</p><p className="mt-1 text-xs text-(--color-muted-foreground)">Save the page after editing. Your public page uses the same saved content.</p>{error && <p role="alert" className="mt-3 rounded-md border border-(--color-destructive)/30 bg-(--color-destructive)/5 px-3 py-2 text-xs text-(--color-destructive)">{error}</p>}<Button type="submit" variant="default" size="lg" className="mt-4 w-full" loading={isPending}>Save changes<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Button></div>
          </div>
        </form>

        <Link href="/admin" className="text-sm text-(--color-accent) underline-offset-4 hover:underline">← Back to dashboard</Link>
      </div>
    </>
  );
}
