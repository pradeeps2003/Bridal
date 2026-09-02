export const BOOKING_STATUSES = [
  "REQUESTED",
  "HELD",
  "ADMIN_APPROVED",
  "PAYMENT_PENDING",
  "CONFIRMED",
  "REJECTED",
  "EXPIRED",
  "CANCELLED",
  "COMPLETED",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const NOTIFICATION_CHANNELS = ["WHATSAPP", "EMAIL", "SMS"] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export const NOTIFICATION_STATUSES = ["PENDING", "SENT", "FAILED"] as const;
export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];

export type AdminRole = "owner" | "staff";
export type AnalyticsRange = "7d" | "30d" | "90d";

export const PRICING_TYPES = [
  "FIXED",
  "STARTING_FROM",
  "CUSTOM_QUOTE",
] as const;

export type PricingType = (typeof PRICING_TYPES)[number];

export const PORTFOLIO_CATEGORIES = [
  "Bridal",
  "Reception",
  "Engagement",
  "Party",
  "Maternity",
  "Hair",
] as const;

export type PortfolioCategory = (typeof PORTFOLIO_CATEGORIES)[number];

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  display_order: number;
}

export interface Package {
  id: string;
  service_id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  pricing_type: PricingType;
  duration_hours: number;
  is_active: boolean;
  display_order: number;
  inclusions?: string[];
  image_url?: string | null;
  sale_type?: "none" | "percent" | "amount";
  sale_value?: number;
  sale_starts_at?: string | null;
  sale_ends_at?: string | null;
}

export interface Addon {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  pricing_type?: PricingType;
  is_active: boolean;
  display_order: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: "percent" | "amount";
  value: number;
  min_order: number;
  starts_at: string | null;
  ends_at: string | null;
  max_uses: number | null;
  used_count: number;
  package_ids: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  business_name: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  email: string;
  address: string;
  google_review_url?: string;
}

export interface BookingSettings {
  min_advance_hours: number;
  hold_duration_hours: number;
  buffer_hours: number;
  cancellation_policy: string;
}

export interface PaymentSettings {
  mode: "ADVANCE_PERCENTAGE" | "FIXED_ADVANCE";
  advance_percentage: number;
  fixed_advance: number;
  upi_id?: string;
}

export interface ServiceSettings {
  home_service_enabled: boolean;
  travel_charge_base: number;
  travel_charge_per_km: number;
  travel_radius_km: number;
}

export interface Booking {
  id: string;
  customer_id: string;
  package_id: string | null;
  service_id: string | null;
  status: BookingStatus;
  event_type: string | null;
  event_date: string;
  start_time: string;
  end_time: string;
  location_type: string;
  address: string | null;
  pincode: string | null;
  subtotal: number;
  addons_total: number;
  travel_fee: number;
  discount: number;
  sale_discount: number;
  coupon_discount: number;
  coupon_id: string | null;
  total: number;
  advance: number;
  balance: number;
  hold_expires_at: string | null;
  notes: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  customers?: Customer;
  packages?: Package;
  services?: Service;
  review_token?: string | null;
  review_requested_at?: string | null;
}

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  whatsapp: string | null;
}

export interface PortfolioItem {
  id: string;
  title: string | null;
  category: PortfolioCategory;
  image_url: string | null;
  video_url: string | null;
  is_published: boolean;
  display_order: number;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
  available: boolean;
}

export interface Testimonial {
  id: string;
  booking_id: string | null;
  full_name: string;
  quote: string;
  event_type: string | null;
  is_published: boolean;
  created_at: string;
}

export interface PriceBreakdown {
  subtotal: number;
  addons_total: number;
  travel_fee: number;
  discount: number;
  total: number;
  advance: number;
  balance: number;
  is_custom_quote: boolean;
  has_negotiable_addons: boolean;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}

export interface AdminAnalytics {
  range: AnalyticsRange;
  fromDate: string;
  toDate: string;
  completedRevenue: number;
  bookingCount: number;
  averageBooking: number;
  cancelledCount: number;
  series: Array<{
    date: string;
    revenue: number;
    bookings: number;
    cancelled: number;
  }>;
}

export interface ApiSuccess<T> {
  data: T;
}
