"use client";

import React, { useMemo } from 'react';
import { Product, Tag as TagType, NewProduct } from '@/types'; // Import NewProduct
import { Select, Spin, Alert, notification, Space, Tag as AntTag } from 'antd';
import { useGetTagsQuery } from '@/state/services/tagService';
// Assume this hook exists for updating product-tag associations
import { useUpdateProductMutation } from '@/state/api'; // Using the general update product for now

// Define props
interface TagTabProps {
    selectedProduct: Product | null;
}

const TagTab: React.FC<TagTabProps> = ({ selectedProduct }) => {

    // Fetch all available tags for the Select options
    const { data: allTagsResponse, isLoading: isLoadingTags, isError: isTagsError } = useGetTagsQuery({
        // Add params if needed to fetch ALL tags, e.g., limit: 9999
        limit: 9999, page: 1 // Example: Fetch a large number
    });

    // Assume useUpdateProductMutation can handle updating tags via a 'tagIds' array
    const [updateProduct, { isLoading: isUpdatingTags }] = useUpdateProductMutation();

    // Memoize options for the Select component
    const tagOptions = useMemo(() => {
        return allTagsResponse?.data?.map((tag: TagType) => ({
            label: tag.name,
            value: tag.id,
        })) ?? [];
    }, [allTagsResponse]);

    // Get the IDs of currently associated tags
    const associatedTagIds = useMemo(() => {
        return selectedProduct?.tags?.map((tag: TagType) => tag.id) ?? [];
    }, [selectedProduct]);

    const handleTagChange = async (selectedTagIds: string[]) => {
        if (!selectedProduct) return;

        try {
            // Call the mutation to update the product with the new list of tag IDs
            // depending on how the mutation is defined. Use 'tags' key as per NewProduct type.
            // Construct the full formData expected by the mutation, merging existing data with new tags
            const updatePayload: NewProduct = {
                // Spread existing product data (ensure it matches NewProduct fields)
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
                // Overwrite with the new tags array
                tags: selectedTagIds,
            };

            await updateProduct({
                id: selectedProduct.id,
                formData: updatePayload
            }).unwrap();
            notification.success({ message: "Tags updated successfully." });
            // Product data should refetch automatically due to cache invalidation
            // defined in the updateProduct mutation (assuming it invalidates 'Products' tag)
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

    return (
        <div className="p-4 space-y-4">
            <h3 className="text-lg font-semibold">Manage Associated Tags</h3>
            <Spin spinning={isLoadingTags || isUpdatingTags}>
                 {/* Display current tags (optional, as Select shows them) */}
                 {/* <div className="mb-4">
                     <span className="font-medium mr-2">Current Tags:</span>
                     <Space size={[0, 8]} wrap>
                         {selectedProduct.tags?.map((tag: TagType) => (
                             <AntTag key={tag.id} color="blue">
                                 {tag.name}
                             </AntTag>
                         ))}
                         {(!selectedProduct.tags || selectedProduct.tags.length === 0) && <span>None</span>}
                     </Space>
                 </div> */}

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
                    disabled={isUpdatingTags}
                />
            </Spin>
             {/* TODO: Add UI for creating new tags globally if needed */}
        </div>
    );
};

export default TagTab;
