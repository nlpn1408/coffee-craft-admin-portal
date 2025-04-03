'use client';

import React, { useEffect } from 'react';
import { Modal, Form, notification } from 'antd';
import VariantForm from '@/app/products/product-details/VariantForm'; // Use absolute path alias
import { ProductVariant, NewProductVariant, UpdateProductVariant } from '@/types';
import {
    useCreateProductVariantMutation,
    useUpdateProductVariantMutation,
} from '@/state/services/productVariantService';

interface CreateEditVariantModalProps {
    isOpen: boolean;
    onClose: () => void;
    variant: ProductVariant | null;
    productId: string;
}

const CreateEditVariantModal: React.FC<CreateEditVariantModalProps> = ({
    isOpen,
    onClose,
    variant,
    productId,
}) => {
    const [form] = Form.useForm();
    const isEditing = !!variant;

    const [createVariant, { isLoading: isCreating }] = useCreateProductVariantMutation();
    const [updateVariant, { isLoading: isUpdating }] = useUpdateProductVariantMutation();

    const isLoading = isCreating || isUpdating;

    useEffect(() => {
        if (variant) {
            form.setFieldsValue({
                ...variant,
                price: Number(variant.price),
                discountPrice: variant.discountPrice ? Number(variant.discountPrice) : null,
                stock: Number(variant.stock),
            });
        } else {
            form.resetFields();
        }
    }, [variant, form, isOpen]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const payload: NewProductVariant | UpdateProductVariant = {
                ...values,
                price: Number(values.price),
                discountPrice: values.discountPrice ? Number(values.discountPrice) : null,
                stock: Number(values.stock),
            };

            if (isEditing && variant) {
                await updateVariant({ productId, id: variant.id, ...(payload as UpdateProductVariant) }).unwrap();
                notification.success({ message: "Success", description: "Variant updated successfully." });
            } else {
                await createVariant({ ...payload, productId } as NewProductVariant).unwrap();
                notification.success({ message: "Success", description: "Variant created successfully." });
            }
            onClose();
        } catch (err: any) {
            if (err?.errorFields) {
                 console.error('Validation Failed:', err);
                 notification.error({ message: "Validation Error", description: "Please check the form fields." });
            } else {
                 console.error('API Error:', err);
                 const errorMessage = err?.data?.message || err?.error || 'An unknown error occurred';
                 notification.error({
                     message: "API Error",
                     description: `Failed to ${isEditing ? 'update' : 'create'} variant: ${errorMessage}`
                 });
            }
        }
    };

    return (
        <Modal
            title={isEditing ? 'Edit Product Variant' : 'Create Product Variant'}
            open={isOpen}
            onOk={handleOk}
            onCancel={onClose}
            confirmLoading={isLoading}
            width={600}
            destroyOnClose
        >
            <Form form={form} layout="vertical" name="variant_form">
                 <VariantForm />
            </Form>
        </Modal>
    );
};

export default CreateEditVariantModal;
