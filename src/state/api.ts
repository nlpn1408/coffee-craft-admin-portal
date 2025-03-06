import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import {
  Brand,
  Category,
  DashboardMetrics,
  ExpenseByCategorySummary,
  ExpenseSummary,
  NewBrand,
  NewCategory,
  NewProduct,
  NewSubcategory,
  Product,
  PurchaseSummary,
  SalesSummary,
  User,
} from "@/types";
import { API_ENDPOINTS } from "@/lib/constants/api";

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL }),
  reducerPath: "api",
  tagTypes: [
    "DashboardMetrics",
    "Products",
    "Users",
    "Expenses",
    "Categories",
    "Brands",
  ],
  endpoints: (build) => ({
    getDashboardMetrics: build.query<DashboardMetrics, void>({
      query: () => API_ENDPOINTS.DASHBOARD,
      providesTags: ["DashboardMetrics"],
    }),
    getProducts: build.query<Product[], string | void>({
      query: (search) => ({
        url: API_ENDPOINTS.PRODUCTS,
        params: search ? { search } : {},
      }),
      providesTags: ["Products"],
    }),
    createProduct: build.mutation<Product, NewProduct>({
      query: (newProduct) => ({
        url: API_ENDPOINTS.PRODUCTS,
        method: "POST",
        body: newProduct,
      }),
      invalidatesTags: ["Products"],
    }),
    getUsers: build.query<User[], void>({
      query: () => API_ENDPOINTS.USERS,
      providesTags: ["Users"],
    }),
    getExpensesByCategory: build.query<ExpenseByCategorySummary[], void>({
      query: () => API_ENDPOINTS.EXPENSES,
      providesTags: ["Expenses"],
    }),
    getCategories: build.query<Category[], string | void>({
      query: (search) => ({
        url: API_ENDPOINTS.CATEGORIES,
        params: search ? { search } : {},
      }),
      providesTags: ["Categories"],
    }),
    createCategory: build.mutation<Category, NewCategory>({
      query: (newCategory) => ({
        url: API_ENDPOINTS.CATEGORIES,
        method: "POST",
        body: newCategory,
      }),
      invalidatesTags: ["Categories"],
    }),
    getBrands: build.query<Brand[], string | void>({
      query: (search) => ({
        url: API_ENDPOINTS.BRANDS,
      }),
      providesTags: ["Brands"],
    }),
    createBrand: build.mutation<Brand, NewBrand>({
      query: (newBrand) => ({
        url: API_ENDPOINTS.BRANDS,
        method: "POST",
        body: newBrand,
      }),
      invalidatesTags: ["Brands"],
    }),
  }),
});

export const {
  useGetDashboardMetricsQuery,
  useGetProductsQuery,
  useCreateProductMutation,
  useGetUsersQuery,
  useGetExpensesByCategoryQuery,
  useGetCategoriesQuery,
  useGetBrandsQuery,
  useCreateCategoryMutation,
  useCreateBrandMutation,
} = api;
