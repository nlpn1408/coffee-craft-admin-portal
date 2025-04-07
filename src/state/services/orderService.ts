import { baseApi } from "./baseApi";
import { Order, OrderStatus, OrderHistoryResponse } from "@/types"; // Import necessary types, added OrderHistoryResponse
import { API_ENDPOINTS } from "@/lib/constants/api"; // Correct constant name

// Define a type for the API response if it's nested (e.g., { data: Order[] })
// Adjust this based on your actual API response structure

export const orderService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Define the endpoint for getting orders
    getOrders: builder.query<
      { data: Order[]; total: number; limit: number; page: number },
      void
    >({
      // Use void if no query params needed
      query: () => ({
        url: API_ENDPOINTS.ORDERS,
        method: "GET",
      }),
      providesTags: ["Order"],
    }),
    // Get a single order by ID
    getOrderById: builder.query<Order, string>({
      // Expect single Order response
      query: (id) => ({
        url: `${API_ENDPOINTS.ORDERS}/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),

    // Update order status
    updateOrderStatus: builder.mutation<
      Order,
      { id: string; status: OrderStatus }
    >({
      query: ({ id, status }) => ({
        url: `${API_ENDPOINTS.ORDERS}/${id}/status`,
        method: "PUT",
        body: { status }, // Send status in the body
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Order", id }, // Invalidate the specific order
        "StatsRevenue",       // Invalidate revenue stats
        "StatsOrders",
        { type: 'OrderHistory', id }, // Invalidate history for this order
      ],
    }),

    // Cancel an order
    cancelOrder: builder.mutation<Order, string>({
      // Takes order ID as argument
      query: (id) => ({
        url: `${API_ENDPOINTS.ORDERS}/${id}/cancel`,
        method: "PUT", // Assuming PUT based on endpoint description
      }),
      invalidatesTags: (result, error, id) => [{ type: "Order", id }, { type: 'OrderHistory', id }], // Invalidate history
    }),

    // Get Order History
    getOrderHistory: builder.query<OrderHistoryResponse, string>({ // Takes orderId as string argument
      query: (orderId) => ({
        url: API_ENDPOINTS.ORDER_HISTORY(orderId), // Use function to generate URL
        method: 'GET',
      }),
      providesTags: (result, error, orderId) => [{ type: 'OrderHistory', id: orderId }], // Tag specific to order history
    }),
    // Optional: Create Order (if needed for admin)
    // createOrder: builder.mutation<Order, NewOrder>({
    //   query: (newOrder) => ({
    //     url: API_ENDPOINTS.ORDERS,
    //     method: 'POST',
    //     body: newOrder,
    //   }),
    //   invalidatesTags: [{ type: 'Order', id: 'LIST' }],
    // }),
  }),
  overrideExisting: false, // Set to true if you are overriding existing endpoints
});

// Export hooks for usage in components
export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
  useGetOrderHistoryQuery, // Export the new hook
  // useCreateOrderMutation, // Uncomment if implemented
} = orderService;
