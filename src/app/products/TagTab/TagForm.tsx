"use client";

import React, { useEffect } from "react";
import { Form, Input, Button, Space, Spin } from "antd";
import { NewTag, Tag } from "@/types";

interface TagFormProps {
  initialData?: Tag;
  onSubmit: (data: NewTag) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const TagForm: React.FC<TagFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [form] = Form.useForm(); // Use Ant Design Form instance

  // Effect to set initial value when editing
  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({ name: initialData.name });
    } else {
      form.resetFields(); // Reset for create
    }
  }, [initialData, form]);

  // Ant Design Form submission handler
  const handleFinish = (values: { name: string }) => {
    onSubmit(values); // Pass the form values up
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{ name: initialData?.name || "" }} // Set initial value for Ant Form
    >
      <Spin spinning={isLoading}>
        <Form.Item
          label="Tag Name"
          name="name" // Use name directly
          rules={[{ required: true, message: "Tag name is required" }]}
        >
          <Input placeholder="Enter tag name" autoFocus />
        </Form.Item>

        <Form.Item className="mt-6 pt-4 border-t border-gray-200 mb-0"> {/* Remove bottom margin */}
          <div className="flex justify-end">
            <Space>
              <Button onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={isLoading}>
                {initialData ? "Update Tag" : "Create Tag"}
              </Button>
            </Space>
          </div>
        </Form.Item>
      </Spin>
    </Form>
  );
};