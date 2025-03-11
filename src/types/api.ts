export enum UserRole {
  CUSTOMER = "CUSTOMER",
  STAFF = "STAFF",
  ADMIN = "ADMIN"
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELED = "CANCELED"
}

export enum PaymentMethod {
  COD = "COD",
  CREDIT_CARD = "CREDIT_CARD",
  PAYPAL = "PAYPAL"
}

export enum VoucherType {
  PERCENT = "PERCENT",
  FIXED = "FIXED"
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  categoryId: string;
  brandId: string;
  stock: number;
  active: boolean;
  avgRating: number;
  images?: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  order: number | null;
  isThumbnail: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewProduct {
  name: string;
  description: string | null;
  price: number;
  categoryId: string;
  brandId: string;
  stock: number;
  active?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
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

export interface Brand {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewBrand {
  name: string;
  description: string | null;
}

export interface SalesSummary {
  salesSummaryId: string;
  totalValue: number;
  changePercentage?: number;
  date: string;
}

export interface PurchaseSummary {
  purchaseSummaryId: string;
  totalPurchased: number;
  changePercentage?: number;
  date: string;
}

export interface ExpenseSummary {
  expenseSummaryId: string;
  totalExpenses: number;
  date: string;
}

export interface ExpenseByCategorySummary {
  expenseByCategorySummaryId: string;
  category: string;
  amount: string;
  date: string;
}

export interface DashboardMetrics {
  popularProducts: Product[];
  salesSummary: SalesSummary[];
  purchaseSummary: PurchaseSummary[];
  expenseSummary: ExpenseSummary[];
  expenseByCategorySummary: ExpenseByCategorySummary[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface NewUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface Order {
  id: string;
  userId: string;
  total: number;
  status: OrderStatus;
  voucherId: string | null;
  shippingAddressId: string;
  orderDate: string;
  paymentMethod: PaymentMethod;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  orderItems?: OrderItem[];
  user?: User;
  shippingAddress?: ShippingAddress;
  voucher?: Voucher;
}

export interface NewOrder {
  userId: string;
  total: number;
  status?: OrderStatus;
  voucherId?: string | null;
  shippingAddressId: string;
  orderDate: string;
  paymentMethod?: PaymentMethod;
  note?: string | null;
  orderItems: {
    productId: string;
    quantity: number;
    subTotal: number;
  }[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  subTotal: number;
  createdAt: string;
  updatedAt: string;
  product?: Product;
}

export interface Voucher {
  id: string;
  code: string;
  discountPercent: number;
  maxDiscount: number;
  type: VoucherType;
  startDate: string;
  endDate: string;
  usedLeft: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewVoucher {
  code: string;
  discountPercent: number;
  maxDiscount: number;
  type: VoucherType;
  startDate: string;
  endDate: string;
  usedLeft: number;
  isActive?: boolean;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  thumbnail: string | null;
  userId: string;
  publicationDate: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  author?: User;
}

export interface NewBlog {
  title: string;
  content: string;
  thumbnail?: string | null;
  userId: string;
  publicationDate: string;
  active?: boolean;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
  product?: Product;
}

export interface NewReview {
  userId: string;
  productId: string;
  rating: number;
  comment?: string | null;
}

export interface ShippingAddress {
  id: string;
  userId: string;
  address: string;
  receiverName: string;
  receiverPhone: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface NewShippingAddress {
  userId: string;
  address: string;
  receiverName: string;
  receiverPhone: string;
}

export interface ImportResult {
  message: string;
  success: number;
  errors: string[];
} 