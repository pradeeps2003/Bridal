import { describe, expect, it } from "vitest";

import { parseAdminLoginFields } from "@/lib/auth/admin-login";

describe("parseAdminLoginFields", () => {
  it("requires email and password", () => {
    const form = new FormData();
    const parsed = parseAdminLoginFields(form);
    expect(parsed.ok).toBe(false);
  });

  it("reads credentials and default redirect", () => {
    const form = new FormData();
    form.set("email", "  owner@studio.com ");
    form.set("password", "secret-pass");
    const parsed = parseAdminLoginFields(form);
    expect(parsed).toEqual({
      ok: true,
      email: "owner@studio.com",
      password: "secret-pass",
      redirectTo: "/admin",
    });
  });
});
