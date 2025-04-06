'use client';

import React, { useEffect } from 'react';
import { Drawer, Button, Form, Spin, notification, Space } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { NewProduct } from '@/types';
import { ProductFormFields } from '../[id]/ProductDetailTab/ProductFormFields'; // Import from [id] folder
import { useCreateProductMutation } from '@/state/api'; // Assuming api state path
import { handleApiError } from '@/lib/api-utils';

interface ProductCreateDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveSuccess: () => void; // Callback after successful save
}

const ProductCreateDrawer: React.FC<ProductCreateDrawerProps> = ({
    isOpen,
    onClose,
    onSaveSuccess,
}) => {
    const [form] = Form.useForm<NewProduct>();
    const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();

    // Reset form when drawer opens for creation
    useEffect(() => {
        if (isOpen) {
            form.resetFields();
        }
    }, [isOpen, form]);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const payload: NewProduct = {
                ...values,
                price: Number(values.price),
                discountPrice: values.discountPrice ? Number(values.discountPrice) : null,
                stock: Number(values.stock),
                // Ensure tags are handled correctly if needed (might be handled by ProductTagAssociation)
            };

            await createProduct(payload).unwrap();
            notification.success({ message: "Success", description: "Product created successfully." });
            onSaveSuccess(); // Call success callback (e.g., refetch list, close drawer)
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

    return (
        <Drawer
            title="Create New Product"
            placement="right"
            onClose={onClose}
            open={isOpen}
            width={800} // Or adjust width as needed
            destroyOnClose // Reset form state when closed
            extra={
                <Space>
                    <Button icon={<CloseOutlined />} onClick={onClose} disabled={isCreating}>Cancel</Button>
                    <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={isCreating}>
                        Create Product
                    </Button>
                </Space>
            }
        >
            {/* No need for spinner during creation */}
            {/* Render only the details form */}
            <Form form={form} layout="vertical" name="productCreateForm">
                <ProductFormFields isViewMode={false} />
            </Form>
        </Drawer>
    );
};

export default ProductCreateDrawer;