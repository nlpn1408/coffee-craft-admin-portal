import {
  RevenueSummary,
  OrderStatusStatsResponse,
  TopSellingProductsResponse,
  ProductInventorySummary,
  UserSummaryStats,
  OrderTrendResponse,
  ReviewSummaryStats,
  NewRegistrationsResponse,
  ProductPerformanceResponse,
  VoucherUsageResponse, // Import VoucherUsageResponse
  TopSpendersResponse, // Import TopSpendersResponse for top customers
  PaginatedResponse, // Import PaginatedResponse
} from "@/types/api";
import { Order } from "@/types"; // Import Order from types/index
import { API_ENDPOINTS } from "@/lib/constants/api";
import { baseApi } from "./baseApi";

// Define type for statistics query arguments
export type StatsQueryArgs = {
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom' | 'last30days'; // Use 'last30days' as a client-side default marker
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
};

// Define type for top selling products specific args
type TopSellingQueryArgs = StatsQueryArgs & {
  limit?: number;
  sortBy?: 'quantity' | 'revenue';
};

// Define type for inventory specific args (doesn't need date range)
type InventoryQueryArgs = {
  lowStockThreshold?: number;
};

// Define type for order trend specific args
type OrderTrendQueryArgs = StatsQueryArgs & {
  groupBy?: 'day' | 'month' | 'year';
};

// Define type for new registrations specific args
type NewRegistrationsQueryArgs = StatsQueryArgs & {
    groupBy?: 'day' | 'week' | 'month';
};

// Define type for product performance specific args
type ProductPerformanceQueryArgs = StatsQueryArgs & {
    groupBy: 'category' | 'brand';
};

// Define type for voucher usage specific args
type VoucherUsageQueryArgs = StatsQueryArgs & {
    limit?: number;
    sortBy?: 'usageCount' | 'totalDiscount';
};


