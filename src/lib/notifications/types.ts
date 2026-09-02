import type { AdminRole, NotificationChannel, NotificationStatus } from "@/types";

export interface NotificationResult {
  channel: NotificationChannel;
  success: boolean;
  status: NotificationStatus;
  error?: string;
}

export interface BookingNotificationContext {
  bookingId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  packageName: string;
  date: string;
  time: string;
  total?: string;
  advance?: string;
}

export interface DeliveryLog {
  id: string;
  bookingId: string | null;
  customerName: string | null;
  channel: NotificationChannel;
  status: NotificationStatus;
  recipientPhone: string | null;
  recipientEmail: string | null;
  templateKey: string;
  createdAt: string;
  sentAt: string | null;
  error: string | null;
}

export interface TeamMember {
  id: string;
  email: string;
  fullName: string | null;
  role: AdminRole;
  isActive: boolean;
}

export type AdminPermission =
  | "dashboard.view"
  | "bookings.manage"
  | "enquiries.manage"
  | "calendar.manage"
  | "catalogue.manage"
  | "coupons.manage"
  | "content.manage"
  | "settings.manage"
  | "team.manage";
