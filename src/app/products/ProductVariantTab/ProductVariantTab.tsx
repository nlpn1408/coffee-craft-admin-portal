'use client';

import React, { useState } from 'react';
import { notification } from 'antd'; // Import notification
import { GenericDataTable } from '@/components/GenericDataTable/GenericDataTable';
import { useVariantTableColumns } from './useVariantTableColumns';
import {
    useGetProductVariantsQuery,
    useDeleteProductVariantMutation,
    // useDeleteBulkProductVariantsMutation, // Removed bulk delete hook
} from '@/state/services/productVariantService';
import CreateEditVariantModal from './CreateEditVariantModal';
import { Product, ProductVariant } from '@/types';
import { Button } from 'antd'; // Import Ant Button

interface ProductVariantTabProps {
    selectedProduct: Product | null;
    isViewMode?: boolean; // Add isViewMode prop
}

const ProductVariantTab: React.FC<ProductVariantTabProps> = ({ selectedProduct, isViewMode = false }) => { // Destructure isViewMode
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

    // --- Data Fetching ---
    const {
        data: variants, // Rename data to variants for clarity
        isLoading: isVariantsLoading, // Rename isLoading
        isError: isVariantsError, // Rename isError
        refetch: refetchVariants, // Rename refetch
    } = useGetProductVariantsQuery(selectedProduct?.id!, {
        skip: !selectedProduct?.id,
    });

    // --- Mutations ---
    const [deleteVariant, { isLoading: isDeletingSingle }] = useDeleteProductVariantMutation();
    // Removed bulk delete mutation hook

    // --- Delete Handlers ---
    const handleDeleteSingle = async (variantId: string) => {
        if (!selectedProduct) return; // Guard clause if product is somehow null

        try {
            // Pass productId and variantId (id)
            await deleteVariant({ productId: selectedProduct.id, id: variantId }).unwrap();
            notification.success({ message: 'Success', description: 'Variant deleted successfully.' });
            // Note: RTK Query cache invalidation should handle refetching.
        } catch (err: any) {
            console.error('Failed to delete variant:', err);
            const errorMessage = err?.data?.message || err?.error || 'An unknown error occurred';
            notification.error({ message: 'Error', description: `Failed to delete variant: ${errorMessage}` });
        }
    };

    // Removed handleDeleteBulk as API doesn't support it

    // --- Columns Definition ---
    // Pass the actual delete handler and isViewMode to the columns hook
    const columns = useVariantTableColumns({
        onEdit: (variant) => {
            setSelectedVariant(variant);
            setIsModalOpen(true);
        },
        onDelete: handleDeleteSingle,
        isViewMode: isViewMode, // Pass down isViewMode
    });

    // --- Modal Handlers ---
    const handleOpenCreateModal = () => {
        setSelectedVariant(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedVariant(null);
        refetchVariants(); // Use renamed refetch function
    };

    if (!selectedProduct) {
        return <div className="p-4 text-center text-gray-500">Please select a product first.</div>;
    }

    return (
        <div className="p-4 space-y-4">
             {/* Add Variant Button - Conditionally render or disable */}
             {!isViewMode && (
                 <div className="flex justify-end">
                     <Button onClick={handleOpenCreateModal}>Add Variant</Button>
                 </div>
             )}
            {isModalOpen && selectedProduct && (
                 <CreateEditVariantModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    variant={selectedVariant}
                    productId={selectedProduct.id} // Pass the selected product ID
                 />
            )}
            <GenericDataTable<ProductVariant> // Specify the generic type
                dataSource={variants || []} // Use dataSource prop
                columns={columns}
                loading={isVariantsLoading}
                entityName="Variant"
                onCreate={handleOpenCreateModal}
                // Removed onDeleteSelected and isDeleting props
                // Pass single delete loading state if ActionColumn needs it
                isActionLoading={isDeletingSingle}
                rowKey="id"
            />
        </div>
    );
};

export default ProductVariantTab;
