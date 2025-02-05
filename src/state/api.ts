import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

export interface Product {
  productId: string;
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
}

export interface NewProduct {
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
}

export interface Category {
  id: string;
  name: string;
  description: number;
  createdAt: string;
  updatedAt: string;
}

export interface NewCategory {
  name: string;
  description: string;
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewSubcategory {
  name: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewBrand {
  name: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}
export interface SalesSummary {
  salesSummaryId: string;
  totalValue: number;
  changePercentage?: number;
  date: string;
}

export interface PurchaseSummary {
  purchaseSummaryId: string;
  totalPurchased: number;
  changePercentage?: number;
  date: string;
}

export interface ExpenseSummary {
  expenseSummaryId: string;
  totalExpenses: number;
  date: string;
}

export interface ExpenseByCategorySummary {
  expenseByCategorySummaryId: string;
  category: string;
  amount: string;
  date: string;
}

export interface DashboardMetrics {
  popularProducts: Product[];
  salesSummary: SalesSummary[];
  purchaseSummary: PurchaseSummary[];
  expenseSummary: ExpenseSummary[];
  expenseByCategorySummary: ExpenseByCategorySummary[];
}

export interface User {
  userId: string;
  name: string;
  email: string;
}

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL }),
  reducerPath: "api",
  tagTypes: [
    "DashboardMetrics",
    "Products",
    "Users",
    "Expenses",
    "Categories",
    "Subcategories",
    "Brands",
  ],
  endpoints: (build) => ({
    getDashboardMetrics: build.query<DashboardMetrics, void>({
      query: () => "/home",
      providesTags: ["DashboardMetrics"],
    }),
    getProducts: build.query<Product[], string | void>({
      query: (search) => ({
        url: "/products",
        params: search ? { search } : {},
      }),
      providesTags: ["Products"],
    }),
    createProduct: build.mutation<Product, NewProduct>({
      query: (newProduct) => ({
        url: "/products",
        method: "POST",
        body: newProduct,
      }),
      invalidatesTags: ["Products"],
    }),
    getUsers: build.query<User[], void>({
      query: () => "/users",
      providesTags: ["Users"],
    }),
    getExpensesByCategory: build.query<ExpenseByCategorySummary[], void>({
      query: () => "/expenses",
      providesTags: ["Expenses"],
    }),
    getCategories: build.query<Category[], string | void>({
      query: (search) => ({
        url: "/product-service/categories",
        params: search ? { search } : {},
      }),
      providesTags: ["Categories"],
    }),
    createCategory: build.mutation<Category, NewCategory>({
      query: (newCategory) => ({
        url: "/product-service/categories",
        method: "POST",
        body: newCategory,
      }),
      invalidatesTags: ["Categories"],
    }),
    getSubcategories: build.query<Subcategory[], string | void>({
      query: (search) => ({
        url: "/product-service/subcategories",
      }),
      providesTags: ["Subcategories"],
    }),
    createSubcategory: build.mutation<Subcategory, NewSubcategory>({
      query: (newSubcategory) => ({
        url: "/product-service/subcategories",
        method: "POST",
        body: newSubcategory,
      }),
      invalidatesTags: ["Subcategories"],
    }),
    getBrands: build.query<Brand[], string | void>({
      query: (search) => ({
        url: "/product-service/brands",
      }),
      providesTags: ["Brands"],
    }),
    createBrand: build.mutation<Brand, NewBrand>({
      query: (newBrand) => ({
        url: "/product-service/brands",
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
  useGetSubcategoriesQuery,
  useGetBrandsQuery,
  useCreateCategoryMutation,
  useCreateSubcategoryMutation,
  useCreateBrandMutation,
} = api;
