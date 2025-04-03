'use client';

import React, { useEffect } from 'react';
import { Modal, Form, notification } from 'antd'; // Import notification
import VariantForm from './VariantForm';
import { ProductVariant, NewProductVariant, UpdateProductVariant } from '@/types'; // Import API types
import {
    useCreateProductVariantMutation,
    useUpdateProductVariantMutation,
} from '@/state/services/productVariantService'; // Import actual hooks
// Removed useToast import

interface CreateEditVariantModalProps {
    isOpen: boolean;
    onClose: () => void;
    variant: ProductVariant | null; // Null when creating, object when editing
    productId: string; // ID of the parent product
}

const CreateEditVariantModal: React.FC<CreateEditVariantModalProps> = ({
    isOpen,
    onClose,
    variant,
    productId,
}) => {
    const [form] = Form.useForm();
    // Removed toast usage
    const isEditing = !!variant;

    // Use actual mutation hooks
    const [createVariant, { isLoading: isCreating, error: createError }] = useCreateProductVariantMutation();
    const [updateVariant, { isLoading: isUpdating, error: updateError }] = useUpdateProductVariantMutation();

    // Combine loading states
    const isLoading = isCreating || isUpdating;
    const apiError = createError || updateError;


    useEffect(() => {
        if (variant) {
            // Populate form with existing variant data when editing
            form.setFieldsValue({
                ...variant,
                // Ensure numeric fields are numbers if needed by form inputs
                price: Number(variant.price),
                discountPrice: variant.discountPrice ? Number(variant.discountPrice) : null,
                stock: Number(variant.stock),
            });
        } else {
            // Reset form when creating a new variant
            form.resetFields();
        }
    }, [variant, form, isOpen]); // Rerun effect when modal opens/closes or variant changes

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            // Prepare payload matching API types
            const payload: NewProductVariant | UpdateProductVariant = {
                ...values,
                // Ensure numeric types if API expects numbers
                price: Number(values.price),
                discountPrice: values.discountPrice ? Number(values.discountPrice) : null,
                stock: Number(values.stock),
            };

            if (isEditing && variant) {
                // Update requires productId, variantId (id), and payload
                await updateVariant({ productId, id: variant.id, ...(payload as UpdateProductVariant) }).unwrap();
                notification.success({ message: "Success", description: "Variant updated successfully." });
            } else {
                // Create requires productId and payload
                await createVariant({ ...payload, productId } as NewProductVariant).unwrap();
                notification.success({ message: "Success", description: "Variant created successfully." });
            }
            onClose(); // Close modal on success
        } catch (err: any) {
            // Handle validation errors (Ant Design usually highlights fields)
            if (err?.errorFields) {
                 console.error('Validation Failed:', err);
                 notification.error({ message: "Validation Error", description: "Please check the form fields." });
            } else {
                 // Handle API errors from RTK Query
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
            confirmLoading={isLoading} // Use combined loading state
            width={600}
            destroyOnClose
        >
            {/* Use the actual form component */}
            <Form form={form} layout="vertical" name="variant_form">
                 <VariantForm />
            </Form>
        </Modal>
    );
};

export default CreateEditVariantModal;
