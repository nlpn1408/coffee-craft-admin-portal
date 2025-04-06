'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Use next/navigation hooks
import { Tabs, Button, Form, Spin, notification, Space, Card, Breadcrumb, Typography, Tooltip } from 'antd'; // Import Tooltip
import type { TabsProps } from 'antd';
import { HomeOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons'; // Import icons
import Link from 'next/link'; // For Breadcrumbs
import { Product, NewProduct } from '@/types';
import { ProductFormFields } from './ProductDetailTab/ProductFormFields';
import { useUpdateProductMutation, useGetProductQuery } from '@/state/api';
import { handleApiError } from '@/lib/api-utils';
import ProductVariantManager from './ProductVariantTab/ProductVariantManager'; 
import ProductImageManager from './ProductImageTab/ProductImageManager';
import ProductReviewsTab from './ProductReviewsTab/ProductReviewsTab';
const { Title } = Typography;

const ProductEditPage = () => {
    const router = useRouter();
    const params = useParams();
    const productId = params?.id as string; // Get ID from URL

    const [form] = Form.useForm<NewProduct>();
    const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

    // Fetch detailed product data
    const { data: productData, isLoading: isLoadingDetails, isError, refetch } = useGetProductQuery(
        productId,
        { skip: !productId } // Skip if no ID
    );

    // Set form values when data is available
    useEffect(() => {
        if (productData) {
            form.setFieldsValue({
                ...productData,
                // Ensure tags are just IDs/names if needed by form field
                tags: productData.tags?.map(tag => tag.name) ?? [],
            });
        }
    }, [productData, form]);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const payload: NewProduct = {
                ...values,
                price: Number(values.price),
                discountPrice: values.discountPrice ? Number(values.discountPrice) : null,
                stock: Number(values.stock),
            };

            await updateProduct({ id: productId, formData: payload }).unwrap();
            notification.success({ message: "Success", description: "Product updated successfully." });
            refetch(); // Refetch data after save
            // Optionally navigate back or stay on page
            // router.push('/products');
        } catch (err: any) {
             if (err?.errorFields) {
                 console.error('Validation Failed:', err);
                 notification.error({ message: "Validation Error", description: "Please check the form fields." });
            } else {
                 console.error('API Error:', err);
                 handleApiError(err);
            }
        }
    };

    const handleCancel = () => {
        router.push('/products'); // Navigate back to the list
    };

    // Define tabs
    const items: TabsProps['items'] = [
        {
            key: 'details',
            label: 'Details',
            children: (
                <Form form={form} layout="vertical" name="productEditForm">
                    <ProductFormFields isViewMode={false} /> {/* Always editable here */}
                </Form>
            ),
        },
        {
            key: 'variants',
            label: 'Variants',
            children: <ProductVariantManager selectedProduct={productData ?? null} isViewMode={false} />,
        },
        {
            key: 'images',
            label: 'Images',
            children: <ProductImageManager selectedProduct={productData ?? null} isViewMode={false} />,
        },
        {
            key: 'reviews',
            label: 'Reviews',
            children: <ProductReviewsTab selectedProduct={productData ?? null} />,
        },
    ];

    if (isLoadingDetails) {
        return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
    }

    if (isError || !productData) {
        return <div className="text-red-600 text-center p-4">Error loading product data.</div>;
    }

    return (
        <div className="space-y-6">
             <Breadcrumb
                items={[
                    { href: '/', title: <HomeOutlined /> },
                    { href: '/products', title: 'Products' },
                    { title: productData?.name ?? 'Edit Product' },
                ]}
            />
             <div className="flex justify-between items-center">
                <Tooltip title={productData?.name}>
                  {/* Apply truncate classes and max-width */}
                  <Title level={3} className="truncate block max-w-2xl">
                    Edit Product: {productData?.name}
                  </Title>
                </Tooltip>
                 <Space>
                    <Button icon={<CloseOutlined />} onClick={handleCancel} disabled={isUpdating}>
                        Cancel
                    </Button>
                    <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={isUpdating}>
                        Save Product
                    </Button>
                </Space>
            </div>

            <Card>
                <Tabs defaultActiveKey="details" items={items} />
            </Card>
        </div>
    );
};

export default ProductEditPage;