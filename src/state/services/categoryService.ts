import { Category, NewCategory, ImportResult } from "@/types";
import { API_ENDPOINTS } from "@/lib/constants/api";
import { baseApi } from "./baseApi";

export const categoryService = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCategories: build.query<Category[], { search?: string; sortBy?: string; sortOrder?: "asc" | "desc" } | void>({
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
    updateCategory: build.mutation<Category, { id: string; category: NewCategory }>({
      query: ({ id, category }) => ({
        url: `${API_ENDPOINTS.CATEGORIES}/${id}`,
        method: "PUT",
        body: category,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Categories", id }, "Categories"],
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
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useExportCategoriesQuery,
  useImportCategoriesMutation,
  useGetCategoryTemplateQuery,
} = categoryService;
