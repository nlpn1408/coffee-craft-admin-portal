import { User, NewUser, PaginatedResponse } from "@/types"; // Import PaginatedResponse
import { API_ENDPOINTS } from "@/lib/constants/api";
import { baseApi } from "./baseApi";
import type { FilterValue } from "antd/es/table/interface"; // Import FilterValue

// Define Query Args Type
interface GetUsersQueryArgs {
  page?: number;
  limit?: number;
  search?: string; // Assuming API supports search
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  role?: string; // Example filter
  isActive?: boolean; // Example filter
  filters?: Record<string, FilterValue | null>; // For Ant Table filters
}

export const userService = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Update query to use PaginatedResponse<User> and args type
    getUsers: build.query<PaginatedResponse<User>, GetUsersQueryArgs | void>({
      query: (queryParams?) => {
        const params: any = {
          page: queryParams?.page,
          limit: queryParams?.limit,
          search:
            queryParams?.search ??
            (queryParams?.filters?.name?.[0] as string | undefined), // Allow direct search or filter
          sortBy: queryParams?.sortBy,
          sortOrder: queryParams?.sortOrder,
          role:
            queryParams?.role ??
            (queryParams?.filters?.role?.[0] as string | undefined),
          isActive:
            queryParams?.isActive ??
            (queryParams?.filters?.isActive?.[0] as boolean | undefined),
        };
        Object.keys(params).forEach(
          (key) =>
            (params[key] === undefined || params[key] === null) &&
            delete params[key]
        );
        return {
          url: API_ENDPOINTS.USERS,
          params,
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Users" as const, id })),
              { type: "Users", id: "LIST" },
            ]
          : [{ type: "Users", id: "LIST" }],
    }),
    getUser: build.query<User, string>({
      query: (id) => `${API_ENDPOINTS.USERS}/${id}`,
      providesTags: (result, error, id) => [{ type: "Users", id }],
    }),
    createUser: build.mutation<User, NewUser>({
      query: (newUser) => ({
        url: API_ENDPOINTS.USERS,
        method: "POST",
        body: newUser,
      }),
      invalidatesTags: ["Users"],
    }),
    updateUser: build.mutation<User, Partial<NewUser> & { id: string }>({
      query: ({ id, ...patch }) => ({
        url: `${API_ENDPOINTS.USERS}/${id}`,
        method: "PUT", // Or PATCH if your API supports it
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ], // Invalidate list too
    }),
    deleteUser: build.mutation<void, string>({
      query: (id) => ({
        url: `${API_ENDPOINTS.USERS}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ], // Invalidate list too
    }),
    // Add bulk delete if API supports it
    // deleteUsers: build.mutation<void, string[]>({
    //   query: (ids) => ({
    //     url: API_ENDPOINTS.USERS, // Adjust endpoint if needed
    //     method: "DELETE",
    //     body: { ids }, // Or however your API expects bulk delete IDs
    //   }),
    //   invalidatesTags: ["Users"],
    // }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  // useDeleteUsersMutation, // Export if added
} = userService;
