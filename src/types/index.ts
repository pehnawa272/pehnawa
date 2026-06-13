/**
 * Pehnawa — Shared TypeScript types
 * Re-exports Prisma model types + extends them with computed/frontend shapes.
 */

export type {
  User,
  Address,
  Product,
  ProductImage,
  ProductVideo,
  Occasion,
  Wishlist,
  WishlistItem,
  MeasurementProfile,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Payment,
  ReferralCode,
  ReferralRecord,
  Wallet,
  WalletTransaction,
  ConsultationRequest,
} from "@/generated/client";

import type {
  User,
  Order,
  OrderItem,
  Product,
  Payment,
  Address,
} from "@/generated/client";

export {
  ProductStatus,
  ProductCategory,
  ProductSubCategory,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  ConsultationStatus,
  ConsultationType,
  WalletTxType,
  WalletTxReason,
  UserRole,
} from "@/generated/client";

// ─── Custom frontend / API shapes ───────────────────────────────

/** Cart item as stored in CartItem.customTailoring JSON column */
export interface CustomTailoring {
  neckline?: string;
  sleeve?: string;
  customSizeEnabled?: boolean;
  bust?: string;
  waist?: string;
  height?: string;
  notes?: string;
}

/** Razorpay checkout initiation payload returned from API */
export interface RazorpayOrderPayload {
  razorpayOrderId: string;
  amount: number;          // in paise
  currency: string;
  keyId: string;
  orderId: string;         // our internal Order.id
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
}

/** Product with primary image URL resolved (for listing pages) */
export interface ProductCard {
  id: string;
  slug: string;
  title: string;
  subTitle: string | null;
  price: number | null;
  isEnquireOnly: boolean;
  primaryImage: string | null;
  category: string;
}

/** Order with nested items and payment — used in admin / order detail pages */
export type OrderWithDetails = Order & {
  items: (OrderItem & { product: Product })[];
  payment: Payment | null;
  address: Address;
  user: Pick<User, "id" | "name" | "email" | "phone">;
};
