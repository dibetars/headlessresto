# RestaurantOS — Architecture Specification

## Overview

Multi-tenant restaurant operations SaaS. US market. Offline-first. Multi-location support per organization. One-time license model with hosting renewal.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Monorepo** | Turborepo + pnpm workspaces | Shared types, single CI, fast builds |
| **Backend** | NestJS (TypeScript) | Modular monolith maps to domain modules |
| **Database** | PostgreSQL via Supabase | RLS, auth, realtime, storage, edge functions |
| **Offline sync** | PowerSync | SQLite on-device, bidirectional sync with Supabase |
| **Cache / Queues** | Redis + BullMQ | Background jobs, session cache, rate limiting |
| **Web frontend** | Next.js 14 (App Router) + PWA | SSR for admin, service worker for offline stations |
| **Mobile** | React Native (Expo) | Delivery driver app, manager insights |
| **UI** | shadcn/ui + Tailwind | Ship fast, looks good, accessible |
| **Payments** | Stripe Connect (Standard) | Each restaurant connects their own Stripe account |
| **Deliveries** | Uber Direct API | Dispatch from restaurant to customer |
| **Hosting** | Vercel (web) + Fly.io (API) | Edge-ready, autoscale, cheap at low volume |
| **Mobile builds** | Expo EAS | OTA updates, managed builds |
| **Email** | Resend | Transactional email |
| **Notifications** | Expo Push + OneSignal | Mobile push + web push |

---

## Monorepo Structure

