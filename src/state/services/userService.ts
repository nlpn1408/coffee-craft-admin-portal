import { User } from "@/types";
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
  }),
});

export const { useGetUsersQuery, useGetUserQuery } = userService;
