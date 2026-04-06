# Demo Tester Notes — HeadlessResto

## Prerequisites

- Node.js + pnpm installed
- Clone the repo and checkout `feature/mvp`
- From the repo root run:
  ```bash
  pnpm install
  pnpm --filter web dev
  ```
- Open `http://localhost:3000`

---

## 1. Customer Menu Demo — `/theme-demo`

**URL:** `http://localhost:3000/theme-demo`

| Action | Expected |
|--------|----------|
| Click 🔥 Bold / 🌿 Minimal / 🌄 Warm buttons | Template switches instantly, hero and footer update to match |
| Tap `+` on a menu item | Item added to cart, badge count appears on Cart button |
| Click Cart → Checkout | Slides to pre-filled checkout form (no typing needed) |
| Click "Place Demo Order" | 1.6s placing animation → moves to tracking screen |
| Tracking screen | Timeline waits at "Order Received" until restaurant acts |
| "Try another theme" button | Resets back to browse with empty cart |
| **Warm template only** | Type in the hero search bar — items filter live by name and description. `×` clears the search |

---

## 2. Restaurant Dashboard Demo — `/demo-dashboard`

**URL:** `http://localhost:3000/demo-dashboard`

### Orders / KDS tab

| Action | Expected |
|--------|----------|
| On load | 3 pre-seeded orders: Alex Chen (Preparing), Table 4 (Pending), Maria Santos (Ready) |
| Click "Accept Order" on a Pending ticket | Status changes to Preparing |
| Click "Mark Ready" | Status changes to Ready |
| Click "Mark Delivered" | Status changes to Delivered ✅ |

### Menu tab

| Action | Expected |
|--------|----------|
| Click category pills | Filters the item list |
| Toggle a switch off | Item shows as 86'd |
| Toggle back on | Item returns to Available |

### POS tab

| Action | Expected |
|--------|----------|
| Click any menu items | Items added to cart on the right |
| Click a table preset (e.g. Table 3) | Customer name fills automatically |
| Click "Place Order →" | New order appears in the KDS tab |

---

## 3. Live Sync — Open Both Tabs

This is the key end-to-end flow. Open both pages side by side in the **same browser window**:

1. Open `http://localhost:3000/demo-dashboard` in **Tab 1**
2. Open `http://localhost:3000/theme-demo` in **Tab 2**
3. Dashboard top bar should show **● Live Sync** in green
4. In **Tab 2** (customer): add items → Checkout → Place Demo Order
5. In **Tab 1** (dashboard): new order ticket appears instantly with a pulsing border
6. In **Tab 1**: click Accept → Preparing → Mark Ready
7. Switch to **Tab 2**: tracking timeline advances to match the restaurant's status

> **Note:** Both tabs must be open in the same browser. Incognito + normal window will not sync.

---

## 4. Mobile View

Resize the browser to 375px width, or use DevTools device emulation (iPhone SE or similar).

| What to check |
|---------------|
| Demo chrome shows only DEMO badge + emoji template switcher (text labels hidden) |
| All 3 templates: header shows restaurant name and cart only — no nav links |
| Menu cards stack to full width |
| Checkout form stacks vertically |
| Dashboard tabs scroll horizontally, order cards stack |

---

## Known Demo Limitations

- No real orders are placed — the Visa 4242 card is a placeholder, nothing is charged
- Live sync only works within the same browser (BroadcastChannel is same-origin, same-browser)
- The tracking timeline only advances when the restaurant updates status in the dashboard — it does not auto-progress on a timer
