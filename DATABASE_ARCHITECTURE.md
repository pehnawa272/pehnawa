# Pehnawa — Database Architecture

## Stack
| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma 7 |
| Auth | Clerk |
| Payments | Razorpay |
| Media | Cloudinary |

---

## ERD — Entity Relationship Overview

```
User ──────┬──── Address          (1:many)
           ├──── MeasurementProfile (1:many)
           ├──── Cart              (1:1)
           ├──── Wishlist          (1:1)
           ├──── Order             (1:many)
           ├──── Wallet            (1:1)
           ├──── ReferralCode      (1:1)
           ├──── ReferralRecord    (as referrer, 1:many)
           ├──── ReferralRecord    (as referred,  1:many)
           └──── ConsultationRequest (1:many)

Product ───┬──── ProductImage      (1:many)
           ├──── ProductVideo      (1:many)
           ├──── ProductOccasion   (many:many → Occasion)
           ├──── ProductAccessory  (self many:many)
           ├──── CartItem          (1:many)
           ├──── OrderItem         (1:many)
           └──── WishlistItem      (1:many)

Order ─────┬──── OrderItem         (1:many)
           └──── Payment           (1:1)

Wallet ────└──── WalletTransaction  (1:many)

ReferralCode ─── ReferralRecord    (1:many)
```

---

## Model Reference

### User
Synced from Clerk via webhook. `clerkId` is the foreign key linking our DB to Clerk's auth.
Soft-deleted via `deletedAt`. Role can be `CUSTOMER`, `ADMIN`, or `STYLIST`.

### Product
Central catalog model. All prices stored in **paise** (integer) to avoid floating point issues.
`isEnquireOnly: true` is used for bridal items with no fixed price.
Lifecycle: `DRAFT → PUBLISHED → ARCHIVED → DELETED` (soft delete via `deletedAt`).

### ProductImage / ProductVideo
Cloudinary assets. Store both `url` (secure_url) and `cloudinaryId` (public_id).
The `cloudinaryId` is needed to delete/transform assets via Cloudinary API.

### Cart / CartItem
Persistent server-side cart, one per user. `customTailoring` is a JSON column storing
neckline, sleeve, and custom measurement overrides per item.

### Order
Full snapshot model — `OrderItem` copies `productTitle`, `productSlug`, `unitPrice` at
time of purchase so historical orders are accurate even if products change later.
Order lifecycle timestamps (`acceptedAt`, `shippedAt`, etc.) are set individually as
the order progresses through each stage.

### Payment
One payment per order. Razorpay IDs stored for reconciliation.
`walletAmount + razorpayAmount = amount` always.
Refunds tracked with `refundId`, `refundAmount`, `refundedAt`.

### Wallet / WalletTransaction
`balance` on Wallet is the running total in paise. Every credit/debit creates a
`WalletTransaction` row with a `balance` snapshot — this gives a full audit trail
and makes it easy to detect inconsistencies.

### ReferralCode / ReferralRecord
Each user auto-gets one `ReferralCode` on signup (via Clerk webhook).
When a new user signs up with a code, `ReferralRecord` is created.
The referred user gets their signup bonus immediately.
The referrer gets their bonus when the referred user's **first order** is completed
(implement this check in the order delivery webhook/handler).

### MeasurementProfile
Supports multiple saved profiles per user (e.g. "My Measurements", "Bridal 2025").
`isDefault` flag for pre-selecting at checkout. Linked to `OrderItem` to preserve
which measurements were used for each garment.

### ConsultationRequest
Works for both guest and authenticated users. `userId` is nullable.
Admin advances status: `NEW → CONTACTED → SCHEDULED → CONVERTED → CLOSED`.
`convertedOrderId` links to the Order if the consultation resulted in a sale.

---

## Key Design Decisions

### All money in paise (integer)
Never store ₹ floats. `price: 42000` means ₹420.00. Divide by 100 for display.
This matches Razorpay's API which also works in paise.

### Soft deletes
`User`, `Product`, `Address`, `MeasurementProfile`, and `Order` all have `deletedAt`.
Filtered out in public queries with `where: { deletedAt: null }`.
Admin can query all including deleted by omitting that filter.

### JSON columns
`CartItem.customTailoring` and `OrderItem.customTailoring` store bespoke tailoring
directives as JSON. No separate table needed — the shape is flexible and never queried
individually. TypeScript `CustomTailoring` interface in `src/types/index.ts` provides type safety.

### Product self-join for accessories
`ProductAccessory` is a self-referential many-to-many on `Product`. The Noorani Anarkali
can list Polki Earrings, Velvet Potli, etc. as accessories without duplicating data.

### Cart deduplication
`CartItem` has a unique constraint on `(cartId, productId, size)`. Adding the same
product+size increments quantity rather than creating a duplicate row.

---

## Indexes

All foreign keys are indexed. Additional performance indexes:

