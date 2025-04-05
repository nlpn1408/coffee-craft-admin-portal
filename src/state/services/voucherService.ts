import { baseApi } from './baseApi';
import { Voucher, NewVoucher, UpdateVoucher } from '@/types';
import { API_ENDPOINTS } from '@/lib/constants/api';
import type { FilterValue } from "antd/es/table/interface"; // For query args

// Define a type for the paginated response
interface PaginatedVoucherResponse {
    data: Voucher[];
    total: number;
}

// Define query args type for getVouchers
interface GetVouchersQueryArgs {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    isActive?: boolean;
    // Add other potential filters like 'code' if needed
    filters?: Record<string, FilterValue | null>; // For potential code search/filter
}

export const voucherApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Query to get a list of vouchers
        getVouchers: builder.query<PaginatedVoucherResponse, GetVouchersQueryArgs>({
            query: (queryParams) => {
                const params: any = {
                    page: queryParams.page,
                    limit: queryParams.limit,
                    sortBy: queryParams.sortBy,
                    sortOrder: queryParams.sortOrder,
                    isActive: queryParams.isActive,
                    // Map potential code filter from Ant Table filters
                    code: queryParams.filters?.code?.[0] as string | undefined,
                };
                Object.keys(params).forEach(key => (params[key] === undefined || params[key] === null) && delete params[key]);
                return {
                    url: API_ENDPOINTS.VOUCHERS,
                    params,
                };
            },
            providesTags: (result) =>
                result?.data
                    ? [
                          ...result.data.map(({ id }) => ({ type: 'Vouchers' as const, id })),
                          { type: 'Vouchers', id: 'LIST' },
                      ]
                    : [{ type: 'Vouchers', id: 'LIST' }],
        }),

        // Query to get a single voucher by ID
        getVoucherById: builder.query<Voucher, string>({
            query: (id) => `${API_ENDPOINTS.VOUCHERS}/${id}`,
            providesTags: (result, error, id) => [{ type: 'Vouchers', id }],
        }),

         // Query to get a voucher by Code (public/customer use case, might not be needed in admin)
         getVoucherByCode: builder.query<Voucher, string>({
            query: (code) => `${API_ENDPOINTS.VOUCHERS}/code/${code}`,
            // No tags needed usually for one-off checks
        }),

        // Mutation to create a new voucher
        createVoucher: builder.mutation<Voucher, NewVoucher>({
            query: (newVoucher) => ({
                url: API_ENDPOINTS.VOUCHERS,
                method: 'POST',
                body: newVoucher,
            }),
            invalidatesTags: [{ type: 'Vouchers', id: 'LIST' }],
        }),

        // Mutation to update an existing voucher
        updateVoucher: builder.mutation<Voucher, { id: string } & UpdateVoucher>({
            query: ({ id, ...updateData }) => ({
                url: `${API_ENDPOINTS.VOUCHERS}/${id}`,
                method: 'PUT',
                body: updateData,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Vouchers', id }, { type: 'Vouchers', id: 'LIST' }],
        }),

        // Mutation to delete a voucher
        deleteVoucher: builder.mutation<void, string>({ // Returns 204 No Content
            query: (id) => ({
                url: `${API_ENDPOINTS.VOUCHERS}/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Vouchers', id }, { type: 'Vouchers', id: 'LIST' }],
        }),
    }),
    overrideExisting: false,
});

// Export hooks for usage in components
export const {
    useGetVouchersQuery,
    useGetVoucherByIdQuery,
    useGetVoucherByCodeQuery, // Export if needed
    useCreateVoucherMutation,
    useUpdateVoucherMutation,
    useDeleteVoucherMutation,
} = voucherApi;
