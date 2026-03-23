# HeadlessResto — Testers Guide

> **Branch:** `hardening` · **Staging URL:** see Vercel project dashboard
> **Last updated:** 2026-03-23

---

## 1. Overview

HeadlessResto is a multi-tenant restaurant management platform. Each test scenario below is self-contained — you do not need to run them in order. Cover every section before signing off.

---

## 2. Test Environment Setup

### Prerequisites
- Modern browser (Chrome 120+, Firefox 122+, Safari 17+)
- Access to the Vercel preview URL for the `hardening` branch
- A test email address you can receive mail on (for auth flows)

### What you do NOT need
- Local installation
- Supabase access
- Any API keys

---

## 3. Test Accounts

Request these credentials from the dev team before starting. Each account is pre-seeded in the staging database.

| Role | Email | What it unlocks |
|------|-------|-----------------|
| `super_admin` | `superadmin@test.headlessresto.com` | Platform-wide view, all restaurants, feature toggles |
| `owner` | `owner@test.headlessresto.com` | Full restaurant admin dashboard |
| `manager` | `manager@test.headlessresto.com` | Same as owner minus staff deletion |
| `cashier` | `cashier@test.headlessresto.com` | POS, orders, reservations only |
| `kitchen` | `kitchen@test.headlessresto.com` | Kitchen Display only |
| `waiter` | `waiter@test.headlessresto.com` | Staff dashboard only |

> If an account is missing or locked out, the `owner` account can add new members via **Dashboard → Staff**.

---

## 4. Public / Marketing Pages

These pages require no login.

### 4.1 Home (`/`)
- [ ] Page loads with hero section and navigation
- [ ] "Get Started" CTA opens `/get-started` form (not signup)
- [ ] "Book a Demo" CTA opens `/book-demo` form
- [ ] Footer links to `/about`, `/blog`, `/privacy`, `/terms` all resolve with readable text

### 4.2 About (`/about`)
- [ ] Text is legible (not white-on-white)
- [ ] Navigation bar present

### 4.3 Blog (`/blog`)
- [ ] Loads without error

### 4.4 Privacy & Terms (`/privacy`, `/terms`)
- [ ] Text is legible
- [ ] No broken layout

### 4.5 Demo (`/demo`)
- [ ] Delivery demo flow is visible and walkable for investors

---

## 5. Lead Capture Forms

All three forms save to the `leads` table — no account is created.

### 5.1 Get Started (`/get-started`)
- [ ] Form renders with name, email, company, phone fields
- [ ] Submit with valid data → success message appears
- [ ] Submit with invalid email → inline error shown, no submission
- [ ] Submit the same email 6 times in quick succession → **rate limit** error on the 6th attempt (429-style message)

### 5.2 Book Demo (`/book-demo`)
- [ ] Form renders
- [ ] Valid submission → confirmation shown
- [ ] Rate limit triggers after repeated rapid submissions

### 5.3 Contact (`/contact`)
- [ ] Form renders
- [ ] Valid submission → confirmation shown
- [ ] Rate limit triggers after repeated rapid submissions

---

## 6. Authentication

### 6.1 Login (`/login`)
- [ ] Login with valid `owner` credentials → redirect to `/dashboard`
- [ ] Login with wrong password → error message shown inline (not a page crash)
- [ ] Login with unknown email → error message shown
- [ ] After logout, navigating to `/dashboard` redirects to `/login`

### 6.2 Forgot Password (`/auth/forgot-password`)
- [ ] Page loads
- [ ] Submitting a valid email shows a success/sent message

### 6.3 Route Protection
- [ ] Visit `/dashboard` while logged out → redirected to `/login`
- [ ] Visit `/dashboard/analytics` while logged out → redirected to `/login`
- [ ] Log in as `kitchen` → cannot see Analytics, Inventory, Staff in sidebar
- [ ] Log in as `cashier` → cannot see Analytics, Inventory, Staff in sidebar

---

## 7. Dashboard — All Roles

After login, verify the correct dashboard loads for each role.

| Role | Expected Home Screen |
|------|---------------------|
| `super_admin` | Platform stats + restaurant list |
| `owner` / `manager` | Today's revenue, orders, tables, avg ticket |
| `cashier` | Staff dashboard — orders handled, service time |
| `kitchen` | Kitchen dashboard — active tickets, avg prep time |
| `waiter` | Staff dashboard — orders handled, tips |

- [ ] Sidebar only shows nav items the role is permitted to access (see matrix in `roles-and-capabilities.md`)
- [ ] Settings link visible for every role

---

## 8. POS Terminal (`/dashboard/pos`)

> Login as `owner` or `cashier`.

- [ ] Menu items load on left panel
- [ ] Clicking an item adds it to the right-side order
- [ ] Quantity can be increased/decreased
- [ ] Item can be removed from order
- [ ] "Place Order" creates a new order (visible in Orders page)
- [ ] "Checkout" completes an order and clears the cart
- [ ] Total price updates correctly as items are added/removed

---

## 9. Kitchen Display System (`/dashboard/kds`)

> Login as `owner` or `manager`. Have the `cashier` place an order in POS first, or place one yourself.

- [ ] KDS loads and shows ticket cards
- [ ] Each ticket shows table number (or order ID), items, and time elapsed
- [ ] Clicking "Mark Ready" changes ticket status
- [ ] Completed tickets are removed from the active queue (or visually distinct)
- [ ] Real-time: place a new POS order in another tab → ticket appears in KDS without page refresh

---

## 10. Orders (`/dashboard/orders`)

