"use client";

import React, { useEffect } from "react";
import { User, NewUser } from "@/types"; // Assuming User and NewUser types exist
import { Modal, Form, Input, Select, Button, Spin, Space } from "antd";
import { USER_ROLES } from "@/lib/constants/constans"; // Import USER_ROLES

const { Option } = Select;

// Define roles - adjust as needed
// const ROLES = ["admin", "user"]; // Removed hardcoded roles

// Define props, including onSubmit with typed data
interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<NewUser>) => Promise<void> | void; // Use Partial<NewUser> for update
  initialData?: User | null;
  isLoading?: boolean;
}

export default function CreateUserModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: CreateUserModalProps) {
  const [form] = Form.useForm<Partial<NewUser>>(); // Use Ant Design's Form instance
  const modalTitle = initialData ? "Edit User" : "Create New User";
  const isEditing = !!initialData;

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.setFieldsValue({
          name: initialData.name,
          email: initialData.email,
          role: initialData.role,
          // Clear password field when editing
          password: '',
        });
      } else {
        form.resetFields(); // Reset for create
      }
    }
  }, [initialData, isOpen, form]);

  const handleFinish = async (values: Partial<NewUser>) => {
    // Remove password if it's empty and editing (don't update password unintentionally)
    if (isEditing && !values.password) {
      delete values.password;
    }
    // Add validation check before submitting if needed, although Form rules handle basic cases
    await onSubmit(values);
    // Parent component handles closing
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={modalTitle}
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
      maskClosable={false}
    >
      <Spin spinning={isLoading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          className="mt-6"
          initialValues={{ role: 'user' }} // Default role
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter user's name" }]}
          >
            <Input placeholder="Enter name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter user's email" },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="Enter email" type="email" disabled={isEditing} /> {/* Disable email editing */}
          </Form.Item>

          {/* Password - Required only on create */}
          {!isEditing && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please enter a password" },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
              hasFeedback // Add feedback icon for validation
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>
          )}

          {/* Password - Optional on edit */}
          {isEditing && (
            <Form.Item
              name="password"
              label="New Password (Optional)"
              rules={[{ min: 6, message: 'Password must be at least 6 characters' }]}
              hasFeedback
            >
              <Input.Password placeholder="Enter new password to change" />
            </Form.Item>
          )}

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Please select a role" }]}
          >
            <Select placeholder="Select a role">
              {Object.entries(USER_ROLES).map(([key, role]) => (
                <Option key={key} value={role.value}>
                  {role.name}
                </Option>
              ))}
            </Select>
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