```
restaurantos/
├── apps/
│   ├── web/                     # Next.js — full restaurant management
│   │   ├── app/
│   │   │   ├── (auth)/          # Login, register, onboarding
│   │   │   ├── (dashboard)/     # Authenticated layout with sidebar
│   │   │   │   ├── kitchen/     # Stock, daily menu, coupons
│   │   │   │   ├── staff/       # Profiles, scheduling, attendance
│   │   │   │   ├── finances/    # Payroll, bookkeeping
│   │   │   │   ├── orders/      # Live orders, order history
│   │   │   │   ├── deliveries/  # Uber Fleet dispatch, tracking
│   │   │   │   ├── settings/    # Location settings, integrations
│   │   │   │   └── layout.tsx   # Sidebar + location switcher
│   │   │   ├── (stations)/      # Dedicated station views (fullscreen)
│   │   │   │   ├── kds/         # Kitchen display system
│   │   │   │   └── pos/         # Point of sale terminal
│   │   │   ├── menu/[slug]/     # Public QR menu (no auth)
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   │   ├── powersync.ts     # PowerSync client setup
│   │   │   ├── supabase.ts      # Supabase client (server + browser)
│   │   │   └── stripe.ts        # Stripe.js loader
│   │   ├── public/
│   │   │   └── sw.js            # Service worker for PWA
│   │   ├── next.config.js
│   │   └── package.json
│   │
│   ├── mobile/                  # React Native (Expo)
│   │   ├── app/                 # Expo Router (file-based)
│   │   │   ├── (auth)/
│   │   │   ├── (tabs)/
│   │   │   │   ├── dashboard/   # Quick insights, revenue, alerts
│   │   │   │   ├── deliveries/  # Active deliveries, driver tracking
│   │   │   │   ├── staff/       # Quick attendance, check-ins
│   │   │   │   └── notifications/
│   │   │   └── _layout.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   │   ├── powersync.ts
│   │   │   └── supabase.ts
│   │   ├── app.json
│   │   └── package.json
│   │
│   └── super-admin/             # Next.js — platform admin
│       ├── app/
│       │   ├── (auth)/
│       │   ├── (dashboard)/
│       │   │   ├── organizations/   # CRUD restaurants
│       │   │   ├── licenses/        # Track license status
│       │   │   ├── health/          # System health, error rates
│       │   │   ├── support/         # Bug reports, feature requests
│       │   │   └── billing/         # Hosting renewals
│       │   └── layout.tsx
│       └── package.json
│
├── packages/
│   ├── shared/                  # Shared across all apps
│   │   ├── src/
│   │   │   ├── types/           # TypeScript types for all entities
│   │   │   │   ├── organization.ts
│   │   │   │   ├── location.ts
│   │   │   │   ├── user.ts
│   │   │   │   ├── kitchen.ts
│   │   │   │   ├── staff.ts
│   │   │   │   ├── order.ts
│   │   │   │   ├── delivery.ts
│   │   │   │   └── index.ts
│   │   │   ├── constants/       # Roles, statuses, enums
│   │   │   │   ├── roles.ts
│   │   │   │   ├── order-status.ts
│   │   │   │   └── index.ts
│   │   │   ├── validation/      # Zod schemas (shared client + server)
│   │   │   │   ├── menu-item.ts
│   │   │   │   ├── staff-member.ts
│   │   │   │   ├── order.ts
│   │   │   │   └── index.ts
│   │   │   └── utils/           # Formatters, helpers
│   │   │       ├── currency.ts  # USD formatting
│   │   │       ├── timezone.ts  # US timezone helpers
│   │   │       ├── permissions.ts # Role-based permission checks
│   │   │       └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── api-client/              # Typed API client (used by web + mobile)
│   │   ├── src/
│   │   │   ├── client.ts        # Base fetch wrapper with auth
│   │   │   ├── kitchen.ts       # Kitchen endpoints
│   │   │   ├── staff.ts
│   │   │   ├── orders.ts
│   │   │   ├── deliveries.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── powersync-schema/        # PowerSync sync rules + local schema
│   │   ├── src/
│   │   │   ├── schema.ts        # Local SQLite table definitions
│   │   │   └── sync-rules.yaml  # What syncs to which clients
│   │   └── package.json
│   │
│   └── ui/                      # Shared UI components (optional)
│       ├── src/
│       │   ├── location-switcher.tsx
│       │   ├── role-guard.tsx
│       │   └── index.ts
│       └── package.json
│
├── services/
│   └── api/                     # NestJS backend
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   │
│       │   ├── common/              # Cross-cutting concerns
│       │   │   ├── guards/
│       │   │   │   ├── auth.guard.ts        # JWT validation
│       │   │   │   ├── tenant.guard.ts      # Set RLS context
│       │   │   │   └── roles.guard.ts       # Permission check
│       │   │   ├── decorators/
│       │   │   │   ├── current-user.ts      # @CurrentUser()
│       │   │   │   ├── current-tenant.ts    # @CurrentTenant()
│       │   │   │   └── roles.ts             # @Roles('owner','manager')
│       │   │   ├── interceptors/
│       │   │   │   └── tenant-context.interceptor.ts
│       │   │   ├── middleware/
│       │   │   │   └── tenant.middleware.ts  # SET app.tenant_id
│       │   │   └── filters/
│       │   │       └── http-exception.filter.ts
│       │   │
│       │   ├── modules/
│       │   │   ├── auth/                # Supabase auth integration
│       │   │   │   ├── auth.module.ts
│       │   │   │   ├── auth.controller.ts
│       │   │   │   ├── auth.service.ts
│       │   │   │   └── strategies/
│       │   │   │       └── supabase.strategy.ts
│       │   │   │
│       │   │   ├── organization/        # Org + location CRUD
│       │   │   │   ├── organization.module.ts
│       │   │   │   ├── organization.controller.ts
│       │   │   │   ├── organization.service.ts
│       │   │   │   ├── location.controller.ts
│       │   │   │   ├── location.service.ts
│       │   │   │   └── dto/
│       │   │   │       ├── create-org.dto.ts
│       │   │   │       └── create-location.dto.ts
│       │   │   │
│       │   │   ├── kitchen/             # Stock, menus, coupons
│       │   │   │   ├── kitchen.module.ts
│       │   │   │   ├── stock.controller.ts
│       │   │   │   ├── stock.service.ts
│       │   │   │   ├── menu.controller.ts
│       │   │   │   ├── menu.service.ts
│       │   │   │   ├── coupon.controller.ts
│       │   │   │   ├── coupon.service.ts
│       │   │   │   └── dto/
│       │   │   │
│       │   │   ├── staff/               # Profiles, scheduling, attendance
│       │   │   │   ├── staff.module.ts
│       │   │   │   ├── staff.controller.ts
│       │   │   │   ├── staff.service.ts
│       │   │   │   ├── schedule.controller.ts
│       │   │   │   ├── schedule.service.ts
│       │   │   │   ├── attendance.controller.ts
│       │   │   │   ├── attendance.service.ts
│       │   │   │   └── dto/
│       │   │   │
│       │   │   ├── orders/              # Order lifecycle
│       │   │   │   ├── orders.module.ts
│       │   │   │   ├── orders.controller.ts
│       │   │   │   ├── orders.service.ts
│       │   │   │   └── dto/
│       │   │   │
│       │   │   ├── finances/            # Payroll, bookkeeping
│       │   │   │   ├── finances.module.ts
│       │   │   │   ├── payroll.controller.ts
│       │   │   │   ├── payroll.service.ts
│       │   │   │   ├── bookkeeping.controller.ts
│       │   │   │   ├── bookkeeping.service.ts
│       │   │   │   └── dto/
│       │   │   │
│       │   │   ├── payments/            # Stripe Connect
│       │   │   │   ├── payments.module.ts
│       │   │   │   ├── payments.controller.ts
│       │   │   │   ├── payments.service.ts
│       │   │   │   ├── stripe-connect.service.ts
│       │   │   │   └── webhooks.controller.ts  # Stripe webhooks
│       │   │   │
│       │   │   ├── deliveries/          # Uber Direct
│       │   │   │   ├── deliveries.module.ts
│       │   │   │   ├── deliveries.controller.ts
│       │   │   │   ├── deliveries.service.ts
│       │   │   │   ├── uber-direct.service.ts
│       │   │   │   └── dto/
│       │   │   │
│       │   │   ├── activations/         # QR menu generation
│       │   │   │   ├── activations.module.ts
│       │   │   │   ├── qr.controller.ts
│       │   │   │   ├── qr.service.ts
│       │   │   │   └── dto/
│       │   │   │
│       │   │   └── admin/               # Super admin endpoints
│       │   │       ├── admin.module.ts
│       │   │       ├── admin.controller.ts
│       │   │       ├── admin.service.ts
│       │   │       └── dto/
│       │   │
│       │   ├── events/                  # Internal event bus
│       │   │   ├── events.module.ts
│       │   │   ├── event-bus.service.ts
│       │   │   └── handlers/
│       │   │       ├── order-created.handler.ts
│       │   │       ├── attendance-logged.handler.ts
│       │   │       └── stock-low.handler.ts
│       │   │
│       │   └── jobs/                    # Background workers
│       │       ├── jobs.module.ts
│       │       ├── processors/
│       │       │   ├── payroll.processor.ts
│       │       │   ├── delivery-status.processor.ts
│       │       │   ├── daily-report.processor.ts
│       │       │   └── license-check.processor.ts
│       │       └── queues.ts
│       │
│       ├── test/
│       ├── nest-cli.json
│       └── package.json
│
├── supabase/                    # Supabase project config
│   ├── migrations/              # SQL migrations
│   │   ├── 001_organizations.sql
│   │   ├── 002_locations.sql
│   │   ├── 003_users_memberships.sql
│   │   ├── 004_licenses.sql
│   │   ├── 005_kitchen.sql
│   │   ├── 006_staff.sql
│   │   ├── 007_orders_payments.sql
│   │   ├── 008_deliveries.sql
│   │   ├── 009_coupons.sql
│   │   └── 010_rls_policies.sql
│   ├── seed.sql
│   └── config.toml
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── .env.example
└── README.md
```

