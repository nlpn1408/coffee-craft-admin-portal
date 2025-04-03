import { baseApi } from './baseApi';
import { ProductVariant, NewProductVariant, UpdateProductVariant } from '@/types'; // Assuming ProductVariant is in index.ts
import { API_ENDPOINTS } from '@/lib/constants/api'; // Assuming API endpoints are defined here

// Define a service using a base API setup
export const productVariantApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Query to get variants for a specific product
        getProductVariants: builder.query<ProductVariant[], string>({
            query: (productId) => `${API_ENDPOINTS.PRODUCTS}/${productId}/variants`,
            providesTags: (result, error, productId) =>
                result
                    ? [
                          ...result.map(({ id }) => ({ type: 'ProductVariant' as const, id })),
                          { type: 'ProductVariant', id: 'LIST', productId }, // Tag for the list associated with the product
                      ]
                    : [{ type: 'ProductVariant', id: 'LIST', productId }],
        }),

        // Mutation to create a new product variant (POST /products/:productId/variants)
        // Argument now includes productId for the URL, body is the rest
        createProductVariant: builder.mutation<ProductVariant, { productId: string } & NewProductVariant>({
            query: ({ productId, ...newVariantData }) => ({
                url: `${API_ENDPOINTS.PRODUCTS}/${productId}/variants`,
                method: 'POST',
                body: newVariantData, // Send only variant data in body
            }),
            // Invalidate the list tag for the specific product
            invalidatesTags: (result, error, { productId }) => [{ type: 'ProductVariant', id: 'LIST', productId }],
        }),

        // Mutation to update an existing product variant (PUT /products/:productId/variants/:variantId)
        // Argument needs productId, variantId (id), and updateData
        updateProductVariant: builder.mutation<ProductVariant, { productId: string; id: string } & UpdateProductVariant>({
            query: ({ productId, id, ...updateData }) => ({
                url: `${API_ENDPOINTS.PRODUCTS}/${productId}/variants/${id}`,
                method: 'PUT', // Use PUT as per docs
                body: updateData,
            }),
            // Invalidate the specific variant tag and the list tag for its product
            invalidatesTags: (result, error, { id, productId }) => [
                { type: 'ProductVariant', id },
                { type: 'ProductVariant', id: 'LIST', productId },
            ],
        }),

        // Mutation to delete a product variant (DELETE /products/:productId/variants/:variantId)
        // Argument needs productId and variantId (id)
        // API returns 204 No Content, so the return type is void
        deleteProductVariant: builder.mutation<void, { productId: string; id: string }>({
            query: ({ productId, id }) => ({
                url: `${API_ENDPOINTS.PRODUCTS}/${productId}/variants/${id}`,
                method: 'DELETE',
            }),
             // Invalidate based on arguments since there's no result body
             invalidatesTags: (result, error, { id, productId }) => [
                { type: 'ProductVariant', id },
                { type: 'ProductVariant', id: 'LIST', productId },
            ],
        }),

        // Removed deleteBulkProductVariants as it's not in the provided API docs
    }),
    overrideExisting: false,
});

// Export hooks for usage in components
// Note: useDeleteBulkProductVariantsMutation is removed
export const {
    useGetProductVariantsQuery,
    useCreateProductVariantMutation,
    useUpdateProductVariantMutation,
    useDeleteProductVariantMutation,
} = productVariantApi;