| Table | Index | Reason |
|---|---|---|
| User | clerkId, email | Auth lookups |
| Product | slug, status, category, isFeatured | Listing/filter queries |
| Order | userId, status, orderNumber, createdAt | Dashboard queries |
| Payment | razorpayOrderId, razorpayPaymentId, status | Razorpay reconciliation |
| WalletTransaction | walletId, createdAt | Ledger queries |
| ConsultationRequest | status, scheduledAt, clientEmail | Admin dashboard |

---

## Migrations

```bash
# Initial setup — run once to bootstrap
npx prisma migrate dev --name init

# After any schema change
npx prisma migrate dev --name describe_your_change

# Production deploy (runs pending migrations only)
npx prisma migrate deploy

# Seed development data
npm run db:seed

# Open Prisma Studio (visual DB browser)
npm run db:studio
```

---

## API Architecture

### Public Routes (no auth required)
```
GET  /api/products              — catalog with filters
GET  /api/products/[slug]       — product detail
POST /api/consultations         — create consultation (guest or user)
POST /api/webhooks/clerk        — Clerk user lifecycle sync
```

### Authenticated Routes (Clerk session required)
```
GET/POST/DELETE  /api/cart               — persistent cart
GET/POST/DELETE  /api/wishlist           — wishlist
GET/POST         /api/measurements       — saved measurement profiles
PATCH/DELETE     /api/measurements/[id]
GET/POST         /api/orders             — place order + list orders
GET              /api/orders/[id]        — order detail
POST             /api/payments/create-order  — create Razorpay order
POST             /api/payments/verify        — verify payment + activate order
GET              /api/wallet             — balance + transaction history
GET              /api/referral           — own referral code + stats
POST             /api/referral/apply     — apply referral code at signup
```

### Admin Routes (ADMIN role required)
```
GET/POST         /api/admin/products
PATCH/DELETE     /api/admin/products/[id]  (?action=publish|archive|restore)
GET              /api/admin/orders
PATCH            /api/orders/[id]           — status transitions
POST             /api/payments/refund        — issue refund
GET/PATCH        /api/consultations         — manage consultations
PATCH            /api/consultations/[id]
GET              /api/admin/customers
GET/POST         /api/admin/wallets          — view + manually credit wallets
POST             /api/admin/upload           — get signed Cloudinary upload params
```

---

## Folder Structure

```
src/
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── customers/route.ts
│   │   │   ├── orders/route.ts
│   │   │   ├── products/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── upload/route.ts
│   │   │   └── wallets/route.ts
│   │   ├── cart/route.ts
│   │   ├── consultations/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── measurements/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── orders/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── payments/
│   │   │   ├── create-order/route.ts
│   │   │   ├── verify/route.ts
│   │   │   └── refund/route.ts
│   │   ├── products/
│   │   │   ├── route.ts
│   │   │   └── [slug]/route.ts
│   │   ├── referral/
│   │   │   ├── route.ts
│   │   │   └── apply/route.ts
│   │   ├── wallet/route.ts
│   │   └── webhooks/
│   │       └── clerk/route.ts
│   └── (pages)...
├── lib/
│   ├── prisma.ts         — Prisma client singleton
│   ├── cloudinary.ts     — Cloudinary config + upload helpers
│   └── admin-guard.ts    — requireAdmin() auth helper
├── middleware.ts          — Clerk auth middleware
└── types/
    └── index.ts           — Re-exported Prisma types + custom interfaces

prisma/
├── schema.prisma          — Complete database schema
├── seed.ts                — Development seed data
└── migrations/            — Auto-generated by prisma migrate dev
    └── (generated)
```

---

## Production Checklist

- [ ] Provision a PostgreSQL instance (Supabase / Railway / Neon / RDS)
- [ ] Set `DATABASE_URL` in production environment
- [ ] Run `npx prisma migrate deploy` in CI/CD pipeline (not `migrate dev`)
- [ ] Add Clerk webhook endpoint in Clerk Dashboard → Webhooks
- [ ] Add `CLERK_WEBHOOK_SECRET` to env (from Clerk webhook signing secret)
- [ ] Switch Razorpay from test mode (`rzp_test_`) to live (`rzp_live_`)
- [ ] Set `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Restrict Cloudinary upload preset to signed uploads only in production
- [ ] Add `requireAdmin()` guard to all `/api/admin/` routes
- [ ] Set up database connection pooling (PgBouncer / Supabase pooler) for serverless
- [ ] Enable Prisma Accelerate or connection pooling env var for Next.js serverless
- [ ] Add rate limiting to payment and webhook endpoints

---

## Scalability Notes

- **International expansion**: `Address.country` defaults to `"IN"` but accepts any ISO code.
  Add a `currency` field to `Product` and `Order` when multi-currency is needed.
- **Inventory tracking**: Add `stock: Int @default(0)` to `Product` when needed —
  no other schema changes required.
- **Multiple currencies**: Store all amounts in a base currency with an `exchangeRate`
  column, or use a dedicated `Currency` model.
- **Push notifications**: Add a `PushToken` model linked to `User` — no existing tables change.
- **Reviews/ratings**: Add a `ProductReview` model with `userId`, `productId`, `rating`, `body`.
- **Coupons**: Add a `Coupon` model and a `couponId` FK on `Order`.
