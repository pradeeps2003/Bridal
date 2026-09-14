export function parseAdminLoginFields(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "/admin");

  if (!email || !password) {
    return { ok: false as const, error: "Email and password are required." };
  }

  return { ok: true as const, email, password, redirectTo };
}
