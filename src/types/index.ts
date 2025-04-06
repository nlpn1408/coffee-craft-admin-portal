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
export interface User {
  id: string;
  name?: string | null;
  email: string;
  // password field is typically omitted from client-side types for security
  phone?: string | null;
  address?: string | null;
  imgUrl?: string | null;
  gender?: GENDER | null;
  dob?: Date | null; // Prisma DateTime maps to Date
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
  order?: number | null; // Prisma Int maps to number
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
  order?: number | null; // Prisma Int maps to number
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
  price: number; // Prisma Decimal maps to number
  discountPrice?: number | null; // Prisma Decimal maps to number
  categoryId: string;
  brandId?: string | null;
  stock: number; // Prisma Int maps to number
  active: boolean;
  avgRating: number; // Prisma Float maps to number
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
  price: number; // Prisma Decimal maps to number
  discountPrice?: number | null; // Prisma Decimal maps to number
  stock: number; // Prisma Int maps to number
  name: string;
  color?: string | null;
  weight?: string | null;
  material?: string | null;
  createdAt: Date;
  updatedAt: Date;

  product?: Product;
  orderItems?: OrderItem[];
  Review?: Review[];
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
  order?: number | null; // Prisma Int maps to number
  isThumbnail: boolean;
  // altText?: string | null; // Uncomment if needed
  createdAt: Date;
  updatedAt: Date;

  product?: Product;
}

export interface Order {
  id: string;
  userId: string;
  total: number; // Prisma Decimal maps to number
  shippingFee: number; // Prisma Decimal maps to number
  discountAmount: number; // Prisma Decimal maps to number
  finalTotal: number; // Prisma Decimal maps to number
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  voucherId?: string | null;
  shippingAddressId: string;
  paymentMethod: PaymentMethod;
  note?: string | null;
  transactionId?: string | null;
  createdAt: Date; // Represents the order placement time
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
  quantity: number; // Prisma Int maps to number
  priceAtOrder: number; // Prisma Decimal maps to number
  subTotal: number; // Prisma Decimal maps to number
  discountAmount: number; // Prisma Decimal maps to number
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
  discountPercent?: number | null; // Prisma Decimal maps to number
  discountAmount?: number | null; // Prisma Decimal maps to number
  maxDiscount?: number | null; // Prisma Decimal maps to number
  type: VoucherType;
  startDate: Date;
  endDate: Date;
  usageLimit?: number | null; // Prisma Int maps to number
  usedCount: number; // Prisma Int maps to number
  minimumOrderValue?: number | null; // Prisma Decimal maps to number
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  applicableCategories?: Category[];
  excludedProducts?: Product[];
  orders?: Order[]; // Orders that used this voucher
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  thumbnail?: string | null; // URL from external storage
  userId: string;
  publicationDate: Date; // Consider making optional or default to now()
  active: boolean;
  // slug?: string | null; // Optional: For SEO URLs
  createdAt: Date;
  updatedAt: Date;

  author?: User;
}

export interface Review {
  id: string;
  rating: number; // 1-5
  comment?: string | null;

  orderItemId: string;
  orderItem?: OrderItem;

  // Vẫn giữ lại để dễ truy vấn theo user và product trực tiếp
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
export type {
  NewProduct,
  NewProductImage,
  NewCategory,
  NewSubcategory,
  NewBrand,
  NewUser,
  NewOrder,
  NewVoucher,
  UpdateVoucher, // Add UpdateVoucher
  NewTag,
  NewProductVariant,
  UpdateProductVariant,
  NewBlog,
  UpdateBlog, // Add UpdateBlog
  NewReview,
  NewShippingAddress,
  SalesSummary,
  PurchaseSummary,
  ExpenseSummary,
  ExpenseByCategorySummary,
  ImportResult,
  PaginatedResponse, // Add PaginatedResponse
} from "./api";

// Note: Prisma's Decimal type is mapped to 'number' in TypeScript.
// Note: Prisma's DateTime type is mapped to 'Date' in TypeScript.
// Note: Sensitive fields like 'password' are often omitted or returned as null/undefined from APIs.
// Note: Removed wildcard export `export * from "./api";`
