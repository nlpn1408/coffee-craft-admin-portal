import { OrderStatus, PaymentMethod, PaymentStatus, UserRole, VoucherType, GENDER } from './index';

// Generic type for paginated API responses
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  // Add other potential pagination fields if needed (e.g., page, limit, hasNextPage)
}

// Interfaces for creating new entities
export interface NewProduct {
  sku: string;
  name: string;
  shortDescription?: string | null;
  longDescription?: string | null;
  price: number; // Prisma Decimal maps to number
  discountPrice?: number | null; // Prisma Decimal maps to number
  categoryId: string;
  brandId?: string | null;
  stock: number; // Prisma Int maps to number
  active?: boolean;
  tags?: string[]; // Add optional array of tag IDs
  // avgRating is usually calculated, not set directly
  // images, variants are likely handled separately or nested differently
}

export interface NewProductImage {
  productId: string; // Should be required when creating
  url: string;
  order?: number | null;
  isThumbnail?: boolean;
  // altText?: string | null; // Uncomment if needed
}

export interface NewCategory {
  name: string;
  description?: string | null;
  parentId?: string | null;
  order?: number | null; // Added order field
}

// Assuming NewSubcategory is still relevant, otherwise remove
export interface NewSubcategory {
  name: string;
  categoryId: string; // Assuming this links to the parent Category ID
}

export interface NewBrand {
  name: string;
  description?: string | null;
  order?: number | null; // Added order field
}

export interface NewUser {
  name?: string | null;
  email: string;
  password?: string; // Password might be handled separately (e.g., during signup)
  phone?: string | null;
  address?: string | null;
  imgUrl?: string | null;
  gender?: GENDER | null;
  dob?: string | null; // Use string for API payload, convert on server
  role?: UserRole; // Optional, might default on server
  emailVerified?: boolean; // Usually set by server after verification
  isActive?: boolean; // Usually defaults or managed by admin
}

export interface NewOrderItem { // Renamed for clarity if used standalone
  productId: string;
  productVariantId?: string | null;
  quantity: number;
  priceAtOrder: number; // Price at the time of order
  subTotal: number; // quantity * priceAtOrder
  discountAmount?: number;
}

export interface NewOrder {
  userId: string;
  total: number; // Original total before discounts/fees
  shippingFee?: number;
  discountAmount?: number;
  finalTotal: number; // The actual amount charged
  status?: OrderStatus; // Default usually set by server
  paymentStatus?: PaymentStatus; // Default usually set by server
  voucherId?: string | null;
  shippingAddressId: string;
  paymentMethod?: PaymentMethod; // Default usually set by server
  note?: string | null;
  transactionId?: string | null; // Usually set after payment processing
  orderItems: NewOrderItem[]; // Use the defined interface for items
}


export interface NewVoucher {
  code: string;
  discountPercent?: number | null;
  discountAmount?: number | null;
  maxDiscount?: number | null;
  type: VoucherType;
  startDate: string; // Use string for API payload, convert on server
  endDate: string; // Use string for API payload, convert on server
  usageLimit?: number | null;
  minimumOrderValue?: number | null;
  isActive?: boolean;
  applicableCategoryIds?: string[]; // IDs of categories
  excludedProductIds?: string[];
}

// For updating vouchers, most fields are optional
export interface UpdateVoucher {
  code?: string;
  discountPercent?: number | null;
  discountAmount?: number | null;
  maxDiscount?: number | null;
  // type is likely not updatable
  startDate?: string;
  endDate?: string;
  usageLimit?: number | null;
  minimumOrderValue?: number | null;
  isActive?: boolean;
  applicableCategoryIds?: string[]; // Replaces existing
  excludedProductIds?: string[];    // Replaces existing
}

export interface NewBlog {
  title: string;
  content: string;
  thumbnail?: string | null;
  userId: string; // Usually inferred from logged-in user on server
  publicationDate?: string; // Use string for API payload, convert on server
  active?: boolean;
}

// For updating blogs, all fields are optional
export interface UpdateBlog {
  title?: string;
  content?: string;
  thumbnail?: string | null;
  publicationDate?: string | null; // Use string for API payload
  active?: boolean;
}

export interface NewReview {
  rating: number; // 1-5
  comment?: string | null;
  orderItemId: string;
  userId: string; // Usually inferred from logged-in user on server
  productId: string;
  productVariantId?: string | null;
}

export interface NewShippingAddress {
  userId: string; // Usually inferred from logged-in user on server
  address: string;
  receiverName: string;
  receiverPhone: string;
}

export interface NewTag {
  name: string;
}

export interface NewProductVariant {
  productId: string; // Required link to parent product
  sku?: string | null;
  price: number;
  discountPrice?: number | null;
  stock: number;
  name: string; // e.g., "Red - Large"
  color?: string | null;
  weight?: string | null;
  material?: string | null;
}

// For updates, typically all fields are optional except the ID
export interface UpdateProductVariant {
  sku?: string | null;
  price?: number;
  discountPrice?: number | null;
  stock?: number;
  name?: string;
  color?: string | null;
  weight?: string | null;
  material?: string | null;
  // productId is usually not updatable
}


// Dashboard specific types (Assuming these remain unchanged by the schema update)
export interface SalesSummary {
  salesSummaryId: string;
  totalValue: number;
  changePercentage?: number;
  date: string; // Consider using Date type
}

export interface PurchaseSummary {
  purchaseSummaryId: string;
  totalPurchased: number;
  changePercentage?: number;
  date: string; // Consider using Date type
}

