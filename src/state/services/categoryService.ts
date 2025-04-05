import { Category, NewCategory, ImportResult, PaginatedResponse } from "@/types"; // Import PaginatedResponse
import { API_ENDPOINTS } from "@/lib/constants/api";
import { baseApi } from "./baseApi";

// Remove local PaginatedCategoryResponse definition

// Define Query Args Type
interface GetCategoriesQueryArgs {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  // Add other filters if applicable
}

export const categoryService = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Update query to use generic PaginatedResponse<Category>
    getCategories: build.query<
      PaginatedResponse<Category>, // Use the generic type here
      GetCategoriesQueryArgs | void
    >({
      query: (params?) => ({
        url: API_ENDPOINTS.CATEGORIES,
        params: params || {}, // Pass params like page, limit, etc.
      }),
      // Update providesTags for paginated structure
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ // Add explicit type for id
                type: "Categories" as const,
                id,
              })),
              { type: "Categories", id: "LIST" },
            ]
          : [{ type: "Categories", id: "LIST" }],
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
        responseHandler: (response) => response.blob(), // For successful response
      }),
      // Add transformErrorResponse to handle non-serializable error data
      transformErrorResponse: (response: { status: number; data: any }) => {
        // Check if the error data is a Blob
        if (response.data instanceof Blob) {
          // Return a serializable error object instead of the Blob
          // You might try to read the Blob as text if it's expected to contain an error message,
          // but that's async and complex here. A simple message is safer.
          return {
            status: response.status,
            message: `Received non-serializable Blob data in error response (Type: ${response.data.type}, Size: ${response.data.size})`,
          };
        }
        // Otherwise, return the original error data (assuming it's serializable JSON)
        return response.data;
      },
      // Remove providesTags to prevent caching the Blob in Redux state
      // providesTags: [{ type: "Categories", id: "export" }],
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
      // Add transformErrorResponse here as well
      transformErrorResponse: (response: { status: number; data: any }) => {
        if (response.data instanceof Blob) {
          return {
            status: response.status,
            message: `Received non-serializable Blob data in error response (Type: ${response.data.type}, Size: ${response.data.size})`,
          };
        }
        return response.data;
      },
      // No providesTags needed for template download either
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
  // Explicitly export lazy query hooks
  useLazyExportCategoriesQuery,
  useLazyGetCategoryTemplateQuery,
} = categoryService;