---

## Database Schema (Supabase / PostgreSQL)

### Core tables

```sql
-- 001_organizations.sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_user_id UUID NOT NULL,
  brand_assets JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 002_locations.sql
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  operating_hours JSONB DEFAULT '{}',
  stripe_account_id TEXT,          -- Connected Stripe account
  uber_fleet_api_key_enc TEXT,     -- Encrypted Uber Direct key
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 003_users_memberships.sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TYPE user_role AS ENUM (
  'owner', 'manager', 'kitchen_staff', 'wait_staff', 'delivery_driver'
);

CREATE TABLE org_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE, -- NULL = all locations
  role user_role NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, org_id, location_id, role)
);

-- 004_licenses.sql
CREATE TYPE license_tier AS ENUM ('starter', 'professional', 'enterprise');

CREATE TABLE licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tier license_tier NOT NULL DEFAULT 'starter',
  max_locations INT NOT NULL DEFAULT 1,
  purchased_at TIMESTAMPTZ DEFAULT now(),
  hosting_expires_at TIMESTAMPTZ NOT NULL,
  stripe_payment_id TEXT,
  is_active BOOLEAN DEFAULT true
);
```

### Kitchen module

```sql
-- 005_kitchen.sql
CREATE TABLE stock_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,  -- 'kg', 'lbs', 'units', 'liters'
  cost_per_unit_cents INT,
  reorder_threshold DECIMAL(10,2),
  category TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  allergens TEXT[],
  prep_time_minutes INT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE daily_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  menu_date DATE NOT NULL,
  item_ids UUID[] NOT NULL,         -- References menu_items
  specials JSONB DEFAULT '[]',      -- Daily specials with custom pricing
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  UNIQUE(location_id, menu_date)
);

-- 009_coupons.sql
CREATE TYPE coupon_type AS ENUM ('percentage', 'fixed_amount', 'buy_x_get_y');

CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  type coupon_type NOT NULL,
  value DECIMAL(10,2) NOT NULL,     -- Percentage or cents
  min_order_cents INT DEFAULT 0,
  max_uses INT,
  current_uses INT DEFAULT 0,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(location_id, code)
);
```

