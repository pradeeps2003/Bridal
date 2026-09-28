import { afterEach, describe, expect, it, vi } from "vitest";

const { createClientMock, isSupabaseConfiguredMock, redirectMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  isSupabaseConfiguredMock: vi.fn(),
  redirectMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: redirectMock }));
vi.mock("@/lib/supabase/server", () => ({ createClient: createClientMock }));
vi.mock("@/lib/supabase/config", () => ({ isSupabaseConfigured: isSupabaseConfiguredMock }));

import { adminLoginAction } from "@/app/admin/login/actions";

const DUMMY_LOGIN = {
  email: "owner@example.test",
  password: "dummy-test-only-password",
};

function loginForm(redirectTo = "/admin") {
  const formData = new FormData();
  formData.set("email", DUMMY_LOGIN.email);
  formData.set("password", DUMMY_LOGIN.password);
  formData.set("redirect", redirectTo);
  return formData;
}

function mockSupabaseLogin({
  signInResult = { data: { user: { id: "dummy-admin-id" } }, error: null },
  adminResult = { data: { id: "dummy-admin-id", is_active: true }, error: null },
}: {
  signInResult?: { data: { user: { id: string } | null }; error: { message: string } | null };
  adminResult?: { data: { id: string; is_active: boolean } | null; error: { message: string } | null };
} = {}) {
  const signInWithPassword = vi.fn().mockResolvedValue(signInResult);
  const signOut = vi.fn().mockResolvedValue({ error: null });
  const single = vi.fn().mockResolvedValue(adminResult);
  const eq = vi.fn().mockReturnThis();
  const client = {
    auth: { signInWithPassword, signOut },
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq, single })),
    })),
  };
  createClientMock.mockResolvedValue(client);
  return { client, signInWithPassword, signOut, single };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("adminLoginAction with dummy auth", () => {
  it("redirects an active dummy admin to the requested admin page", async () => {
    isSupabaseConfiguredMock.mockReturnValue(true);
    const { signInWithPassword, single, signOut } = mockSupabaseLogin();
    redirectMock.mockImplementation((path: string) => {
      throw new Error(`NEXT_REDIRECT:${path}`);
    });

    await expect(adminLoginAction(loginForm("/admin/settings/team"))).rejects.toThrow(
      "NEXT_REDIRECT:/admin/settings/team",
    );

    expect(signInWithPassword).toHaveBeenCalledWith(DUMMY_LOGIN);
    expect(single).toHaveBeenCalledOnce();
    expect(signOut).not.toHaveBeenCalled();
  });

  it("rejects invalid credentials without querying the admin table", async () => {
    isSupabaseConfiguredMock.mockReturnValue(true);
    const { client, signInWithPassword } = mockSupabaseLogin({
      signInResult: {
        data: { user: null },
        error: { message: "Invalid login credentials" },
      },
    });

    await expect(adminLoginAction(loginForm())).resolves.toEqual({
      error: "Invalid login credentials",
    });
    expect(signInWithPassword).toHaveBeenCalledOnce();
    expect(client.from).not.toHaveBeenCalled();
  });

  it("signs out an authenticated user who is not an active admin", async () => {
    isSupabaseConfiguredMock.mockReturnValue(true);
    const { signOut, single } = mockSupabaseLogin({
      adminResult: { data: null, error: { message: "No active admin row" } },
    });

    await expect(adminLoginAction(loginForm())).resolves.toEqual({
      error: "This account is not authorized for admin access.",
    });
    expect(single).toHaveBeenCalledOnce();
    expect(signOut).toHaveBeenCalledOnce();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("does not try authentication when Supabase is unconfigured", async () => {
    isSupabaseConfiguredMock.mockReturnValue(false);

    await expect(adminLoginAction(loginForm())).resolves.toMatchObject({
      error: expect.stringContaining("Supabase is not configured"),
    });
    expect(createClientMock).not.toHaveBeenCalled();
  });
});