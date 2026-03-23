# Roles & Capabilities Reference

## Role Type Definition

**`/packages/types/index.ts`**
```typescript
export type UserRole =
  | 'super_admin'
  | 'restaurant_admin'
  | 'admin'
  | 'owner'
  | 'manager'
  | 'kitchen'
  | 'waiter'
  | 'cashier'
  | 'user'           // fallback
```

---

## Role → Dashboard Mapping

| Role | Dashboard Component | File |
|------|--------------------|----|
| `super_admin` | `SuperAdminDashboard` | `components/dashboards/SuperAdminDashboard.tsx` |
| `restaurant_admin` | `RestaurantAdminDashboard` | `components/dashboards/RestaurantAdminDashboard.tsx` |
| `admin` | `RestaurantAdminDashboard` | ^ |
| `owner` | `RestaurantAdminDashboard` | ^ |
| `manager` | `RestaurantAdminDashboard` | ^ |
| `kitchen` | `KitchenDashboard` | `components/dashboards/KitchenDashboard.tsx` |
| `waiter` | `StaffDashboard` | `components/dashboards/StaffDashboard.tsx` |
| `cashier` | `StaffDashboard` | ^ |
| `user` (default) | `RestaurantAdminDashboard` | ^ |

---

## Dashboard Widget Content Per Role

### `super_admin` → SuperAdminDashboard
- Platform-wide stats: total restaurants, total orders, total revenue, total users
- Restaurant list with feature enable/disable toggles
- Can toggle 7 feature flags per restaurant

### `restaurant_admin` / `admin` / `owner` / `manager` → RestaurantAdminDashboard
- Today's revenue, total orders, active tables, avg ticket
- Popular items list
- Revenue chart (7-day)
- Upcoming reservations
- Calendar widget

### `kitchen` → KitchenDashboard
- Active tickets in queue
- Avg prep time
- Items completed
- Efficiency metric
- Preparation breakdown by category

### `waiter` / `cashier` → StaffDashboard
- Orders handled
- Avg service time
- Tips earned
- Service rating
- Recent activity feed

---

## Navigation Access Matrix

Sidebar nav items are filtered by **role** AND **feature flags** (set per-org by super admin).

| Nav Item | Route | Visible To | Feature Flag |
|----------|-------|-----------|--------------|
| Dashboard | `/dashboard` | All roles | — |
| POS Terminal | `/dashboard/pos` | `restaurant_admin`, `admin`, `owner`, `manager`, `cashier` | `pos` |
| Kitchen Display | `/dashboard/kds` | `restaurant_admin`, `admin`, `owner`, `manager`, `cashier` | `kds` |
| Orders | `/dashboard/orders` | `restaurant_admin`, `admin`, `owner`, `manager`, `cashier` | `orders` |
| Reservations | `/dashboard/reservations` | `restaurant_admin`, `admin`, `owner`, `manager`, `cashier` | `reservations` |
| Analytics | `/dashboard/analytics` | `restaurant_admin`, `admin`, `owner`, `manager` | `analytics` |
| Inventory | `/dashboard/inventory` | `restaurant_admin`, `admin`, `owner`, `manager` | `inventory` |
| Staff | `/dashboard/staff` | `restaurant_admin`, `admin`, `owner`, `manager` | `staff` |
| **Restaurants** | `/dashboard/restaurants` | `super_admin` only | — |
| **System Stats** | `/dashboard/stats` | `super_admin` only | — |
| Settings | `/dashboard/settings` | All roles | — |

> **Feature flags** default to `true` if not explicitly set to `false` in `organization.brand_assets.features`.

---

## Feature Flags (Super Admin Controls)

7 features can be toggled ON/OFF per restaurant from the super admin panel (`/dashboard/restaurants`).

| Key | Feature | Default |
|-----|---------|---------|
| `pos` | POS Terminal | ON |
| `kds` | Kitchen Display | ON |
| `orders` | Order Management | ON |
| `reservations` | Reservations | ON |
| `inventory` | Inventory Tracking | ON |
| `analytics` | Analytics Reports | ON |
| `staff` | Staff Management | ON |

**Storage:** `organizations.brand_assets.features` (JSONB)
**Logic:** `feat(key) !== false` — unset = enabled

---

## Staff Role Assignment

Roles available when managing team members via `/dashboard/staff`:

```
waiter | chef | cashier | manager | admin
```

Stored in `org_memberships.role`. Updated via `updateStaffRoleAction(membershipId, role)`.

---

## Role Resolution Flow

```
1. supabase.auth.getUser()             → auth user
2. adminSupabase.from('users')         → profile row
3. adminSupabase.from('org_memberships') → org + role
4. role = membershipData?.role || 'user'
5. Fallback for no profile row: role = 'restaurant_admin'
6. New signup: initial membership role = 'admin'
```

**Profile object passed to layout:**
```typescript
{
  id, full_name, email,
  role,                          // from org_memberships.role
  organization: {
    name,
    brand_assets: { features: Record<string, boolean> }
  }
}
```

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `auth.users` | Supabase built-in auth |
| `public.users` | User profile (full_name, email) |
| `public.organizations` | Restaurant/org record (name, slug, brand_assets) |
| `public.org_memberships` | Maps user → org with a role |

---

## Quick Reference: Role Capabilities

| Capability | `super_admin` | `owner`/`restaurant_admin`/`admin` | `manager` | `cashier` | `kitchen` | `waiter` |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| Platform stats & restaurant list | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Toggle org features | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Restaurant admin dashboard | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| POS Terminal | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Kitchen Display | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Orders | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Reservations | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Analytics | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Inventory | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Staff management | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Kitchen dashboard | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Staff dashboard | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |

---

*Source files: `packages/types/index.ts` · `apps/web/components/dashboards/DashboardLayout.tsx` · `apps/web/app/(dashboard)/dashboard/page.tsx` · `apps/web/app/(dashboard)/layout.tsx` · `apps/web/app/auth/actions/index.ts`*
