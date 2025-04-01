// Keep interfaces specific to API requests/responses or unique features

// Interfaces for creating new entities
export interface NewProduct {
  name: string;
  description: string | null;
  price: number;
  categoryId: string;
  brandId: string;
  stock: number;
  active: boolean;
}

export interface NewProductImage {
  id?: string;
  productId?: string;
  url: string;
  isThumbnail: boolean;
  order: number | null;
}

export interface NewCategory {
  name: string;
  description: string | null;
  parentId?: string | null;
}

export interface NewSubcategory {
  name: string;
  categoryId: string;
}

export interface NewBrand {
  name: string;
  description: string | null;
}

export interface NewUser {
  name: string;
  email: string;
  password: string;
  role: string; // Use string here or import UserRole from index.ts if preferred
}

export interface NewOrder {
  userId: string;
  total: number;
  status?: string; // Use string here or import OrderStatus from index.ts
  voucherId?: string | null;
  shippingAddressId: string;
  orderDate: string; // Consider using Date type if consistent
  paymentMethod?: string; // Use string here or import PaymentMethod from index.ts
  note?: string | null;
  orderItems: {
    productId: string;
    quantity: number;
    subTotal: number;
  }[];
}

export interface NewVoucher {
  code: string;
  discountPercent: number;
  maxDiscount: number;
  type: string; // Use string here or import VoucherType from index.ts
  startDate: string; // Consider using Date type
  endDate: string; // Consider using Date type
  usedLeft: number;
  isActive?: boolean;
}

export interface NewBlog {
  title: string;
  content: string;
  thumbnail?: string | null;
  userId: string;
  publicationDate: string; // Consider using Date type
  active?: boolean;
}

export interface NewReview {
  userId: string;
  productId: string;
  rating: number;
  comment?: string | null;
}

export interface NewShippingAddress {
  userId: string;
  address: string;
  receiverName: string;
  receiverPhone: string;
}

// Dashboard specific types
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

// Note: Removed duplicated enums (UserRole, OrderStatus, PaymentMethod, VoucherType)
// Note: Removed duplicated interfaces (Product, ProductImage, Category, Brand, User, Order, OrderItem, Voucher, Blog, Review, ShippingAddress)
// These should now be imported from './index.ts' where needed.
// Consider using types (Date) instead of strings for date fields if applicable across the app.
// Consider importing Enums from index.ts for 'New*' interfaces if strict typing is desired.
