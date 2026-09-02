import { NextResponse } from "next/server";
import { z } from "zod";

import { sendWhatsAppNotification } from "@/lib/notifications/whatsapp";
import { notifyAdminsOfEnquiry } from "@/lib/notifications/orchestrator";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteSettings } from "@/lib/data/settings";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(6, "Phone is required"),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().min(8, "Please add a short question"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { name, phone, email, message } = parsed.data;
    const supabase = createAdminClient();

    const { error: insertError } = await supabase.from("enquiries").insert({
      name,
      phone,
      email: email || null,
      message,
      source: "contact_form",
    });
    
    if (insertError) {
      console.error("[contact] Failed to save enquiry:", insertError.message);
      return NextResponse.json(
        { error: "Failed to save your enquiry. Please try again or contact us directly." },
        { status: 500 },
      );
    }

    await notifyAdminsOfEnquiry({ name, phone, message });

    const customerResult = await sendWhatsAppNotification({
      phone,
      message:
        `Hi ${name}! We received your enquiry at Glow with Rubi.\n\n` +
        `We'll get back to you within 4–6 hours. In the meantime, feel free to browse our packages at glowwithrubi.com/packages.`,
      templateKey: "contact_received",
    });

    if (!customerResult.success) {
      console.error("[contact] Failed to send customer notification:", customerResult.error);
    }
    
    const settings = await getSiteSettings();
    const adminWhatsapp = settings.whatsapp?.replace(/\D/g, "") || "";

    return NextResponse.json({ data: { success: true, adminWhatsapp } });
  } catch (err) {
    console.error("[contact] error:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
