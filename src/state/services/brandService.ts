import { Brand, NewBrand, ImportResult } from "@/types";
import { API_ENDPOINTS } from "@/lib/constants/api";
import { baseApi } from "./baseApi";

export const brandService = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getBrands: build.query<Brand[], { search?: string; sortBy?: string; sortOrder?: "asc" | "desc" } | void>({
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
      invalidatesTags: (result, error, { id }) => [{ type: "Brands", id }, "Brands"],
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

export const {
  useGetBrandsQuery,
  useGetBrandQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  useExportBrandsQuery,
  useImportBrandsMutation,
  useGetBrandTemplateQuery,
} = brandService;
