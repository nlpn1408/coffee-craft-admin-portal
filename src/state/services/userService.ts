import { User, NewUser } from "@/types"; // Import NewUser
import { API_ENDPOINTS } from "@/lib/constants/api";
import { baseApi } from "./baseApi";

export const userService = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query<User[], void>({
      query: () => API_ENDPOINTS.USERS,
      providesTags: ["Users"],
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
      invalidatesTags: (result, error, { id }) => [{ type: "Users", id }, "Users"],
    }),
    deleteUser: build.mutation<void, string>({
      query: (id) => ({
        url: `${API_ENDPOINTS.USERS}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
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
