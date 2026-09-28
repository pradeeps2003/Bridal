import assert from "node:assert/strict";

const baseUrl = (process.env.TEST_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const host = new URL(baseUrl).hostname;

if (!(["localhost", "127.0.0.1", "::1"] as string[]).includes(host)) {
  throw new Error("This smoke script only runs against localhost; it never tests production.");
}

const pageRoutes = [
  "/",
  "/about",
  "/account",
  "/admin",
  "/admin/about",
  "/admin/addons",
  "/admin/bookings",
  "/admin/bookings/00000000-0000-4000-8000-000000000001",
  "/admin/calendar",
  "/admin/coupons",
  "/admin/enquiries",
  "/admin/images",
  "/admin/login",
  "/admin/packages",
  "/admin/portfolio",
  "/admin/services",
  "/admin/settings",
  "/admin/settings/notifications",
  "/admin/settings/team",
  "/admin/testimonials",
  "/book",
  "/book/confirmation/00000000-0000-4000-8000-000000000001",
  "/contact",
  "/cookies",
  "/faq",
  "/forgot-password",
  "/login",
  "/packages",
  "/packages/bridal-luxury",
  "/portfolio",
  "/privacy",
  "/reset-password",
  "/services",
  "/signup",
  "/terms",
  "/testimonial",
  "/testimonial/thank-you",
];

async function checkRoute(route: string) {
  const response = await fetch(`${baseUrl}${route}`, { redirect: "follow" });
  assert.ok(response.status < 500, `${route} returned HTTP ${response.status}`);
  await response.arrayBuffer();
}

async function checkApiStatus(name: string, response: Response, expectedStatus: number) {
  const body = await response.text();
  assert.equal(response.status, expectedStatus, `${name}: expected ${expectedStatus}, got ${response.status}: ${body}`);
}

async function main() {
  for (const route of pageRoutes) {
    await checkRoute(route);
  }

  await checkApiStatus(
    "invalid booking input",
    await fetch(`${baseUrl}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }),
    400,
  );

  await checkApiStatus(
    "invalid contact input",
    await fetch(`${baseUrl}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "A", phone: "1", message: "short" }),
    }),
    400,
  );

  await checkApiStatus(
    "missing card payment fields",
    await fetch(`${baseUrl}/api/payments/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }),
    400,
  );

  await checkApiStatus(
    "missing payment verification fields",
    await fetch(`${baseUrl}/api/payments/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }),
    400,
  );

  const invalidUpiForm = new FormData();
  await checkApiStatus(
    "invalid UPI report",
    await fetch(`${baseUrl}/api/payments/upi-report`, { method: "POST", body: invalidUpiForm }),
    400,
  );

  console.log(`Passed: ${pageRoutes.length} local page routes and 5 negative API cases.`);
  console.log("No valid booking, payment, cancellation, or admin write was submitted.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});