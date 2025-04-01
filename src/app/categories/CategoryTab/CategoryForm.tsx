"use client";

import React, { useEffect } from "react";
import { Category, NewCategory } from "@/types";
import { Form, Input, Select, Button, Spin, Space } from "antd";

const { Option } = Select;

interface CategoryFormProps {
  onSubmit: (data: NewCategory) => Promise<void> | void;
  initialData?: Category | null;
  parentCategories?: Category[];
  isLoading?: boolean;
  onCancel: () => void;
}

export const CategoryForm = ({
  onSubmit,
  initialData,
  parentCategories = [],
  isLoading = false,
  onCancel,
}: CategoryFormProps) => {
  const [form] = Form.useForm<NewCategory>();
  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        name: initialData.name,
        description: initialData.description ?? undefined,
        parentId: initialData.parentId ?? undefined,
      });
    } else {
      form.resetFields();
    }
  }, [initialData, form]);

  const handleFinish = async (values: NewCategory) => {
    const processedValues: NewCategory = {
      ...values,
      description: values.description || null, // Ensure null if empty
      parentId: values.parentId || null, // Ensure null if empty/undefined
    };
    await onSubmit(processedValues);
    // Parent (Modal) handles closing
  };

  return (
    <Spin spinning={isLoading}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="mt-6"
        initialValues={{
          name: '',
          description: '',
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
          label="Description"
          rules={[{ required: true, message: "Please enter the description" }]}
        >
          <Input.TextArea rows={3} placeholder="Enter description" />
        </Form.Item>

        {parentCategories.length > 0 && (
          <Form.Item
            name="parentId"
            label="Parent Category (Optional)"
          >
            <Select placeholder="Select a parent category" allowClear>
              {parentCategories
                .filter(category => !initialData || category.id !== initialData.id)
                .map((category) => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item className="text-right mb-0">
          <Space>
            <Button onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              {initialData ? "Update" : "Create"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Spin>
  );
};
