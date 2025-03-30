import { DashboardMetrics } from "@/types";
import { API_ENDPOINTS } from "@/lib/constants/api";
import { baseApi } from "./baseApi";

export const dashboardService = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboardMetrics: build.query<DashboardMetrics, void>({
      query: () => API_ENDPOINTS.DASHBOARD,
      providesTags: ["DashboardMetrics"],
    }),
  }),
});

export const { useGetDashboardMetricsQuery } = dashboardService;
