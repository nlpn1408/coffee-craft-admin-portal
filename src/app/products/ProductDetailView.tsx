'use client';

import React, { useEffect, useMemo } from 'react'; // Added useMemo
import { Drawer, Tabs, Button, Form, Spin, notification, Space } from 'antd';
import type { TabsProps } from 'antd';
import { Product, NewProduct } from '@/types'; // Removed TagType

import { useCreateProductMutation, useUpdateProductMutation } from '@/state/api';
// Removed tag hooks import
import { handleApiError } from '@/lib/api-utils';
import { ProductFormFields } from './components/ProductFormFields';
import ProductVariantManager from './product-details/ProductVariantManager';
import ProductImageManager from './product-details/ProductImageManager';


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

    // Removed tag hooks
    // const { data: allTagsResponse, isLoading: isLoadingTags } = useGetTagsQuery({ limit: 9999, page: 1 });
    // const [createTag, { isLoading: isCreatingTag }] = useCreateTagMutation();

    const isLoading = isCreating || isUpdating;
    const isViewMode = mode === 'view';

    // Removed useEffect for setting form values

    // Prepare initialValues for the Form component
    const initialValues = useMemo(() => {
        if (mode === 'create' || !product) {
            return { active: true }; // Default values for create mode
        }
        // For edit/view mode:
        return {
            ...product,
            price: product.price != null ? Number(product.price) : undefined,
            discountPrice: product.discountPrice != null ? Number(product.discountPrice) : undefined,
            tags: product.tags?.map(tag => tag.name) ?? [],
        };
    }, [product, mode]);


    const handleSave = async () => {
        try {
            const values = await form.validateFields();

            // --- Removed Tag Processing Logic ---
            // Backend will handle creating new tags based on names/IDs sent

            const payload: NewProduct = {
                // Spread other values first
                ...values,
                // Assign raw tags array from form (mix of IDs and names)
                tags: values.tags || [],
                // Ensure numeric types if needed by API
                price: Number(values.price),
                discountPrice: values.discountPrice ? Number(values.discountPrice) : null,
                stock: Number(values.stock),
            };
            // Remove tags from the top level if it was just used for processing
            // delete payload.tags; // Keep payload.tags = finalTagIds

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
                // Pass initialValues to the Form component
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={initialValues} // Use initialValues prop
                    disabled={isViewMode || isLoading}
                >
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
                // Pass isViewMode down
                children: <ProductVariantManager selectedProduct={product} isViewMode={isViewMode} />,
            },
            {
                key: 'images',
                label: 'Images',
                 // Pass isViewMode down
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
            // Mask closet prevents closing while loading
            maskClosable={!isLoading}
            // Keyboard false prevents closing with ESC when loading
            keyboard={!isLoading}
        >
            {/* Wrap content in Spin for loading state */}
            <Spin spinning={isLoading}>
                 <Tabs defaultActiveKey="details" items={items} />
            </Spin>
        </Drawer>
    );
};

export default ProductDetailView;
