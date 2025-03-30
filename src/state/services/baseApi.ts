import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
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
  ],
});