> Login as `owner`, `manager`, or `cashier`.

- [ ] Orders list loads
- [ ] Each order shows status badge: `pending`, `preparing`, `ready`, `completed`, `cancelled`
- [ ] Changing status via dropdown → status updates in the list
- [ ] **Real-time**: place a new POS order in another tab → new row appears without page refresh
- [ ] "Service call" / bell notification can be dismissed

---

## 11. Reservations (`/dashboard/reservations`)

> Login as `owner`, `manager`, or `cashier`.

- [ ] Reservations list loads
- [ ] Create a new reservation (name, date, time, party size, table)
- [ ] New reservation appears in the list
- [ ] Edit or cancel an existing reservation
- [ ] Past reservations are distinguishable from upcoming ones

---

## 12. Analytics (`/dashboard/analytics`)

> Login as `owner` or `manager` (cashier should NOT see this page).

- [ ] Page loads with KPI cards: Total Revenue, Total Orders, Completed, Avg Ticket
- [ ] Each KPI shows a trend badge (↑/↓ vs last 30-day period)
- [ ] Weekly revenue bar chart renders for the last 7 days
- [ ] Hovering a bar shows the revenue tooltip
- [ ] Order Status breakdown panel shows coloured progress bars per status
- [ ] Empty state ("No orders yet") shows correctly if no orders exist

---

## 13. Inventory (`/dashboard/inventory`)

> Login as `owner` or `manager`.

- [ ] Inventory list loads with item name, category, quantity, unit
- [ ] Low-stock items are visually highlighted (red/amber)
- [ ] Add a new inventory item → appears in the list
- [ ] Update quantity → list reflects the change
- [ ] Delete an item → removed from list

---

## 14. Staff Management (`/dashboard/staff`)

> Login as `owner` or `manager`.

- [ ] Staff list loads with name, email, role badge
- [ ] Invite a new staff member (name, email, role)
- [ ] Invited member appears in the list
- [ ] Change a staff member's role via dropdown → role updates
- [ ] Remove a staff member → row is removed
- [ ] Success/failure toasts appear for each action (no bare `alert()` dialogs)

---

## 15. Tables (`/dashboard/tables`)

> Login as `owner` or `manager`.

- [ ] Table grid loads
- [ ] Table status colours: available (green), occupied (red/orange), reserved (amber)
- [ ] Clicking a table updates its status
- [ ] Table count matches what the POS terminal shows

---

## 16. Settings (`/dashboard/settings`)

> Login as any role.

### Profile
- [ ] Current name and email are pre-populated
- [ ] Update name → success toast appears, name persists on page refresh
- [ ] Update email → success toast appears

### Restaurant
> Login as `owner` or `manager` for this sub-section.

- [ ] Restaurant name, currency, timezone, tax rate fields are editable
- [ ] Save → success toast, values persist on refresh

### Notifications
- [ ] Toggle switches render for each notification type
- [ ] Save → success toast

---

## 17. Super Admin Panel

> Login as `super_admin`.

### `/dashboard` (platform overview)
- [ ] Shows total restaurants, orders, revenue, users across all orgs
- [ ] Restaurant list shows all registered orgs

### `/dashboard/restaurants`
- [ ] Each restaurant card shows feature flag toggles (POS, KDS, Orders, Reservations, Inventory, Analytics, Staff)
- [ ] Toggle a feature OFF → when logged in as an `owner` for that org, the corresponding nav item disappears
- [ ] Toggle it back ON → nav item returns

### `/dashboard/stats`
- [ ] System-wide statistics load

---

## 18. Delivery Demo (`/demo`)

> This flow is specifically for investor walkthroughs.

- [ ] Demo page loads with a delivery scenario walkthrough
- [ ] Order placement step is visible
- [ ] Uber Direct dispatch step is shown
- [ ] Real-time status updates cycle through: `dispatched` → `picked_up` → `delivered`
- [ ] ETA and courier details display correctly during the flow

---

## 19. Error & Edge Cases

- [ ] Navigate to a non-existent route (e.g. `/dashboard/doesnotexist`) → 404 page (not a crash)
- [ ] Remove internet connection mid-session → graceful error, no infinite spinner
- [ ] Submit a form with all fields blank → validation messages appear per field, form does not submit

---

## 20. Responsive / Mobile

- [ ] Login page usable on 375px viewport (iPhone SE)
- [ ] Dashboard sidebar collapses on mobile
- [ ] POS terminal usable on tablet (768px)
- [ ] Analytics charts do not overflow on small screens

---

## 21. Bug Reporting

Use the following format when filing issues:

```
Title: [Area] Short description of the bug

**Steps to reproduce:**
1. Log in as <role>
2. Navigate to <page>
3. Do <action>

**Expected:** What should happen
**Actual:** What actually happened
**Environment:** Browser + version, viewport size
**Screenshot / recording:** Attach if possible
```

**Severity levels:**

| Level | Examples |
|-------|---------|
| 🔴 Critical | Cannot log in, data loss, security bypass |
| 🟠 High | Feature completely broken, wrong role can access page |
| 🟡 Medium | Feature partially broken, incorrect data shown |
| 🟢 Low | Visual glitch, text typo, minor UX issue |

---

## 22. Out of Scope (for this test cycle)

- Email delivery (forgot-password emails may not arrive in staging)
- Uber Direct live courier dispatch (demo flow uses a simulated driver)
- Payment processing (no real payment gateway connected)
- PWA / service worker offline functionality

---

*For role details see `docs/roles-and-capabilities.md`.*
