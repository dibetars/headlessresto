# HeadlessResto — The Operating System for Serious Restaurants

HeadlessResto is a high-performance, unified restaurant management platform designed to eliminate friction for guests and maximize operational efficiency for owners. Built with a modern tech stack (Next.js 14, Supabase, Stripe), it provides a seamless end-to-end flow from QR ordering to kitchen fulfillment and financial reporting.

## 🚀 Investor Quick Start: Why HeadlessResto?

### The Problem
Traditional restaurant software is fragmented, expensive, and slow. Legacy POS systems charge high per-order fees and lack real-time integration between the guest's phone and the kitchen.

### Our Solution: The Unified Ecosystem
1.  **Zero-Friction Ordering**: Guests scan, order, and pay via web-app. No downloads. Average order time: < 30 seconds.
2.  **KDS Intelligence**: Real-time kitchen display system with automated routing and late-order alerts.
3.  **Owner Dashboard**: 360° visibility into revenue, labor costs, and table turnover.
4.  **No Per-Order Fees**: A fixed-cost model that scales with the restaurant, not against it.

### Market Opportunity
As labor costs rise, automation becomes a necessity. HeadlessResto reduces front-of-house labor requirements by up to 30% through guest-led ordering.

---

## 🛠 Tech Stack
- **Framework**: Next.js 14 (App Router, Server Actions)
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime Channels
- **Payments**: Stripe (Checkout, Webhooks)
- **Styling**: Tailwind CSS + Framer Motion
- **Security**: Supabase Auth + Middleware Protection

---

## 📂 Core Modules

### 📱 QR Menu & Ordering
- Table-specific QR codes.
- Real-time cart management.
- Integrated Stripe payments.
- [PublicMenu.tsx](src/app/menu/[tableId]/components/PublicMenu.tsx)

### 👨‍🍳 Kitchen Display System (KDS)
- Real-time order sync.
- Status tracking (Pending, Preparing, Ready).
- Elapsed time monitoring.
- [KDSGrid.tsx](src/app/(dashboard)/kds/components/KDSGrid.tsx)

### 📊 Management Dashboard
- Revenue analytics.
- Table management.
- Menu & Inventory control.
- [Dashboard](src/app/(dashboard)/dashboard/page.tsx)

---

## 🚦 Getting Started

1.  **Clone the repo**: `git clone ...`
2.  **Install dependencies**: `npm install`
3.  **Environment Setup**: Copy `.env.example` to `.env.local` and fill in your Supabase and Stripe keys.
4.  **Run Development**: `npm run dev`

---

## 💎 Production Readiness
- ✅ **Auth Protection**: All management routes secured via middleware.
- ✅ **Payment Webhooks**: Secure order/table reconciliation via admin-client webhooks.
- ✅ **Loading States**: Skeletal UI for high-performance feel.
- ✅ **Real-time**: Instant sync across guest, kitchen, and owner devices.

---

© 2026 HeadlessResto. Built for the future of hospitality.
