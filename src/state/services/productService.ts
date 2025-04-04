import { Product, NewProduct } from "@/types";
import { API_ENDPOINTS } from "@/lib/constants/api";
import { baseApi } from "./baseApi";

export const productService = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query<
      { data: Product[]; total: number },
      {
        search?: string;
        categoryId?: string;
        brandId?: string;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
        active?: boolean; // Add the active filter parameter
      }
    >({
      query: (params) => ({
        url: API_ENDPOINTS.PRODUCTS,
        params,
      }),
      providesTags: [{type: "Products", id: "LIST"}],
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
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productService;