export interface ExpenseSummary {
  expenseSummaryId: string;
  totalExpenses: number;
  date: string; // Consider using Date type
}

export interface ExpenseByCategorySummary {
  expenseByCategorySummaryId: string;
  category: string;
  amount: string; // Consider using number type
  date: string; // Consider using Date type
}

// --- New Statistics API Types ---

// /stats/revenue/summary
export interface RevenueSummary {
  startDate: string; // ISO Date string
  endDate: string;   // ISO Date string
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
}

// Item within /stats/revenue/orders/by-status response
export interface OrderStatusStat {
  status: OrderStatus; // Use existing enum
  orderCount: number;
  totalValue: number;
}

// Response type for /stats/revenue/orders/by-status
export interface OrderStatusStatsResponse {
    startDate: string;
    endDate: string;
    data: OrderStatusStat[];
}


// Item within /stats/products/top-selling response
export interface TopSellingProduct {
  productId: string;
  name: string;
  sku: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

// Response type for /stats/products/top-selling
export interface TopSellingProductsResponse {
    startDate: string;
    endDate: string;
    sortBy: 'quantity' | 'revenue';
    limit: number;
    data: TopSellingProduct[];
}

// Item within /stats/products/inventory lowStockProducts array
export interface LowStockProduct {
  productId: string;
  name: string;
  sku: string;
  stock: number;
}

// Response type for /stats/products/inventory
// Updated Response type for /stats/products/inventory
export interface ProductInventorySummary {
  lowStockThreshold: number;
  summary: {
      totalProducts: number;
      productsInStock: number;
      productsLowStock: number;
      productsOutOfStock: number;
      totalInventoryValue: number;
  };
  lowStockProducts: LowStockProduct[];
  outOfStockProducts: LowStockProduct[]; // Add outOfStockProducts
}

// --- User Stats Types ---

// /stats/users/summary
export interface UserSummaryStats {
  startDate: string;
  endDate: string;
  totalUsers: number;
  newUsersInPeriod: number;
  activeUsers: number;
}

// Item within /stats/users/role-distribution
export interface UserRoleDistribution {
  role: UserRole; // Use existing enum
  count: number;
}

// Response for /stats/users/role-distribution
export interface UserRoleDistributionResponse {
  data: UserRoleDistribution[];
}

// Item within /stats/users/top-spenders
export interface TopSpender {
  userId: string;
  name: string | null; // Name can be null
  email: string;
  totalSpent: number;
  orderCount: number;
}

// Response for /stats/users/top-spenders
export interface TopSpendersResponse {
  startDate: string;
  endDate: string;
  limit: number;
  data: TopSpender[];
}

// Item within /stats/users/new-registrations
export interface NewRegistrationStat {
  date: string; // Date string (YYYY-MM-DD, YYYY-WW, YYYY-MM)
  count: number;
}

// Response for /stats/users/new-registrations
export interface NewRegistrationsResponse {
  startDate: string;
  endDate: string;
  groupBy: 'day' | 'week' | 'month';
  data: NewRegistrationStat[];
}


// --- Voucher Stats Types ---

// Item within /stats/vouchers/usage
export interface VoucherUsageStat {
  voucherId: string;
  code: string;
  type: VoucherType; // Use existing enum
  usageCount: number;
  totalDiscountGiven: number;
}

// Response for /stats/vouchers/usage
export interface VoucherUsageResponse {
  startDate: string;
  endDate: string;
  limit: number;
  sortBy: 'usageCount' | 'totalDiscount';
  data: VoucherUsageStat[];
}

// Item within /stats/vouchers/effectiveness
export interface VoucherEffectivenessStat {
  voucherId: string;
  code: string;
  type: VoucherType;
  usageCount: number;
  totalDiscountGiven: number;
  totalRevenueFromOrders: number;
}

// Response for /stats/vouchers/effectiveness
export interface VoucherEffectivenessResponse {
  startDate: string;
  endDate: string;
  data: VoucherEffectivenessStat[];
}


// --- Review Stats Types ---

// /stats/reviews/summary
export interface ReviewSummaryStats {
  startDate: string;
  endDate: string;
  averageRating: number;
  totalReviews: number;
  newReviewsInPeriod: number;
}

// Item within /stats/reviews/rating-distribution
export interface RatingDistributionStat {
  rating: number; // 1-5
  count: number;
}

// Response for /stats/reviews/rating-distribution
export interface RatingDistributionResponse {
  startDate: string;
  endDate: string;
  productId: string | null;
  data: RatingDistributionStat[];
}

// Item within /stats/reviews/by-product
export interface ProductReviewStat {
  productId: string;
  name: string;
  sku: string;
  averageRating: number;
  reviewCount: number;
}

// Response for /stats/reviews/by-product (Paginated)
export interface ProductReviewStatsResponse {
  page: number;
  limit: number;
  totalPages: number;
  totalProducts: number;
  data: ProductReviewStat[];
}

// Add other stats response types if needed (e.g., ByPaymentMethod, Financials, etc.)
// Example:
// export interface RevenueByPaymentMethod { paymentMethod: PaymentMethod; totalRevenue: number; orderCount: number; }
// export interface RevenueByPaymentMethodResponse { startDate: string; endDate: string; data: RevenueByPaymentMethod[]; }
// export interface OrderFinancials { totalShippingFee: number; totalDiscountAmount: number; }
// export interface OrderFinancialsResponse { startDate: string; endDate: string; totalShippingFee: number; totalDiscountAmount: number; }

// Utility types
export interface ImportResult {
  message: string;
  success: number;
  errors: string[];
}
