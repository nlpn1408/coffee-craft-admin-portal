import { Brand, NewBrand, ImportResult } from "@/types";
import { API_ENDPOINTS } from "@/lib/constants/api";
import { baseApi } from "./baseApi";

interface PaginatedBrandResponse {
  data: Brand[];
  total: number;
}

// Define Query Args Type
interface GetBrandsQueryArgs {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  // Add other filters if applicable
}

export const brandService = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getBrands: build.query<PaginatedBrandResponse, GetBrandsQueryArgs | void>({
      query: (params) => ({
        url: API_ENDPOINTS.BRANDS,
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Brands" as const,
                id,
              })),
              { type: "Brands", id: "LIST" },
            ]
          : [{ type: "Brands", id: "LIST" }],
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
      // Add transformErrorResponse
      transformErrorResponse: (response: { status: number; data: any }) => {
        if (response.data instanceof Blob) {
          return {
            status: response.status,
            message: `Received non-serializable Blob data in error response (Type: ${response.data.type}, Size: ${response.data.size})`,
          };
        }
        return response.data;
      },
      providesTags: [{ type: "Brands", id: "export" }],
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
      // Add transformErrorResponse
      transformErrorResponse: (response: { status: number; data: any }) => {
        if (response.data instanceof Blob) {
          return {
            status: response.status,
            message: `Received non-serializable Blob data in error response (Type: ${response.data.type}, Size: ${response.data.size})`,
          };
        }
        return response.data;
      },
    }),
  }),
});

export const {
  useGetBrandsQuery,
  useGetBrandQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  useExportBrandsQuery,
  useImportBrandsMutation,
  useGetBrandTemplateQuery,
  // Export lazy hooks
  useLazyExportBrandsQuery,
  useLazyGetBrandTemplateQuery,
} = brandService;
