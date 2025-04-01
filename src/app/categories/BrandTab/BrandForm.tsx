"use client";

import React, { useEffect } from "react";
import { Brand, NewBrand } from "@/types";
import { Form, Input, Button, Spin, Space } from "antd";

interface BrandFormProps {
  onSubmit: (data: NewBrand) => Promise<void> | void;
  initialData?: Brand | null;
  isLoading?: boolean;
  onCancel: () => void;
}

export const BrandForm = ({
  onSubmit,
  initialData,
  isLoading = false,
  onCancel,
}: BrandFormProps) => {
  const [form] = Form.useForm<NewBrand>();
  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        name: initialData.name,
        description: initialData.description || "",
      });
    } else {
      form.resetFields();
    }
  }, [initialData, form]);

  const handleFinish = async (values: NewBrand) => {
    const processedValues: NewBrand = {
      ...values,
      description: values.description || null, // Ensure null if empty
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
          label="Description"
          rules={[{ required: true, message: "Please enter the description" }]}
        >
          <Input.TextArea rows={3} placeholder="Enter brand description" />
        </Form.Item>

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