### Staff module

```sql
-- 006_staff.sql
CREATE TABLE staff_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  role user_role NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TYPE attendance_type AS ENUM ('clock_in', 'clock_out', 'break_start', 'break_end');

CREATE TABLE attendance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  type attendance_type NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT now(),
  source TEXT DEFAULT 'manual',  -- 'manual', 'qr_scan', 'geofence'
  lat DECIMAL(9,6),
  lng DECIMAL(9,6)
);
```

### Orders & Payments

```sql
-- 007_orders_payments.sql
CREATE TYPE order_source AS ENUM ('qr_menu', 'pos', 'delivery_platform');
CREATE TYPE order_status AS ENUM (
  'pending', 'confirmed', 'preparing', 'ready',
  'out_for_delivery', 'delivered', 'completed', 'cancelled'
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id),
  source order_source NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  items JSONB NOT NULL,               -- Snapshot: [{menu_item_id, name, qty, price_cents}]
  subtotal_cents INT NOT NULL,
  tax_cents INT NOT NULL DEFAULT 0,
  tip_cents INT DEFAULT 0,
  discount_cents INT DEFAULT 0,
  total_cents INT NOT NULL,
  coupon_id UUID REFERENCES coupons(id),
  notes TEXT,
  table_number TEXT,                  -- For dine-in via QR
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  stripe_payment_intent_id TEXT NOT NULL,
  stripe_account_id TEXT NOT NULL,     -- The restaurant's connected account
  status payment_status NOT NULL DEFAULT 'pending',
  amount_cents INT NOT NULL,
  currency TEXT DEFAULT 'usd',
  method TEXT,                         -- 'card', 'apple_pay', 'google_pay'
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 008_deliveries.sql
CREATE TYPE delivery_status AS ENUM (
  'pending', 'driver_assigned', 'picked_up',
  'in_transit', 'delivered', 'cancelled', 'failed'
);

CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  uber_delivery_id TEXT,
  status delivery_status NOT NULL DEFAULT 'pending',
  pickup_address TEXT NOT NULL,
  dropoff_address TEXT NOT NULL,
  driver_name TEXT,
  driver_phone TEXT,
  estimated_delivery_at TIMESTAMPTZ,
  actual_delivery_at TIMESTAMPTZ,
  tracking_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Row-Level Security

```sql
-- 010_rls_policies.sql

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ... (all tables)

-- Helper: Get user's org IDs
CREATE OR REPLACE FUNCTION user_org_ids()
RETURNS SETOF UUID AS $$
  SELECT DISTINCT org_id
  FROM org_memberships
  WHERE user_id = auth.uid() AND is_active = true;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: Get user's location IDs (NULL membership = all locations in org)
CREATE OR REPLACE FUNCTION user_location_ids()
RETURNS SETOF UUID AS $$
  SELECT l.id
  FROM locations l
  JOIN org_memberships m ON m.org_id = l.org_id
  WHERE m.user_id = auth.uid()
    AND m.is_active = true
    AND (m.location_id IS NULL OR m.location_id = l.id);
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Organizations: members can read their orgs
CREATE POLICY "org_member_read" ON organizations
  FOR SELECT USING (id IN (SELECT user_org_ids()));

-- Locations: members can read locations they have access to
CREATE POLICY "location_member_read" ON locations
  FOR SELECT USING (id IN (SELECT user_location_ids()));

-- Orders: scoped to accessible locations
CREATE POLICY "orders_location_read" ON orders
  FOR SELECT USING (location_id IN (SELECT user_location_ids()));

CREATE POLICY "orders_location_insert" ON orders
  FOR INSERT WITH CHECK (location_id IN (SELECT user_location_ids()));

