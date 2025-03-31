"use client";

import React, { useEffect } from "react";
import { Brand, NewBrand } from "@/types";
import { Modal, Form, Input, Button, Spin, Space } from "antd";

interface CreateBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: NewBrand) => Promise<void> | void; // Can be async
  isSuccess?: boolean; // Keep for potential form reset logic if needed
  initialData?: Brand | null;
  isLoading?: boolean; // Add isLoading prop
}

export default function CreateBrandModal({
  isOpen,
  onClose,
  onCreate,
  isSuccess,
  initialData,
  isLoading = false, // Default isLoading
}: CreateBrandModalProps) {
  const [form] = Form.useForm<NewBrand>(); // Use Ant Design's Form instance
  const modalTitle = initialData ? "Edit Brand" : "Create Brand";

  // Set form fields when initialData changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.setFieldsValue({
          name: initialData.name || "",
          description: initialData.description || "", // Set description
        });
      } else {
        form.resetFields(); // Reset to initial values if creating new
      }
    }
  }, [initialData, isOpen, form]);

   // Optional: Reset form on success (if parent doesn't close modal immediately)
   useEffect(() => {
    if (isSuccess && !initialData && isOpen) {
      form.resetFields();
    }
  }, [isSuccess, initialData, form, isOpen]);


  const handleFinish = async (values: NewBrand) => {
     // Ensure empty description is null if API expects it (adjust if API requires empty string)
    const processedData: NewBrand = {
      ...values,
      description: values.description || null,
    };
    await onCreate(processedData);
    // Parent component handles closing
  };

  const handleCancel = () => {
    form.resetFields(); // Reset form on cancel
    onClose();
  };

  return (
    <Modal
      title={modalTitle}
      open={isOpen}
      onCancel={handleCancel}
      footer={null} // Use custom footer
      destroyOnClose // Destroy form state when modal is closed
      maskClosable={false}
    >
      <Spin spinning={isLoading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish} // Use Antd Form's onFinish
          className="mt-6"
          initialValues={{ // Set initial values for Antd Form
            name: '',
            description: '', // Initialize description
          }}
        >
          <Form.Item
            name="name"
            label="Brand Name"
            rules={[{ required: true, message: "Please enter the brand name" }]}
          >
            <Input placeholder="Enter brand name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description" // Removed (Optional)
            rules={[{ required: true, message: "Please enter the description" }]} // Added required rule
          >
            <Input.TextArea rows={3} placeholder="Enter brand description" />
          </Form.Item>

          <Form.Item className="text-right mb-0">
            <Space>
              <Button onClick={handleCancel} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={isLoading}>
                {initialData ? "Update" : "Create"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
}
