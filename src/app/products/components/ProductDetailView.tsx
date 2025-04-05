'use client';

import React, { useEffect } from 'react';
import { Drawer, Tabs, Button, Form, Spin, notification, Space } from 'antd';
import type { TabsProps } from 'antd';
import { Product, NewProduct } from '@/types';
// Use absolute path aliases
import ProductVariantManager from '@/app/products/product-details/ProductVariantManager';
import ProductImageManager from '@/app/products/product-details/ProductImageManager';
import ProductReviewsTab from '@/app/products/product-details/ProductReviewsTab';
import { ProductFormFields } from '@/app/products/components/ProductFormFields';
import { useCreateProductMutation, useUpdateProductMutation, useGetProductQuery } from '@/state/api';
import { handleApiError } from '@/lib/api-utils';

type DrawerMode = 'create' | 'edit' | 'view';

interface ProductDetailViewProps {
    product: Product | null; // Null when creating
    mode: DrawerMode;
    onClose: () => void;
    onSaveSuccess: () => void; // Callback after successful save
}

const ProductDetailView: React.FC<ProductDetailViewProps> = ({
    product,
    mode,
    onClose,
    onSaveSuccess,
}) => {
    const [form] = Form.useForm<NewProduct>();
    const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
    const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

    // Fetch detailed product data for edit/view modes
    const productIdToFetch = (mode === 'edit' || mode === 'view') ? product?.id : undefined;
    const { data: detailedProductData, isLoading: isLoadingDetails, isError: isDetailsError } = useGetProductQuery(
        productIdToFetch!, // Use non-null assertion as skip handles undefined
        { skip: !productIdToFetch } // Skip if no ID or in create mode
    );

    // Combine loading states
    const isSaving = isCreating || isUpdating;
    const isLoading = (isLoadingDetails && mode !== 'create') || isSaving; // Loading if fetching details OR saving
    const isViewMode = mode === 'view';

    // Determine which product data to use (fetched or initial prop)
    const currentProductData = mode === 'create' ? null : (detailedProductData || product);

    // Set form values when data is available or mode changes
    useEffect(() => {
        if (mode === 'create') {
            form.resetFields();
        } else if (currentProductData) { // Use fetched/prop data
            form.setFieldsValue({
                ...currentProductData,
                // Ensure tags are just IDs if the form field expects that
                tags: currentProductData.tags?.map(tag => tag.name) ?? [],
                // Removed incorrect publicationDate conversion
            });
        }
    }, [currentProductData, mode, form]); // Depend on fetched/prop data

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const payload: NewProduct = {
                ...values,
                // Ensure numeric types if needed by API
                price: Number(values.price),
                discountPrice: values.discountPrice ? Number(values.discountPrice) : null,
                stock: Number(values.stock),
                // tags should already be an array of IDs from the form's Select component
            };

            // Use currentProductData?.id for edit
            if (mode === 'edit' && currentProductData) {
                await updateProduct({ id: currentProductData.id, formData: payload }).unwrap();
                notification.success({ message: "Success", description: "Product updated successfully." });
            } else if (mode === 'create') {
                await createProduct(payload).unwrap();
                notification.success({ message: "Success", description: "Product created successfully." });
            }
            onSaveSuccess(); // Call success callback (e.g., refetch list, close drawer)
        } catch (err: any) {
             if (err?.errorFields) {
                 console.error('Validation Failed:', err);
                 notification.error({ message: "Validation Error", description: "Please check the form fields." });
            } else {
                 console.error('API Error:', err);
                 handleApiError(err); // Use utility for API errors
            }
        }
    };

    // Define tabs based on mode
    let items: TabsProps['items'] = [
        {
            key: 'details',
            label: 'Details',
            children: (
                // Pass disabled prop to Ant Form based on mode
                <Form form={form} layout="vertical" disabled={isViewMode} name="productForm">
                    <ProductFormFields isViewMode={isViewMode} />
                </Form>
            ),
        },
    ];

    if (mode === 'edit' || mode === 'view') {
        items.push(
            {
                key: 'variants',
                label: 'Variants',
                // Pass fetched data
                children: <ProductVariantManager selectedProduct={currentProductData} isViewMode={isViewMode} />,
            },
            {
                key: 'images',
                label: 'Images',
                 // Pass fetched data
                children: <ProductImageManager selectedProduct={currentProductData} isViewMode={isViewMode} />,
            },
            {
                key: 'reviews',
                label: 'Reviews',
                // Pass fetched data (assuming it includes reviews)
                children: <ProductReviewsTab selectedProduct={currentProductData} />,
            }
        );
    }

    const getTitle = () => {
        switch (mode) {
            case 'create': return 'Create New Product';
            case 'edit': return `Edit Product: ${product?.name ?? ''}`;
            case 'view': return `View Product: ${product?.name ?? ''}`;
            default: return 'Product Details';
        }
    };

    return (
        <Drawer
            title={getTitle()}
            placement="right"
            onClose={onClose}
            open={true} // Drawer visibility controlled by parent state
            width={800}
            destroyOnClose // Reset form state when closed
            extra={ // Add Save/Cancel buttons to drawer header/footer
                !isViewMode && (
                    <Space>
                        <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
                        <Button type="primary" onClick={handleSave} loading={isLoading}>
                            Save Product
                        </Button>
                    </Space>
                )
            }
        >
            <Spin spinning={isLoading && mode !== 'create'}> {/* Show spinner when loading existing data */}
                 <Tabs defaultActiveKey="details" items={items} />
            </Spin>
        </Drawer>
    );
};

export default ProductDetailView;