-- Stock: scoped to accessible locations
CREATE POLICY "stock_location_read" ON stock_items
  FOR SELECT USING (location_id IN (SELECT user_location_ids()));

CREATE POLICY "stock_location_write" ON stock_items
  FOR ALL USING (location_id IN (SELECT user_location_ids()));

-- Public QR menu access (no auth required)
CREATE POLICY "menu_public_read" ON menu_items
  FOR SELECT USING (is_available = true);

CREATE POLICY "daily_menu_public_read" ON daily_menus
  FOR SELECT USING (is_published = true);

-- Super admin bypass (service role only, not through RLS)
-- The super admin app uses the Supabase service_role key,
-- which bypasses RLS entirely. Never expose this key to clients.
```

---

## PowerSync Offline Configuration

```yaml
# packages/powersync-schema/src/sync-rules.yaml
#
# Defines what data syncs to each client device.
# PowerSync evaluates these rules per-user based on their JWT claims.

bucket_definitions:
  # Location-scoped operational data
  by_location:
    parameters:
      - SELECT id AS location_id FROM locations
        WHERE id IN (SELECT user_location_ids())
    data:
      - SELECT * FROM stock_items WHERE location_id = bucket.location_id
      - SELECT * FROM menu_items WHERE location_id = bucket.location_id
      - SELECT * FROM orders WHERE location_id = bucket.location_id
        AND created_at > NOW() - INTERVAL '24 hours'
      - SELECT * FROM attendance_logs WHERE location_id = bucket.location_id
        AND logged_at > NOW() - INTERVAL '48 hours'
      - SELECT * FROM staff_schedules WHERE location_id = bucket.location_id
        AND shift_date >= CURRENT_DATE - 1
      - SELECT * FROM daily_menus WHERE location_id = bucket.location_id
        AND menu_date >= CURRENT_DATE
      - SELECT * FROM coupons WHERE location_id = bucket.location_id
        AND is_active = true

  # Delivery data (for mobile driver app)
  by_delivery_driver:
    parameters:
      - SELECT id AS location_id FROM locations
        WHERE id IN (SELECT user_location_ids())
    data:
      - SELECT d.* FROM deliveries d
        JOIN orders o ON d.order_id = o.id
        WHERE o.location_id = bucket.location_id
        AND d.status NOT IN ('delivered', 'cancelled')

  # Org-level data (settings, location list)
  by_org:
    parameters:
      - SELECT id AS org_id FROM organizations
        WHERE id IN (SELECT user_org_ids())
    data:
      - SELECT * FROM locations WHERE org_id = bucket.org_id
      - SELECT * FROM org_memberships WHERE org_id = bucket.org_id
```

---

## Key Flows

### 1. QR Menu → Payment

```
Customer scans QR code at table
  → Opens /menu/[location-slug]?table=5
  → Public Next.js page (no auth needed)
  → Fetches published daily menu via Supabase (public read policy)
  → Customer selects items, enters name/phone
  → Client creates Stripe PaymentIntent via API:
      POST /api/orders
      Body: { items, customer_name, table_number, coupon_code? }
      → API validates items against current menu
      → API calculates total (with coupon discount if valid)
      → API creates PaymentIntent on restaurant's connected Stripe account:
          stripe.paymentIntents.create({
            amount: total_cents,
            currency: 'usd',
            application_fee_amount: 0, // or your platform fee
          }, {
            stripeAccount: location.stripe_account_id
          })
      → Returns client_secret to frontend
  → Customer completes payment via Stripe Elements
  → Stripe webhook confirms payment
  → Order status → 'confirmed'
  → Supabase Realtime pushes to KDS (kitchen display)
  → Kitchen staff updates status → 'preparing' → 'ready'
```

### 2. Offline Order (POS station)

```
POS station (PWA) is offline
  → Staff takes order on POS screen
  → Order written to local SQLite via PowerSync
      { status: 'pending', source: 'pos', items: [...] }
  → Stock quantities decremented locally (additive sync)
  → Receipt printed locally (if printer connected)
  → Connection restores
  → PowerSync syncs order to Supabase
  → If payment needed, staff processes card via connected Stripe terminal
  → Events fire: stock-low alerts, kitchen display updates
