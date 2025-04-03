import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  credentials: "include",
});

export const baseApi = createApi({
  baseQuery: baseQueryWithAuth,
  endpoints: () => ({}),
  tagTypes: [
    "DashboardMetrics",
    "Products",
    "Users",
    "Expenses",
    "Categories",
    "Brands",
    "ProductImages",
    "Order",
    "Tags",
  ],
});
