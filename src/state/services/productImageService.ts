import { NewProductImage } from "@/types";
import { API_ENDPOINTS } from "@/lib/constants/api";
import { baseApi } from "./baseApi";

export const productImageService = baseApi.injectEndpoints({
  endpoints: (build) => ({
    uploadProductImage: build.mutation<any, NewProductImage[] >({
      query: (body) => ({
        url: `${API_ENDPOINTS.PRODUCT_IMAGES}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["ProductImages"],
    }),
    getProductImages: build.query<any, { productId: string }>({
      query: (params) => ({
        url: `${API_ENDPOINTS.PRODUCT_IMAGES}`,
        method: "GET",
        params,
      }),
      providesTags: ["ProductImages"],
    }),
    // Allow partial updates for productImageData
    updateProductImage: build.mutation<any, { id: string; productImageData: Partial<NewProductImage> }>({
      query: ({ id, productImageData: body }) => ({
        url: `${API_ENDPOINTS.PRODUCT_IMAGES}/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "ProductImages", id }, "ProductImages"],
    }),
    deleteProductImage: build.mutation<void, string>({
      query: (id) => ({
        url: `${API_ENDPOINTS.PRODUCT_IMAGES}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ProductImages"],
    }),
  }),
});

export const {
  useUploadProductImageMutation,
  useGetProductImagesQuery,
  useUpdateProductImageMutation,
  useDeleteProductImageMutation,
} = productImageService;
