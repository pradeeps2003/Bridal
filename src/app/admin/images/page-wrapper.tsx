"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ImagePlus } from "lucide-react";

import { updateBrandImagesSettingsAction } from "@/app/admin/actions";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { useAdminNotification } from "@/components/ui/admin-notification";
import type { SiteSettings } from "@/types";

type ImageRow = {
  id: string;
  currentUrl: string | null;
};

function createImageRows(urls: string[] | undefined) {
  return (urls?.length ? urls : []).map((url) => ({
    id: crypto.randomUUID(),
    currentUrl: url,
  }));
}

export function BrandImagesPageWrapper({
  initialSettings,
}: {
  initialSettings: SiteSettings;
}) {
  const router = useRouter();
  const { showNotification, NotificationComponent } = useAdminNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState(initialSettings);
  const [showcaseImages, setShowcaseImages] = useState<ImageRow[]>(
    () => createImageRows(initialSettings.hero_image_urls),
  );

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  useEffect(() => {
    setShowcaseImages(createImageRows(settings.hero_image_urls));
  }, [settings.hero_image_urls]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    showNotification("loading", "Saving brand images...");

    try {
      const formData = new FormData(event.currentTarget);
      await updateBrandImagesSettingsAction(formData);
      showNotification("success", "Brand images updated!");
      router.refresh();
    } catch (error) {
      showNotification(
        "error",
        error instanceof Error ? error.message : "Could not save brand images.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {NotificationComponent}
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-accent)">
              Content
            </p>
            <h1 className="mt-1 font-[family-name:var(--font-heading)] text-3xl text-(--color-foreground) sm:text-4xl">
              Brand Images
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-(--color-muted-foreground)">
              Manage the shared homepage and footer gallery plus the studio login image.
            </p>
          </div>
          <span className="rounded-full border border-(--color-border) bg-(--color-card) px-3 py-1 text-xs text-(--color-muted-foreground)">
            {showcaseImages.length} gallery image{showcaseImages.length === 1 ? "" : "s"}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" aria-busy={isSubmitting}>
          <section className="rounded-(--radius-xl) border border-(--color-border) bg-(--color-card)">
            <header className="border-b border-(--color-border) bg-(--color-muted)/30 px-5 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <ImagePlus className="mt-0.5 h-5 w-5 shrink-0 text-(--color-secondary)" aria-hidden="true" />
                  <div className="min-w-0">
                    <h2 className="font-[family-name:var(--font-heading)] text-xl text-(--color-foreground)">
                      Shared gallery
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-(--color-muted-foreground)">
                      These images are used in both the homepage card fan and the footer strip.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setShowcaseImages((current) => [
                      ...current,
                      { id: crypto.randomUUID(), currentUrl: null },
                    ])
                  }
                >
                  Add image
                </Button>
              </div>
            </header>

            <div className="grid gap-5 p-5 lg:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)]">
              <div className="space-y-4">
                <div className="rounded-(--radius-lg) border border-dashed border-(--color-border) p-4 text-xs leading-relaxed text-(--color-muted-foreground)">
                  Remove all images if you want to hide both the homepage cards and the footer strip.
                </div>
                <div className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-muted)/20 p-4">
                  <p className="text-sm font-semibold text-(--color-foreground)">
                    Admin login image
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-(--color-muted-foreground)">
                    This image appears only on the split-screen studio login page.
                  </p>
                  <div className="mt-4">
                    <ImageUploadField
                      id="admin-login-image"
                      name="admin_login_image_file"
                      label="Studio login image"
                      currentUrl={settings.admin_login_image_url}
                    />
                  </div>
                </div>
              </div>

              <div>
                <input type="hidden" name="hero_image_slots" value={showcaseImages.length} />
                <div className="grid gap-4 md:grid-cols-2">
                  {showcaseImages.map((image, index) => (
                    <div
                      key={image.id}
                      className="rounded-(--radius-lg) border border-(--color-border) p-3"
                    >
                      <input
                        type="hidden"
                        name={`hero_image_current_${index}`}
                        value={image.currentUrl ?? ""}
                      />
                      <ImageUploadField
                        id={`hero-image-${image.id}`}
                        name={`hero_image_file_${index}`}
                        label={`Gallery image ${index + 1}`}
                        currentUrl={image.currentUrl}
                      />
                      <div className="mt-3 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setShowcaseImages((current) =>
                              current.filter((item) => item.id !== image.id),
                            )
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="flex justify-end">
            <Button type="submit" size="lg" loading={isSubmitting}>
              Save brand images
            </Button>
          </div>
        </form>

        <Link href="/admin/settings" className="text-sm text-(--color-accent) underline-offset-4 hover:underline">
          Open general settings
        </Link>
      </div>
    </>
  );
}
