import moment from "moment-timezone";
import { VoucherType } from "@/types"; // Import the actual enum

// Define an interface for the structure matching createVoucherSchema
// Note: Prisma schema uses Decimal, but API input might expect number or string
// We'll use numbers here for simplicity in dummy data.
// Remove local VoucherType object definition

interface CreateVoucherInput {
  code: string;
  type: VoucherType; // Use the imported enum type
  discountPercent?: number | null;
  discountAmount?: number | null;
  maxDiscount?: number | null;
  startDate: string; // ISO String format
  endDate: string; // ISO String format
  usageLimit?: number | null;
  minimumOrderValue?: number | null;
  isActive?: boolean;
  applicableCategoryIds?: string[];
  excludedProductIds?: string[];
}

const now = moment();

export const dummyVouchers: CreateVoucherInput[] = [
  // 1. Simple Percentage Discount (Active)
  {
    code: "WELCOME15",
    type: VoucherType.PERCENT,
    discountPercent: 15,
    maxDiscount: 50000, // Max 50k VND discount
    startDate: now.toISOString(),
    endDate: now.clone().add(30, "days").toISOString(),
    usageLimit: 1000,
    minimumOrderValue: 100000, // Min 100k VND order
    isActive: true,
  },
  // 2. Fixed Amount Discount (Active)
  {
    code: "FIXED20K",
    type: VoucherType.FIXED,
    discountAmount: 20000, // 20k VND off
    startDate: now.toISOString(),
    endDate: now.clone().add(60, "days").toISOString(),
    usageLimit: 500,
    minimumOrderValue: 150000, // Min 150k VND order
    isActive: true,
  },
  // 3. Percentage Discount - No Max Discount (Active)
  {
    code: "PERCENT10NOMAX",
    type: VoucherType.PERCENT,
    discountPercent: 10,
    startDate: now.clone().add(1, "week").toISOString(),
    endDate: now.clone().add(1, "week").add(14, "days").toISOString(),
    usageLimit: null, // Unlimited usage within timeframe
    minimumOrderValue: 50000,
    isActive: true,
  },
  // 4. Fixed Amount - High Value (Active)
  {
    code: "BIGSALE100K",
    type: VoucherType.FIXED,
    discountAmount: 100000,
    startDate: now.toISOString(),
    endDate: now.clone().add(1, "month").toISOString(),
    usageLimit: 200,
    minimumOrderValue: 500000,
    isActive: true,
  },
  // 5. Expired Percentage Voucher
  {
    code: "EXPIRED5",
    type: VoucherType.PERCENT,
    discountPercent: 5,
    maxDiscount: 10000,
    startDate: now.clone().subtract(20, "days").toISOString(),
    endDate: now.clone().subtract(5, "days").toISOString(), // Ended 5 days ago
    usageLimit: 100,
    minimumOrderValue: 0, // No minimum
    isActive: false, // Should be inactive
  },
  // 6. Future Fixed Amount Voucher
  {
    code: "FUTURE30",
    type: VoucherType.FIXED,
    discountAmount: 30000,
    startDate: now.clone().add(1, "month").toISOString(),
    endDate: now.clone().add(2, "months").toISOString(),
    usageLimit: 300,
    minimumOrderValue: 200000,
    isActive: true, // Active flag, but start date is in future
  },
  // 7. Low Usage Limit Percentage Voucher
  {
    code: "LIMITED25",
    type: VoucherType.PERCENT,
    discountPercent: 25,
    maxDiscount: 75000,
    startDate: now.toISOString(),
    endDate: now.clone().add(1, "year").toISOString(), // Long expiry
    usageLimit: 50, // Only 50 uses
    minimumOrderValue: 300000,
    isActive: true,
  },
  // 8. Inactive Fixed Amount Voucher
  {
    code: "DISABLED50K",
    type: VoucherType.FIXED,
    discountAmount: 50000,
    startDate: now.clone().subtract(10, "days").toISOString(),
    endDate: now.clone().add(10, "days").toISOString(),
    usageLimit: 100,
    minimumOrderValue: 250000,
    isActive: false, // Manually set to inactive
  },
  // 9. Percentage Voucher - No Minimum Order
  {
    code: "NOMIN5PERCENT",
    type: VoucherType.PERCENT,
    discountPercent: 5,
    maxDiscount: 20000,
    startDate: now.toISOString(),
    endDate: now.clone().add(45, "days").toISOString(),
    usageLimit: 500,
    minimumOrderValue: null, // No minimum order value
    isActive: true,
  },
  // 10. Fixed Amount - Short Duration (e.g., Flash Sale)
  {
    code: "FLASH24H",
    type: VoucherType.FIXED,
    discountAmount: 40000,
    startDate: now.clone().add(1, "day").startOf("day").toISOString(), // Starts tomorrow
    endDate: now.clone().add(1, "day").endOf("day").toISOString(), // Ends tomorrow night
    usageLimit: 100,
    minimumOrderValue: 100000,
    isActive: true,
  },
  // 11. Another Percentage Voucher
  {
    code: "SUMMER20",
    type: VoucherType.PERCENT,
    discountPercent: 20,
    maxDiscount: 100000,
    startDate: now.clone().add(2, "months").toISOString(),
    endDate: now.clone().add(3, "months").toISOString(),
    usageLimit: 1000,
    minimumOrderValue: 200000,
    isActive: true,
  },
];
