import { afterEach, describe, expect, it, vi } from "vitest";

const { createAdminClientMock } = vi.hoisted(() => ({
  createAdminClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: createAdminClientMock,
}));

import { syncBookingBalance } from "@/lib/payments/confirm";

afterEach(() => {
  vi.clearAllMocks();
});

describe("syncBookingBalance", () => {
  it("stores the total less captured payments and ignores pending payments", async () => {
    const balanceUpdates: Record<string, unknown>[] = [];
    const bookingsTable = {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: { total: 24000 }, error: null }),
        })),
      })),
      update: vi.fn((values: Record<string, unknown>) => {
        balanceUpdates.push(values);
        return { eq: vi.fn().mockResolvedValue({ error: null }) };
      }),
    };
    const paymentsTable = {
      select: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({
          data: [
            { amount: 7200, status: "CAPTURED" },
            { amount: 2000, status: "CAPTURED" },
            { amount: 7200, status: "PENDING" },
          ],
          error: null,
        }),
      })),
    };
    createAdminClientMock.mockReturnValue({
      from: vi.fn((table: string) => table === "bookings" ? bookingsTable : paymentsTable),
    });

    await expect(syncBookingBalance("booking-1")).resolves.toBe(14800);
    expect(balanceUpdates).toHaveLength(1);
    expect(balanceUpdates[0]).toMatchObject({ balance: 14800 });
  });

  it("never stores a negative balance after overpayment", async () => {
    const bookingsTable = {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: { total: 10000 }, error: null }),
        })),
      })),
      update: vi.fn((values: Record<string, unknown>) => ({
        eq: vi.fn().mockResolvedValue({ error: null, values }),
      })),
    };
    const paymentsTable = {
      select: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ data: [{ amount: 12000, status: "CAPTURED" }], error: null }),
      })),
    };
    createAdminClientMock.mockReturnValue({
      from: vi.fn((table: string) => table === "bookings" ? bookingsTable : paymentsTable),
    });

    await expect(syncBookingBalance("booking-2")).resolves.toBe(0);
  });
});