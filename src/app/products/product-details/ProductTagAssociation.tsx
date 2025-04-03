"use client";

import React, { useMemo } from 'react';
import { Product, Tag as TagType, NewProduct } from '@/types';
import { Select, Spin, Alert, notification, Space, Tag as AntTag } from 'antd';
import { useGetTagsQuery } from '@/state/services/tagService';
import { useUpdateProductMutation } from '@/state/api';

// Define props
interface ProductTagAssociationProps { // Renamed props
    selectedProduct: Product | null;
    isViewMode?: boolean; // Add isViewMode prop
}

// Renamed component
const ProductTagAssociation: React.FC<ProductTagAssociationProps> = ({ selectedProduct, isViewMode = false }) => {

    const { data: allTagsResponse, isLoading: isLoadingTags, isError: isTagsError } = useGetTagsQuery({
        limit: 9999, page: 1
    });

    const [updateProduct, { isLoading: isUpdatingTags }] = useUpdateProductMutation();

    const tagOptions = useMemo(() => {
        return allTagsResponse?.data?.map((tag: TagType) => ({
            label: tag.name,
            value: tag.id,
        })) ?? [];
    }, [allTagsResponse]);

    const associatedTagIds = useMemo(() => {
        return selectedProduct?.tags?.map((tag: TagType) => tag.id) ?? [];
    }, [selectedProduct]);

    const handleTagChange = async (selectedTagIds: string[]) => {
        if (!selectedProduct || isViewMode) return; // Prevent updates in view mode

        try {
            const updatePayload: NewProduct = {
                name: selectedProduct.name,
                sku: selectedProduct.sku,
                price: selectedProduct.price,
                categoryId: selectedProduct.categoryId,
                stock: selectedProduct.stock,
                shortDescription: selectedProduct.shortDescription,
                longDescription: selectedProduct.longDescription,
                discountPrice: selectedProduct.discountPrice,
                brandId: selectedProduct.brandId,
                active: selectedProduct.active,
                tags: selectedTagIds,
            };

            await updateProduct({
                id: selectedProduct.id,
                formData: updatePayload
            }).unwrap();
            notification.success({ message: "Tags updated successfully." });
        } catch (err: any) {
            console.error("Failed to update tags:", err);
            const errorMessage = err?.data?.message || err?.error || 'An unknown error occurred';
            notification.error({ message: "Error updating tags", description: errorMessage });
        }
    };

    if (!selectedProduct) {
        return <div className="p-4 text-center text-gray-500">No product selected.</div>;
    }

    if (isTagsError) {
        return <Alert message="Error loading tags" type="error" showIcon className="m-4"/>;
    }

    // Note: This component is now intended to be used *within* the ProductFormFields
    // or directly in the ProductDetailView's "Details" tab, replacing the previous
    // Form.Item for tags there. We'll adjust ProductFormFields next.
    // For now, just returning the Select component structure.

    return (
        <Spin spinning={isLoadingTags || isUpdatingTags}>
            <Select
                mode="multiple"
                allowClear
                style={{ width: '100%' }}
                placeholder="Select tags to associate"
                value={associatedTagIds}
                onChange={handleTagChange}
                options={tagOptions}
                loading={isLoadingTags}
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                disabled={isUpdatingTags || isViewMode} // Disable if updating or in view mode
            />
        </Spin>
    );
};

// Update export default
export default ProductTagAssociation;
