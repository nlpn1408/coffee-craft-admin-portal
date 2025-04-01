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

export enum PaymentMethod {
  COD = "COD",
  CREDIT_CARD = "CREDIT_CARD",
  VNPAY = "VNPAY",
}

export enum VoucherType {
  PERCENT = "PERCENT",
  FIXED = "FIXED",
}

// Core Interfaces derived from Prisma Schema
export interface User {
  id: string;
  name?: string | null;
  email: string;
  password?: string; // Usually excluded from client-side types
  phone?: string | null;
  address?: string | null;
  imgUrl?: string | null;
  gender?: string | null;
  dob?: Date | null;
  role: UserRole;
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
  createdAt: Date;
  updatedAt: Date;

  parent?: Category | null;
  children?: Category[];
  products?: Product[];
}

export interface Brand {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;

  products?: Product[];
}

export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  price: number; // Prisma Decimal maps to number in TS
  categoryId: string;
  brandId: string;
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
  total: number; // Prisma Decimal maps to number in TS
  status: OrderStatus;
  voucherId?: string | null;
  shippingAddressId: string;
  orderDate: Date;
  paymentMethod: PaymentMethod;
  note?: string | null;
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
  quantity: number;
  subTotal: number; // Prisma Decimal maps to number in TS
  createdAt: Date;
  updatedAt: Date;

  order?: Order;
  product?: Product;
}

export interface Voucher {
  id: string;
  code: string;
  discountPercent: number; // Prisma Decimal maps to number in TS
  maxDiscount: number; // Prisma Decimal maps to number in TS
  type: VoucherType;
  startDate: Date;
  endDate: Date;
  usedLeft: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

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
  userId: string;
  productId: string;
  rating: number;
  comment?: string | null;
  createdAt: Date;
  updatedAt: Date;

  user?: User;
  product?: Product;
}

// Explicitly export types from api.ts that are not duplicates
export type {
  NewProduct,
  NewProductImage,
  NewCategory,
  NewSubcategory,
  NewBrand,
  NewUser,
  NewOrder,
  NewVoucher,
  NewBlog,
  NewReview,
  NewShippingAddress,
  SalesSummary,
  PurchaseSummary,
  ExpenseSummary,
  ExpenseByCategorySummary,
  DashboardMetrics,
  ImportResult,
} from "./api";

// Note: Prisma's Decimal type is mapped to 'number' in TypeScript.
// Note: Prisma's DateTime type is mapped to 'Date' in TypeScript.
// Note: Sensitive fields like 'password' are often omitted or made optional in client-side types.
// Note: Removed wildcard export `export * from "./api";`
