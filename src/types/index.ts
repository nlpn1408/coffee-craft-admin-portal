// Core Enums derived from Prisma Schema
export enum UserRole {
  CUSTOMER = "CUSTOMER",
  STAFF = "STAFF",
  ADMIN = "ADMIN",
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELED = "CANCELED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum PaymentMethod {
  COD = "COD",
  CREDIT_CARD = "CREDIT_CARD",
  VNPAY = "VNPAY",
}

export enum VoucherType {
  PERCENT = "PERCENT",
  FIXED = "FIXED",
}

export enum GENDER {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

// Core Interfaces derived from Prisma Schema
// NOTE: Ensure these interfaces match your actual Prisma schema accurately.
// It seems the previous read might have been incomplete or corrupted.
// Defining based on common fields and previous context.

export interface User {
  id: string;
  name?: string | null;
  email: string;
  phone?: string | null;
  address?: string | null;
  imgUrl?: string | null;
  gender?: GENDER | null;
  dob?: Date | null;
  role: UserRole;
  emailVerified: boolean;
  lastLogin?: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  orders?: Order[];
  blogs?: Blog[];
  reviews?: Review[];
  shippingAddresses?: ShippingAddress[];
}

export interface ShippingAddress {
  id: string;
  userId: string;
  address: string;
  receiverName: string;
  receiverPhone: string;
  createdAt: Date;
  updatedAt: Date;
  orders?: Order[];
  user?: User;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  order?: number | null;
  createdAt: Date;
  updatedAt: Date;
  productCount?: number;
  parent?: Category | null;
  children?: Category[];
  products?: Product[];
  applicableVouchers?: Voucher[];
}

export interface Brand {
  id: string;
  name: string;
  description?: string | null;
  order?: number | null;
  createdAt: Date;
  updatedAt: Date;
  productCount?: number;
  products?: Product[];
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  shortDescription?: string | null;
  longDescription?: string | null;
  price: number;
  discountPrice?: number | null;
  categoryId: string;
  brandId?: string | null;
  stock: number;
  active: boolean;
  avgRating: number;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
  brand?: Brand | null;
  orderItems?: OrderItem[];
  reviews?: Review[];
  images?: ProductImage[];
  tags?: Tag[];
  variants?: ProductVariant[];
  vouchersExcluding?: Voucher[];
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku?: string | null;
  price: number;
  discountPrice?: number | null;
  stock: number;
  name: string;
  color?: string | null;
  weight?: string | null;
  material?: string | null;
  createdAt: Date;
  updatedAt: Date;
  product?: Product;
  orderItems?: OrderItem[];
  Review?: Review[]; // Check if this should be reviews?
}

export interface Tag {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  products?: Product[];
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  order?: number | null;
  isThumbnail: boolean;
  createdAt: Date;
  updatedAt: Date;
  product?: Product;
}

export interface Order {
  id: string;
  userId: string;
  total: number;
  shippingFee: number;
  discountAmount: number;
  finalTotal: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  voucherId?: string | null;
  shippingAddressId: string;
  paymentMethod: PaymentMethod;
  note?: string | null;
  transactionId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  voucher?: Voucher | null;
  shippingAddress?: ShippingAddress;
  orderItems?: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productVariantId?: string | null;
  quantity: number;
  priceAtOrder: number;
  subTotal: number;
  discountAmount: number;
  review?: Review | null;
  createdAt: Date;
  updatedAt: Date;
  order?: Order;
  product?: Product;
  productVariant?: ProductVariant | null;
}

export interface Voucher {
  id: string;
  code: string;
  discountPercent?: number | null;
  discountAmount?: number | null;
  maxDiscount?: number | null;
  type: VoucherType;
  startDate: Date;
  endDate: Date;
  usageLimit?: number | null;
  usedCount: number;
  minimumOrderValue?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  applicableCategories?: Category[];
  excludedProducts?: Product[];
  orders?: Order[];
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  thumbnail?: string | null;
  userId: string;
  publicationDate: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  author?: User;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  orderItemId: string;
  orderItem?: OrderItem;
  userId: string;
  user?: User;
  productId: string;
  product?: Product;
  productVariantId?: string | null;
  productVariant?: ProductVariant | null;
  createdAt: Date;
  updatedAt: Date;
}

// Explicitly export types from api.ts that are not duplicates
// Ensure this list is complete and correct relative to api.ts
export type {
  NewProduct,
  NewProductImage,
  NewCategory,
  NewSubcategory,
  NewBrand,
  NewUser,
  NewOrder,
  NewVoucher,
  UpdateVoucher,
  NewTag,
  NewProductVariant,
  UpdateProductVariant,
  NewBlog,
  UpdateBlog,
  NewReview,
  NewShippingAddress,
  SalesSummary,
  PurchaseSummary,
  ExpenseSummary,
  ExpenseByCategorySummary,
  ImportResult,
  PaginatedResponse,
  // Statistics Types from api.ts
  RevenueSummary,
  OrderStatusStat,
  OrderStatusStatsResponse,
  OrderTrendStat,
  OrderTrendResponse,
  TopSellingProduct,
  TopSellingProductsResponse,
  LowStockProduct,
  ProductInventorySummary,
  UserSummaryStats,
  UserRoleDistribution,
  UserRoleDistributionResponse,
  TopSpender,
  TopSpendersResponse,
  NewRegistrationStat,
  NewRegistrationsResponse,
  VoucherUsageStat,
  VoucherUsageResponse,
  VoucherEffectivenessStat,
  VoucherEffectivenessResponse,
  ReviewSummaryStats,
  RatingDistributionStat,
  RatingDistributionResponse,
  ProductReviewStat,
  ProductReviewStatsResponse,
  ProductPerformanceStat,
  ProductPerformanceResponse,
  OrderHistoryEvent,
  OrderHistoryResponse,
} from "./api";

// Note: Prisma's Decimal type is mapped to 'number' in TypeScript.
// Note: Prisma's DateTime type is mapped to 'Date' in TypeScript.
// Note: Sensitive fields like 'password' are often omitted or returned as null/undefined from APIs.
