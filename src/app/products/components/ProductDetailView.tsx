'use client';

import React, { useEffect } from 'react';
import { Drawer, Tabs, Button, Form, Spin, notification, Space } from 'antd';
import type { TabsProps } from 'antd';
import { Product, NewProduct } from '@/types';
// Use absolute path aliases
import ProductVariantManager from '@/app/products/product-details/ProductVariantManager';
import ProductImageManager from '@/app/products/product-details/ProductImageManager';
import { ProductFormFields } from '@/app/products/components/ProductFormFields';
import { useCreateProductMutation, useUpdateProductMutation } from '@/state/api';
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
    const [form] = Form.useForm();
    const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
    const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
    const isLoading = isCreating || isUpdating;
    const isViewMode = mode === 'view';

    // Set form values when product or mode changes
    useEffect(() => {
        if (mode === 'create') {
            form.resetFields();
        } else if (product) {
            form.setFieldsValue({
                ...product,
                // Ensure tags are just IDs if the form field expects that
                tags: product.tags?.map(tag => tag.id) ?? [],
            });
        }
    }, [product, mode, form]);

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

            if (mode === 'edit' && product) {
                await updateProduct({ id: product.id, formData: payload }).unwrap();
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
                <Form form={form} layout="vertical" disabled={isViewMode}>
                    {/* Use component from the same directory */}
                    <ProductFormFields /> {/* Removed isViewMode prop as Form handles disable */}
                </Form>
            ),
        },
    ];

    if (mode === 'edit' || mode === 'view') {
        items.push(
            {
                key: 'variants',
                label: 'Variants',
                // Use renamed component
                children: <ProductVariantManager selectedProduct={product} isViewMode={isViewMode} />,
            },
            {
                key: 'images',
                label: 'Images',
                 // Use renamed component
                children: <ProductImageManager selectedProduct={product} isViewMode={isViewMode} />,
            }
            // Removed Tags tab
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
