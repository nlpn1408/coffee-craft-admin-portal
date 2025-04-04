import {
  RevenueSummary,
  OrderStatusStatsResponse,
  TopSellingProductsResponse,
  ProductInventorySummary,
  // Import other needed types from api.ts if endpoints are added later
} from "@/types/api";
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

  }),
});

// Export hooks for the new stats queries
export const {
  useGetRevenueSummaryQuery,
  useGetOrderStatusStatsQuery,
  useGetTopSellingProductsQuery,
  useGetProductInventorySummaryQuery,
} = dashboardService;
