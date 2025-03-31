"use client";

import React, { useEffect } from "react";
import { Category, NewCategory } from "@/types";
import { Modal, Form, Input, Select, Button, Spin, Space } from "antd";

const { Option } = Select;

type CreateCategoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  // Renamed from onSubmit in previous refactor attempt to match original prop name
  onCreate: (formData: NewCategory) => Promise<void> | void;
  isSuccess: boolean; // Used to reset form
  parentCategories?: Category[];
  initialData?: Category | null;
  isLoading?: boolean; // Loading state from parent
};

const CreateCategoryModal = ({
  isOpen,
  onClose,
  onCreate,
  isSuccess,
  parentCategories = [],
  initialData,
  isLoading = false, // Default to false
}: CreateCategoryModalProps) => {
  const [form] = Form.useForm<NewCategory>();
  const modalTitle = initialData ? "Edit Category" : "Create New Category";

  // Set form fields when initialData changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.setFieldsValue({
          name: initialData.name,
          description: initialData.description ?? undefined,
          parentId: initialData.parentId ?? undefined,
        });
      } else {
        form.resetFields(); // Reset to initial values if creating new
      }
    }
  }, [initialData, isOpen, form]);

  // Reset form on successful submission (indicated by isSuccess prop)
  useEffect(() => {
    if (isSuccess && !initialData && isOpen) {
      form.resetFields();
    }
  }, [isSuccess, initialData, form, isOpen]);


  const handleFinish = async (values: NewCategory) => {
    // Ensure empty strings become null for optional fields if needed by API
    const processedValues: NewCategory = {
      ...values,
      // Description is now required, so it should have a value.
      // Keep null conversion for parentId if it's optional.
      description: values.description, // No longer needs || null if required
      parentId: values.parentId || null,
    };
    await onCreate(processedValues);
    // Parent component (CategoryTab) handles closing the modal on success/error
  };

  const handleCancel = () => {
    form.resetFields(); // Reset fields on cancel
    onClose();
  };

  return (
    <Modal
      title={modalTitle}
      open={isOpen}
      onCancel={handleCancel}
      footer={null} // Use custom footer buttons inside Form
      destroyOnClose // Destroy form state when modal is closed
      maskClosable={false} // Prevent closing by clicking outside
    >
      <Spin spinning={isLoading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          className="mt-6" // Add some margin top
          initialValues={{ // Set initial values for Antd Form
            name: '',
            description: '', // Initialize description
            parentId: undefined,
          }}
        >
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: "Please enter the category name" }]}
          >
            <Input placeholder="Enter category name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description" // Removed (Optional)
            rules={[{ required: true, message: "Please enter the description" }]} // Added required rule
          >
            <Input.TextArea rows={3} placeholder="Enter description" />
          </Form.Item>

          {parentCategories.length > 0 && (
            <Form.Item
              name="parentId"
              label="Parent Category (Optional)"
            >
              <Select placeholder="Select a parent category" allowClear>
                {/* <Option value={undefined}>None</Option> */}
                {parentCategories
                  // Filter out the category itself if editing
                  .filter(category => !initialData || category.id !== initialData.id)
                  .map((category) => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item className="text-right mb-0"> {/* Align buttons to the right */}
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
};

export default CreateCategoryModal;
