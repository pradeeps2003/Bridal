import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getSupabasePublicConfig } from "@/lib/supabase/config";

function copyResponseCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => to.cookies.set(cookie));
  return to;
}

function clearInvalidAuthCookies(request: NextRequest, response: NextResponse) {
  request.cookies.getAll().forEach(({ name }) => {
    if (name.startsWith("sb-") && name.includes("-auth-token")) {
      response.cookies.delete(name);
    }
  });
}

async function userIsAdmin(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
) {
  const { data } = await supabase
    .from("admins")
    .select("id")
    .eq("id", userId)
    .eq("is_active", true)
    .maybeSingle();
  return Boolean(data?.id);
}

export async function updateSession(request: NextRequest) {
  const config = getSupabasePublicConfig();
  let response = NextResponse.next({ request });

  if (!config) {
    return response;
  }

  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (
    authError?.message.toLowerCase().includes("invalid refresh token") ||
    authError?.message.toLowerCase().includes("refresh token not found")
  ) {
    clearInvalidAuthCookies(request, response);
  }

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAccountRoute = pathname.startsWith("/account");
  const isLoginRoute = pathname === "/admin/login";
  const isCustomerAuthRoute =
    pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password";

  const admin = user ? await userIsAdmin(supabase, user.id) : false;

  if (isAdminRoute && !isLoginRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set("redirect", pathname);
    return copyResponseCookies(response, NextResponse.redirect(loginUrl));
  }

  // Public-site logins are customers. Do not bounce them around /admin.
  if (isAdminRoute && !isLoginRoute && user && !admin) {
    const accountUrl = request.nextUrl.clone();
    accountUrl.pathname = "/account";
    accountUrl.search = "";
    return copyResponseCookies(response, NextResponse.redirect(accountUrl));
  }

  if (isLoginRoute && user && admin) {
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = "/admin";
    adminUrl.search = "";
    return copyResponseCookies(response, NextResponse.redirect(adminUrl));
  }

  if (isLoginRoute && user && !admin) {
    const accountUrl = request.nextUrl.clone();
    accountUrl.pathname = "/account";
    accountUrl.search = "";
    return copyResponseCookies(response, NextResponse.redirect(accountUrl));
  }

  if (isAccountRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return copyResponseCookies(response, NextResponse.redirect(loginUrl));
  }

  if (isCustomerAuthRoute && user) {
    const nextUrl = request.nextUrl.clone();
    nextUrl.pathname = admin ? "/admin" : "/account";
    nextUrl.search = "";
    return copyResponseCookies(response, NextResponse.redirect(nextUrl));
  }

  return response;
}
