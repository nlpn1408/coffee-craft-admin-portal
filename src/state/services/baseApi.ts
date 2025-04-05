import {
  BaseQueryFn,
  FetchArgs,
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
// Removed message import
import { handleUnauthorized } from "@/contexts/AuthContext"; // Import the handler

// Original base query setup
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  prepareHeaders(headers, { getState }) {
    // If you were using token-based auth, you'd get the token here
    // const token = (getState() as RootState).auth.token;
    // if (token) {
    //   headers.set('authorization', `Bearer ${token}`)
    // }
    return headers;
  },
  credentials: "include", // Important for sending/receiving cookies
});

// Wrapper to handle 401 errors
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // Check for 401 Unauthorized error
  if (result.error && result.error.status === 401) {
    // Call the centralized handler from AuthContext
    // This handler should manage clearing state/storage and redirection
    handleUnauthorized();

    // It's often best to still return the original error so the calling hook/component
    // knows the request failed, even though a redirect is happening.
    // Alternatively, return a specific marker error if needed.
    // return { error: { status: 'CUSTOM_ERROR', error: 'Logged out due to 401' } };
  }

  return result; // Return the original result (including the 401 error if applicable)
};


export const baseApi = createApi({
  baseQuery: baseQueryWithReauth, // Use the wrapped query
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
    "ProductVariant",
    "Blogs",
    "Vouchers", // Add Vouchers tag type
    // Statistics Tags
    "StatsRevenue",
    "StatsOrders",
    "StatsProducts",
    "StatsInventory",
  ],
});
