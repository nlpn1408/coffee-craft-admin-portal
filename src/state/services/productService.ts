import { Product, NewProduct, ImportResult } from "@/types";
import { API_ENDPOINTS } from "@/lib/constants/api";
import { baseApi } from "./baseApi";
import type { FilterValue } from "antd/es/table/interface"; // Import FilterValue

// Define the query argument type matching the state structure (outside endpoints)
type GetProductsQueryParams = {
    page: number;
    limit: number;
    sortField?: string;
    sortOrder?: "ascend" | "descend";
    filters: Record<string, FilterValue | null>;
};

export const productService = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query<{ data: Product[]; total: number }, GetProductsQueryParams>({
      query: (queryParams) => {
          // Map the queryParams state to the actual API parameters
          const params: any = { // Use 'any' temporarily for easier key deletion
              page: queryParams.page,
              limit: queryParams.limit,
              search: queryParams.filters?.name?.[0] as string | undefined,
              categoryId: queryParams.filters?.categoryId?.join(",") as string | undefined,
              brandId: queryParams.filters?.brandId?.[0] as string | undefined,
              sortBy: queryParams.sortField,
              sortOrder: queryParams.sortOrder === "ascend" ? "asc" : queryParams.sortOrder === "descend" ? "desc" : undefined,
              active: queryParams.filters?.active?.[0] as boolean | undefined,
          };
          // Remove undefined/null params before sending
          Object.keys(params).forEach(key => (params[key] === undefined || params[key] === null) && delete params[key]);

          return {
              url: API_ENDPOINTS.PRODUCTS,
              params,
          };
      },
      providesTags: [{ type: "Products", id: "LIST" }],
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
        { type: "Products", id: "LIST" }, // Ensure list is invalidated too
        { type: "Tags", id: "LIST" }, // Add this to invalidate the tags list
      ],
    }),
    deleteProduct: build.mutation<void, string>({
      query: (id) => ({
        url: `${API_ENDPOINTS.PRODUCTS}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),
    // Export Products
    exportProducts: build.query<Blob, void>({
      query: () => ({
        url: API_ENDPOINTS.EXPORT_PRODUCTS,
        responseHandler: (response) => response.blob(),
      }),
      transformErrorResponse: (response: { status: number; data: any }) => {
        if (response.data instanceof Blob) {
          return {
            status: response.status,
            message: `Received non-serializable Blob data in error response (Type: ${response.data.type}, Size: ${response.data.size})`,
          };
        }
        return response.data;
      },
      // No providesTags
    }),
    // Import Products
    importProducts: build.mutation<ImportResult, FormData>({
      // Assuming ImportResult type exists
      query: (formData) => ({
        url: API_ENDPOINTS.IMPORT_PRODUCTS,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Products"], // Invalidate product list on successful import
    }),
    // Get Product Template
    getProductTemplate: build.query<Blob, void>({
      query: () => ({
        url: API_ENDPOINTS.PRODUCT_TEMPLATE,
        responseHandler: (response) => response.blob(),
      }),
      transformErrorResponse: (response: { status: number; data: any }) => {
        if (response.data instanceof Blob) {
          return {
            status: response.status,
            message: `Received non-serializable Blob data in error response (Type: ${response.data.type}, Size: ${response.data.size})`,
          };
        }
        return response.data;
      },
      // No providesTags
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  // Export new hooks
  useExportProductsQuery,
  useImportProductsMutation,
  useGetProductTemplateQuery,
  // Export lazy hooks for on-demand actions
  useLazyExportProductsQuery,
  useLazyGetProductTemplateQuery,
} = productService;