export const dashboardService = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Fetch Revenue Summary (for KPIs) - Accepts date range args
    getRevenueSummary: build.query<RevenueSummary, StatsQueryArgs | void>({ // Allow void for default call
      query: (args) => {
        // Only pass params if a specific period (not the default 'last30days') is selected
        const params = args && args.period !== 'last30days' ? { period: args.period, startDate: args.startDate, endDate: args.endDate } : undefined;
        return {
          url: API_ENDPOINTS.STATS_REVENUE_SUMMARY,
          params,
        };
      },
      providesTags: ["StatsRevenue"],
    }),

    // Fetch Recent Orders - Accepts limit and sorting
    getRecentOrders: build.query<PaginatedResponse<Order>, { limit?: number } | void>({
      query: (args) => {
        const { limit = 5 } = args ?? {}; // Default limit to 5
        return {
          url: API_ENDPOINTS.ORDERS, // Using the general orders endpoint
          params: {
              sortBy: 'createdAt', // Sort by creation date
              sortOrder: 'desc',     // In descending order (most recent first)
            limit: limit,      // Limit the number of results
          },
        };
      },
      providesTags: ["Order"], // Corrected tag to "Order"
    }),

    // Fetch Top Customers (Top Spenders) - Accepts date range and limit
    getTopCustomers: build.query<TopSpendersResponse, StatsQueryArgs & { limit?: number } | void>({
      query: (args) => {
        const { limit = 3, period, startDate, endDate } = args ?? {}; // Default limit to 3
        const dateParams = period && period !== 'last30days' ? { period, startDate, endDate } : {};
        return {
          url: API_ENDPOINTS.STATS_USERS_TOP_SPENDERS,
          params: { limit, ...dateParams },
        };
      },
      providesTags: ["StatsUsers"], // Re-use StatsUsers tag
    }),

    // Fetch Order Status Stats - Accepts date range args
    getOrderStatusStats: build.query<OrderStatusStatsResponse, StatsQueryArgs | void>({
      query: (args) => {
        const params = args && args.period !== 'last30days' ? { period: args.period, startDate: args.startDate, endDate: args.endDate } : undefined;
        return {
          url: API_ENDPOINTS.STATS_REVENUE_ORDERS_BY_STATUS,
          params,
        };
      },
      providesTags: ["StatsOrders"],
    }),

    // Fetch Top Selling Products - Accepts date range and specific args
    getTopSellingProducts: build.query<TopSellingProductsResponse, TopSellingQueryArgs | void>({
      query: (args) => {
        const { limit = 5, sortBy = 'quantity', period, startDate, endDate } = args ?? {};
        // Construct date params only if a specific period is chosen
        const dateParams = period && period !== 'last30days' ? { period, startDate, endDate } : {};
        return {
          url: API_ENDPOINTS.STATS_PRODUCTS_TOP_SELLING,
          params: { limit, sortBy, ...dateParams }, // Combine params
        };
      },
      providesTags: ["StatsProducts"],
    }),


    // Fetch Product Inventory Summary (Doesn't depend on date range based on API doc)
    getProductInventorySummary: build.query<ProductInventorySummary, InventoryQueryArgs | void >({
       query: (args) => ({
         url: API_ENDPOINTS.STATS_PRODUCTS_INVENTORY,
         params: { lowStockThreshold: args?.lowStockThreshold }, // API defaults threshold if not provided
       }),
      providesTags: ["StatsInventory", "StatsProducts"],
    }),

    // Fetch User Summary Stats (for KPIs and User Activity) - Accepts date range args
    getUserSummaryStats: build.query<UserSummaryStats, StatsQueryArgs | void>({
      query: (args) => {
        const params = args && args.period !== 'last30days' ? { period: args.period, startDate: args.startDate, endDate: args.endDate } : undefined;
        // Add activeThresholdDays if needed, or rely on API default
        // if (args?.activeThresholdDays) params.activeThresholdDays = args.activeThresholdDays;
        return {
          url: API_ENDPOINTS.STATS_USERS_SUMMARY,
          params,
        };
      },
      providesTags: ["StatsUsers"],
    }),

    // Fetch Order Trend data - Accepts date range and groupBy args
    getOrderTrend: build.query<OrderTrendResponse, OrderTrendQueryArgs | void>({
      query: (args) => {
        const { groupBy = 'day', period, startDate, endDate } = args ?? {}; // Default groupBy to 'day'
        // Construct date params only if a specific period is chosen
        const dateParams = period && period !== 'last30days' ? { period, startDate, endDate } : {};
        return {
          url: API_ENDPOINTS.STATS_ORDERS_TREND,
          params: { groupBy, ...dateParams }, // Combine params
        };
      },
      providesTags: ["StatsOrders"], // Re-use StatsOrders tag as it relates to orders
    }),

    // Fetch Review Summary Stats - Accepts date range args
    getReviewSummary: build.query<ReviewSummaryStats, StatsQueryArgs | void>({
      query: (args) => {
        const params = args && args.period !== 'last30days' ? { period: args.period, startDate: args.startDate, endDate: args.endDate } : undefined;
        return {
          url: API_ENDPOINTS.STATS_REVIEWS_SUMMARY,
          params,
        };
      },
      providesTags: ["StatsReviews"],
    }),

    // Fetch New User Registrations Trend - Accepts date range and groupBy args
    getNewRegistrations: build.query<NewRegistrationsResponse, NewRegistrationsQueryArgs | void>({
        query: (args) => {
            const { groupBy = 'day', period, startDate, endDate } = args ?? {}; // Default groupBy to 'day'
            const dateParams = period && period !== 'last30days' ? { period, startDate, endDate } : {};
            return {
                url: API_ENDPOINTS.STATS_USERS_NEW_REGISTRATIONS,
                params: { groupBy, ...dateParams },
            };
        },
        providesTags: ["StatsUsers"],
    }),

    // Fetch Product Performance data - Accepts date range and groupBy args
    getProductPerformance: build.query<ProductPerformanceResponse, ProductPerformanceQueryArgs>({ // Removed void, groupBy is required
        query: (args) => {
            const { groupBy, period, startDate, endDate } = args;
            const dateParams = period && period !== 'last30days' ? { period, startDate, endDate } : {};
            return {
                url: API_ENDPOINTS.STATS_PRODUCTS_PERFORMANCE,
                params: { groupBy, ...dateParams },
            };
        },
        providesTags: ["StatsProductPerformance"],
    }),

     // Fetch Voucher Usage data - Accepts date range and specific args
    getVoucherUsage: build.query<VoucherUsageResponse, VoucherUsageQueryArgs | void>({
        query: (args) => {
            const { limit = 5, sortBy = 'usageCount', period, startDate, endDate } = args ?? {}; // Default limit 5, sort by count
            const dateParams = period && period !== 'last30days' ? { period, startDate, endDate } : {};
            return {
                url: API_ENDPOINTS.STATS_VOUCHERS_USAGE,
                params: { limit, sortBy, ...dateParams },
            };
        },
        providesTags: ["StatsVouchers"], // New tag
    }),

  }),
});

// Export hooks for the new stats queries
export const {
  useGetRevenueSummaryQuery,
  useGetOrderStatusStatsQuery,
  useGetTopSellingProductsQuery,
  useGetProductInventorySummaryQuery,
  useGetUserSummaryStatsQuery,
  useGetOrderTrendQuery,
  useGetReviewSummaryQuery,
  useGetNewRegistrationsQuery,
  useGetProductPerformanceQuery,
  useGetVoucherUsageQuery, // Export the new hook
  useGetRecentOrdersQuery, // Export the new hook
  useGetTopCustomersQuery, // Export the new hook
} = dashboardService;
