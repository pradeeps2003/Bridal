import crypto from "crypto";

import { getClientEnv, getServerEnv } from "@/lib/env";

export function isRazorpayConfigured(): boolean {
  const server = getServerEnv();
  const client = getClientEnv();
  return Boolean(
    server.RAZORPAY_KEY_ID &&
      server.RAZORPAY_KEY_SECRET &&
      client.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  );
}

export async function createRazorpayOrder(amount: number, receipt: string) {
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = getServerEnv();
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay is not configured.");
  }

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64")}`,
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt,
      payment_capture: 1,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Razorpay order failed: ${err}`);
  }

  return response.json() as Promise<{ id: string; amount: number; currency: string }>;
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  const { RAZORPAY_KEY_SECRET } = getServerEnv();
  if (!RAZORPAY_KEY_SECRET) return false;

  const expected = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return expected === signature;
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const { RAZORPAY_WEBHOOK_SECRET } = getServerEnv();
  if (!RAZORPAY_WEBHOOK_SECRET) return false;

  const expected = crypto
    .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");

  return expected === signature;
}
