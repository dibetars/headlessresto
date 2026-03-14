// ============================================================
// @restaurantos/shared — Types, constants, and validation
// ============================================================

import { z } from "zod";

// ----- Enums / Constants -----

export const USER_ROLES = [
  "owner",
  "manager",
  "kitchen_staff",
  "wait_staff",
  "delivery_driver",
] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
  "completed",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_SOURCES = ["qr_menu", "pos", "delivery_platform"] as const;
export type OrderSource = (typeof ORDER_SOURCES)[number];

export const PAYMENT_STATUSES = [
  "pending",
  "succeeded",
  "failed",
  "refunded",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const DELIVERY_STATUSES = [
  "pending",
  "driver_assigned",
  "picked_up",
  "in_transit",
  "delivered",
  "cancelled",
  "failed",
] as const;
export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

export const ATTENDANCE_TYPES = [
  "clock_in",
  "clock_out",
  "break_start",
  "break_end",
] as const;
export type AttendanceType = (typeof ATTENDANCE_TYPES)[number];

export const COUPON_TYPES = [
  "percentage",
  "fixed_amount",
  "buy_x_get_y",
] as const;
export type CouponType = (typeof COUPON_TYPES)[number];

export const LICENSE_TIERS = [
  "starter",
  "professional",
  "enterprise",
] as const;
export type LicenseTier = (typeof LICENSE_TIERS)[number];

// ----- Entity Types -----

export interface Organization {
  id: string;
  name: string;
  slug: string;
  owner_user_id: string;
  brand_assets: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  org_id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  timezone: string;
  operating_hours: Record<string, unknown>;
  stripe_account_id: string | null;
  uber_fleet_api_key_enc: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface OrgMembership {
  id: string;
  user_id: string;
  org_id: string;
  location_id: string | null; // null = all locations
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface License {
  id: string;
  org_id: string;
  tier: LicenseTier;
  max_locations: number;
  purchased_at: string;
  hosting_expires_at: string;
  stripe_payment_id: string | null;
  is_active: boolean;
}

export interface StockItem {
  id: string;
  location_id: string;
  name: string;
  quantity: number;
  unit: string;
  cost_per_unit_cents: number | null;
  reorder_threshold: number | null;
  category: string | null;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  location_id: string;
  name: string;
  description: string | null;
  price_cents: number;
  category: string;
  image_url: string | null;
  is_available: boolean;
  allergens: string[];
  prep_time_minutes: number | null;
  sort_order: number;
  created_at: string;
}

export interface OrderItem {
  menu_item_id: string;
  name: string;
  quantity: number;
  price_cents: number;
}

export interface Order {
  id: string;
  location_id: string;
  source: OrderSource;
  status: OrderStatus;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  items: OrderItem[];
  subtotal_cents: number;
  tax_cents: number;
  tip_cents: number;
  discount_cents: number;
  total_cents: number;
  coupon_id: string | null;
  notes: string | null;
  table_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  stripe_payment_intent_id: string;
  stripe_account_id: string;
  status: PaymentStatus;
  amount_cents: number;
  currency: string;
  method: string | null;
  receipt_url: string | null;
  created_at: string;
}

export interface Delivery {
  id: string;
  order_id: string;
  uber_delivery_id: string | null;
  status: DeliveryStatus;
  pickup_address: string;
  dropoff_address: string;
  driver_name: string | null;
  driver_phone: string | null;
  estimated_delivery_at: string | null;
  actual_delivery_at: string | null;
  tracking_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaffSchedule {
  id: string;
  user_id: string;
  location_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  role: UserRole;
  notes: string | null;
  created_at: string;
}

export interface AttendanceLog {
  id: string;
  user_id: string;
  location_id: string;
  type: AttendanceType;
  logged_at: string;
  source: string;
  lat: number | null;
  lng: number | null;
}

export interface Coupon {
  id: string;
  location_id: string;
  code: string;
  type: CouponType;
  value: number;
  min_order_cents: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}

// ----- Zod Schemas (shared client + server validation) -----

export const createMenuItemSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  price_cents: z.number().int().positive(),
  category: z.string().min(1).max(100),
  image_url: z.string().url().optional(),
  allergens: z.array(z.string()).default([]),
  prep_time_minutes: z.number().int().positive().optional(),
  sort_order: z.number().int().default(0),
});

export const createOrderSchema = z.object({
  source: z.enum(ORDER_SOURCES),
  items: z
    .array(
      z.object({
        menu_item_id: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
  customer_name: z.string().max(200).optional(),
  customer_phone: z.string().max(20).optional(),
  customer_email: z.string().email().optional(),
  table_number: z.string().max(10).optional(),
  coupon_code: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
  tip_cents: z.number().int().min(0).default(0),
});

export const createStaffScheduleSchema = z.object({
  user_id: z.string().uuid(),
  shift_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
  role: z.enum(USER_ROLES),
  notes: z.string().max(500).optional(),
});

export const logAttendanceSchema = z.object({
  type: z.enum(ATTENDANCE_TYPES),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const createCouponSchema = z.object({
  code: z
    .string()
    .min(3)
    .max(50)
    .transform((v) => v.toUpperCase()),
  type: z.enum(COUPON_TYPES),
  value: z.number().positive(),
  min_order_cents: z.number().int().min(0).default(0),
  max_uses: z.number().int().positive().optional(),
  valid_from: z.string().datetime(),
  valid_until: z.string().datetime(),
});

// ----- Permission Helpers -----

const ROLE_HIERARCHY: Record<UserRole, number> = {
  owner: 100,
  manager: 80,
  kitchen_staff: 40,
  wait_staff: 40,
  delivery_driver: 20,
};

export function hasMinRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function canAccessModule(
  role: UserRole,
  module: "kitchen" | "staff" | "finances" | "orders" | "deliveries" | "settings"
): boolean {
  const access: Record<string, UserRole[]> = {
    kitchen: ["owner", "manager", "kitchen_staff"],
    staff: ["owner", "manager"],
    finances: ["owner", "manager"],
    orders: ["owner", "manager", "kitchen_staff", "wait_staff"],
    deliveries: ["owner", "manager", "delivery_driver"],
    settings: ["owner"],
  };
  return access[module]?.includes(role) ?? false;
}

// ----- Currency Helpers -----

export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function centsToDecimal(cents: number): number {
  return Math.round(cents) / 100;
}