```

### 3. Uber Direct Delivery

```
Order marked 'ready' in kitchen
  → Staff clicks "Dispatch delivery"
  → API calls Uber Direct:
      POST https://api.uber.com/v1/deliveries
      {
        pickup: { address: location.address },
        dropoff: { address: customer.address },
        items: [{ name, quantity, price }]
      }
      Headers: { Authorization: Bearer <location.uber_api_key> }
  → Delivery record created with uber_delivery_id
  → BullMQ job polls Uber status every 30s
  → Status updates pushed to mobile app via Supabase Realtime
  → Customer gets SMS updates via Resend/Twilio
```

### 4. Attendance + Payroll

```
Staff member arrives at location
  → Opens mobile app → taps "Clock In"
  → Attendance log written (with GPS coordinates if permitted)
  → Syncs via PowerSync
  → At end of pay period:
      → BullMQ cron job runs payroll processor
      → Queries attendance_logs for the period per location
      → Calculates hours: regular, overtime (>40hr/week)
      → Applies hourly rates from staff profile
      → Generates payroll summary (not actual payment — owner handles that)
      → Summary available in Finances module
```

---

## Conflict Resolution (Offline Sync)

| Data type | Strategy | Reasoning |
|---|---|---|
| Menu items | Last write wins | Low conflict risk, owner typically edits |
| Orders | Client wins | Orders must never be lost |
| Stock quantities | Additive merge | -2 + -3 = -5 total decrement |
| Attendance | Client wins + dedup | Clock-in timestamp is authoritative |
| Schedules | Last write wins | Manager is single editor |
| Daily menus | Last write wins | Published once per day |

Stock quantities need special handling in PowerSync. Instead of syncing absolute values, sync **stock_movements** (a ledger):

```sql
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_item_id UUID NOT NULL REFERENCES stock_items(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  quantity_change DECIMAL(10,2) NOT NULL,  -- Negative = consumed, Positive = restocked
  reason TEXT,  -- 'order_123', 'restock', 'waste', 'correction'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Current stock = initial + SUM(movements)
-- This is append-only, so offline devices just add movements
-- No conflicts possible — every movement is a unique event
```

---

## Environment Variables

```env
# .env.example

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...      # Server-side only, never expose

# PowerSync
NEXT_PUBLIC_POWERSYNC_URL=https://your-instance.powersync.com
POWERSYNC_PRIVATE_KEY=...

# Stripe (platform keys — for creating Connect accounts)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Uber Direct
# Note: Each location stores their own Uber API key.
# These are platform-level credentials for the Uber developer app.
UBER_CLIENT_ID=...
UBER_CLIENT_SECRET=...

# Redis
REDIS_URL=redis://localhost:6379

# App
API_URL=https://api.restaurantos.com
SUPER_ADMIN_EMAILS=you@yourcompany.com

# Resend (email)
RESEND_API_KEY=re_...
```

---

## Build Order (Phase 1 MVP)

Week 1-2: Foundation
  - [ ] Monorepo setup (Turborepo + pnpm)
  - [ ] Supabase project + migrations (orgs, locations, users, memberships)
  - [ ] NestJS API skeleton with auth + tenant middleware
  - [ ] Next.js web app with auth flow (Supabase Auth)
  - [ ] Location switcher component

Week 3-4: Kitchen module
  - [ ] Menu items CRUD
  - [ ] Daily menu builder
  - [ ] Stock items CRUD + movement ledger
  - [ ] Kitchen display system (KDS) — fullscreen station view
  - [ ] PowerSync integration (menu + stock offline)

Week 5-6: Orders + QR menu
  - [ ] Public QR menu page (/menu/[slug])
  - [ ] Stripe Connect onboarding flow
  - [ ] Order creation + payment via Stripe Elements
  - [ ] Order lifecycle (pending → confirmed → preparing → ready → completed)
  - [ ] Webhook handler for payment confirmation
  - [ ] Realtime order updates to KDS

Week 7-8: Staff module
  - [ ] Staff profiles + org membership management
  - [ ] Schedule builder (weekly view)
  - [ ] Attendance clock-in/out
  - [ ] Mobile app shell (Expo) with attendance + dashboard

Week 9-10: Polish + super admin
  - [ ] Super admin dashboard (org CRUD, license tracking, health monitoring)
  - [ ] PWA setup (service worker, offline indicators)
  - [ ] Error tracking (Sentry)
  - [ ] Basic email notifications (Resend)
  - [ ] QR code generation for tables

Phase 2 (after launch): Deliveries (Uber Direct), Payroll, Coupons, Consolidated reporting
