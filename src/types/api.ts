import { OrderStatus, PaymentMethod, PaymentStatus, UserRole, VoucherType, GENDER } from './index';

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
  excludedProductIds?: string[]; // IDs of products
}

export interface NewBlog {
  title: string;
  content: string;
  thumbnail?: string | null;
  userId: string; // Usually inferred from logged-in user on server
  publicationDate?: string; // Use string for API payload, convert on server
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

// Assuming Product type will be imported from index.ts where needed
// import { Product } from './index'; // Example import
export interface DashboardMetrics {
  popularProducts: any[]; // Use 'any' for now, or import Product from index.ts
  salesSummary: SalesSummary[];
  purchaseSummary: PurchaseSummary[];
  expenseSummary: ExpenseSummary[];
  expenseByCategorySummary: ExpenseByCategorySummary[];
}

// Utility types
export interface ImportResult {
  message: string;
  success: number;
  errors: string[];
}
