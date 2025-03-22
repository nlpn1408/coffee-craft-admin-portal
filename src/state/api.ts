import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  Brand,
  Category,
  DashboardMetrics,
  ExpenseByCategorySummary,
  ImportResult,
  NewBrand,
  NewCategory,
  NewProduct,
  Product,
  User,
} from "@/types";
import { API_ENDPOINTS } from "@/lib/constants/api";

// Auth header configuration
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    // headers.set("Content-Type", "application/json");
    return headers;
  },
});

export const api = createApi({
  baseQuery: baseQueryWithAuth,
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
    // Dashboard endpoints
    getDashboardMetrics: build.query<DashboardMetrics, void>({
      query: () => API_ENDPOINTS.DASHBOARD,
      providesTags: ["DashboardMetrics"],
    }),

    // Product endpoints
    getProducts: build.query<
      Product[],
      {
        search?: string;
        categoryId?: string;
        brandId?: string;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
      }
    >({
      query: (params) => ({
        url: API_ENDPOINTS.PRODUCTS,
        params,
      }),
      providesTags: ["Products"],
    }),
    getProduct: build.query<Product, string>({
      query: (id) => `${API_ENDPOINTS.PRODUCTS}/${id}`,
      providesTags: (result, error, id) => [{ type: "Products", id }],
    }),
    createProduct: build.mutation<Product, NewProduct>({
      query: (formData) => ({
        url: API_ENDPOINTS.PRODUCTS,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Products"],
    }),
    updateProduct: build.mutation<
      Product,
      { id: string; formData: NewProduct }
    >({
      query: ({ id, formData }) => ({
        url: `${API_ENDPOINTS.PRODUCTS}/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Products", id },
        "Products",
      ],
    }),
    deleteProduct: build.mutation<void, string>({
      query: (id) => ({
        url: `${API_ENDPOINTS.PRODUCTS}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),

    // User endpoints
    getUsers: build.query<User[], void>({
      query: () => API_ENDPOINTS.USERS,
      providesTags: ["Users"],
    }),
    getUser: build.query<User, string>({
      query: (id) => `${API_ENDPOINTS.USERS}/${id}`,
      providesTags: (result, error, id) => [{ type: "Users", id }],
    }),

    // Expense endpoints
    getExpensesByCategory: build.query<ExpenseByCategorySummary[], void>({
      query: () => API_ENDPOINTS.EXPENSES,
      providesTags: ["Expenses"],
    }),

    // Category endpoints
    getCategories: build.query<
      Category[],
      { search?: string; sortBy?: string; sortOrder?: "asc" | "desc" } | void
    >({
      query: (params?) => ({
        url: API_ENDPOINTS.CATEGORIES,
        params: params || {},
      }),
      providesTags: ["Categories"],
    }),
    getCategory: build.query<Category, string>({
      query: (id) => `${API_ENDPOINTS.CATEGORIES}/${id}`,
      providesTags: (result, error, id) => [{ type: "Categories", id }],
    }),
    createCategory: build.mutation<Category, NewCategory>({
      query: (newCategory) => ({
        url: API_ENDPOINTS.CATEGORIES,
        method: "POST",
        body: newCategory,
      }),
      invalidatesTags: ["Categories"],
    }),
    updateCategory: build.mutation<
      Category,
      { id: string; category: NewCategory }
    >({
      query: ({ id, category }) => ({
        url: `${API_ENDPOINTS.CATEGORIES}/${id}`,
        method: "PUT",
        body: category,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Categories", id },
        "Categories",
      ],
    }),
    deleteCategory: build.mutation<void, string>({
      query: (id) => ({
        url: `${API_ENDPOINTS.CATEGORIES}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Categories"],
    }),
    exportCategories: build.query<Blob, void>({
      query: () => ({
        url: API_ENDPOINTS.EXPORT_CATEGORIES,
        responseHandler: (response) => response.blob(),
      }),
    }),
    importCategories: build.mutation<ImportResult, FormData>({
      query: (formData) => ({
        url: API_ENDPOINTS.IMPORT_CATEGORIES,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Categories"],
    }),
    getCategoryTemplate: build.query<Blob, void>({
      query: () => ({
        url: API_ENDPOINTS.CATEGORY_TEMPLATE,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Brand endpoints
    getBrands: build.query<
      Brand[],
      { search?: string; sortBy?: string; sortOrder?: "asc" | "desc" } | void
    >({
      query: (params) => ({
        url: API_ENDPOINTS.BRANDS,
        params: params || {},
      }),
      providesTags: ["Brands"],
    }),
    getBrand: build.query<Brand, string>({
      query: (id) => `${API_ENDPOINTS.BRANDS}/${id}`,
      providesTags: (result, error, id) => [{ type: "Brands", id }],
    }),
    createBrand: build.mutation<Brand, NewBrand>({
      query: (newBrand) => ({
        url: API_ENDPOINTS.BRANDS,
        method: "POST",
        body: newBrand,
      }),
      invalidatesTags: ["Brands"],
    }),
    updateBrand: build.mutation<Brand, { id: string; brand: NewBrand }>({
      query: ({ id, brand }) => ({
        url: `${API_ENDPOINTS.BRANDS}/${id}`,
        method: "PUT",
        body: brand,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Brands", id },
        "Brands",
      ],
    }),
    deleteBrand: build.mutation<void, string>({
      query: (id) => ({
        url: `${API_ENDPOINTS.BRANDS}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Brands"],
    }),
    exportBrands: build.query<Blob, void>({
      query: () => ({
        url: API_ENDPOINTS.EXPORT_BRANDS,
        responseHandler: (response) => response.blob(),
      }),
    }),
    importBrands: build.mutation<ImportResult, FormData>({
      query: (formData) => ({
        url: API_ENDPOINTS.IMPORT_BRANDS,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Brands"],
    }),
    getBrandTemplate: build.query<Blob, void>({
      query: () => ({
        url: API_ENDPOINTS.BRAND_TEMPLATE,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

// Export hooks for usage in components
export const {
  // Dashboard hooks
  useGetDashboardMetricsQuery,

  // Product hooks
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,

  // User hooks
  useGetUsersQuery,
  useGetUserQuery,

  // Expense hooks
  useGetExpensesByCategoryQuery,

  // Category hooks
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useExportCategoriesQuery,
  useImportCategoriesMutation,
  useGetCategoryTemplateQuery,

  // Brand hooks
  useGetBrandsQuery,
  useGetBrandQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  useExportBrandsQuery,
  useImportBrandsMutation,
  useGetBrandTemplateQuery,
} = api;
