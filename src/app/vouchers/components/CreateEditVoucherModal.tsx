'use client';

import React, { useEffect } from 'react';
import { Modal, Form, notification } from 'antd';
import { Voucher, NewVoucher, UpdateVoucher } from '@/types';
import { VoucherFormFields } from '@/app/vouchers/components/VoucherFormFields'; // Use absolute path alias
import { useCreateVoucherMutation, useUpdateVoucherMutation } from '@/state/services/voucherService';
import { handleApiError } from '@/lib/api-utils';
import moment from 'moment'; // Import moment for date handling

interface CreateEditVoucherModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveSuccess: () => void;
    voucher: Voucher | null; // Null when creating
}

const CreateEditVoucherModal: React.FC<CreateEditVoucherModalProps> = ({
    isOpen,
    onClose,
    onSaveSuccess,
    voucher,
}) => {
    const [form] = Form.useForm();
    const isEditing = !!voucher;

    const [createVoucher, { isLoading: isCreating }] = useCreateVoucherMutation();
    const [updateVoucher, { isLoading: isUpdating }] = useUpdateVoucherMutation();
    const isLoading = isCreating || isUpdating;

    useEffect(() => {
        if (isOpen) { // Reset/set values only when modal opens
            if (voucher) {
                // Set form values for editing, explicitly handling number fields
                form.setFieldsValue({
                    ...voucher,
                    // Convert dates to moment objects for RangePicker
                    dateRange: [
                        voucher.startDate ? moment(voucher.startDate) : null,
                        voucher.endDate ? moment(voucher.endDate) : null
                    ],
                    // Ensure IDs are used for Select components if they expect values
                    applicableCategoryIds: voucher.applicableCategories?.map(cat => cat.id) ?? [],
                    excludedProductIds: voucher.excludedProducts?.map(prod => prod.id) ?? [],
                });
            } else {
                // Reset form and set defaults for creating
                form.resetFields();
                form.setFieldsValue({ isActive: true }); // Default isActive to true
            }
        }
    }, [voucher, isOpen, form]);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();

            // Extract dates from RangePicker value
            const [startDate, endDate] = values.dateRange || [null, null];

            const payload: NewVoucher | UpdateVoucher = {
                code: values.code,
                type: values.type,
                discountPercent: values.discountPercent,
                discountAmount: values.discountAmount,
                maxDiscount: values.maxDiscount,
                startDate: startDate ? (startDate as moment.Moment).toISOString() : '', // Send ISO string or handle null based on API
                endDate: endDate ? (endDate as moment.Moment).toISOString() : '', // Send ISO string or handle null based on API
                usageLimit: values.usageLimit,
                minimumOrderValue: values.minimumOrderValue,
                isActive: values.isActive,
                applicableCategoryIds: values.applicableCategoryIds,
                excludedProductIds: values.excludedProductIds,
            };

            if (isEditing && voucher) {
                await updateVoucher({ id: voucher.id, ...(payload as UpdateVoucher) }).unwrap();
                notification.success({ message: "Success", description: "Voucher updated successfully." });
            } else {
                await createVoucher(payload as NewVoucher).unwrap();
                notification.success({ message: "Success", description: "Voucher created successfully." });
            }
            onSaveSuccess();
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
        <Modal
            title={isEditing ? 'Edit Voucher' : 'Create New Voucher'}
            open={isOpen}
            onOk={handleSave} // Trigger save on OK
            onCancel={onClose}
            confirmLoading={isLoading}
            width={800} // Wider modal for two columns
            destroyOnClose
            maskClosable={false}
        >
            {/* Wrap fields in Form */}
            <Form form={form} layout="vertical" name="voucher_form">
                <VoucherFormFields />
            </Form>
        </Modal>
    );
};

export default CreateEditVoucherModal;
