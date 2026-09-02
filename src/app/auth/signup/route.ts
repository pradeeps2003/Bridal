import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;

  const supabase = await createClient();
  const adminClient = createAdminClient();

  // Create auth user
  const { data: { user }, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError || !user) {
    return NextResponse.json({ error: authError?.message || "Failed to create account" }, { status: 400 });
  }

  const customerPayload = {
    auth_user_id: user.id,
    full_name: fullName,
    phone,
    email,
    whatsapp: phone,
  };

  const { data: existingCustomer } = await adminClient
    .from("customers")
    .select("id")
    .ilike("email", email)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { error: customerError } = existingCustomer
    ? await adminClient.from("customers").update(customerPayload).eq("id", existingCustomer.id)
    : await adminClient.from("customers").insert(customerPayload);

  if (customerError) {
    console.error("Failed to create customer record:", customerError);
  }

  const {
    data: { user: sessionUser },
  } = await supabase.auth.getUser();

  redirect(sessionUser ? "/account" : "/login?registered=1");
}