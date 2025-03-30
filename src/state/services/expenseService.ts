import { ExpenseByCategorySummary } from "@/types";
import { API_ENDPOINTS } from "@/lib/constants/api";
import { baseApi } from "./baseApi";

export const expenseService = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getExpensesByCategory: build.query<ExpenseByCategorySummary[], void>({
      query: () => API_ENDPOINTS.EXPENSES,
      providesTags: ["Expenses"],
    }),
  }),
});

export const { useGetExpensesByCategoryQuery } = expenseService;
