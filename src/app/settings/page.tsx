"use client";

import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { LogoutOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Card, Modal } from "antd";
import React, { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/lib/constants/api";
import { useRouter } from "next/navigation";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import { useUpdateUserMutation } from "@/state/api";

interface ChangePasswordForm {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const Settings = () => {
  const { logout, user } = useAuth();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm<ChangePasswordForm>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const [initialValues, setInitialValues] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    // address: user?.address || "",
  });

  useEffect(() => {
    if (user) {
      setInitialValues({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        // address: user.address || "",
      });
      form.setFieldsValue({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        // address: user.address || "",
      });
    }
  }, [user, form]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const payload = { ...values };

      // Conditionally add password fields if the change password modal is open
      if (isChangePasswordModalOpen) {
        payload.oldPassword = passwordForm.getFieldValue("currentPassword");
        payload.password = passwordForm.getFieldValue("newPassword");
      }

      const response = await updateUser({ id: user?.id, ...payload }).unwrap();

      message.success("Profile updated successfully");
      router.refresh();
      setIsChangePasswordModalOpen(false);
      passwordForm.resetFields();
    } catch (error: any) {
      if (error.status === 403) {
        message.error("Old password is incorrect");
      } else {
        message.error((error as any).message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const showChangePasswordModal = () => {
    setIsChangePasswordModalOpen(true);
  };

  const handleCancel = () => {
    setIsChangePasswordModalOpen(false);
    passwordForm.resetFields();
  };

  return (
    <div className="w-full">
      <Header name="User Settings" />
      <div className="mt-5 p-4">
        <Card title="Update Profile" className="shadow-md rounded-2xl">
          <Form
            form={form}
            layout="vertical"
            name="updateProfileForm"
            onFinish={onFinish}
            initialValues={initialValues}
          >
            <Form.Item label="Name" name="name">
              <Input />
            </Form.Item>
            <Form.Item label="Email" name="email">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Phone" name="phone">
              <Input />
            </Form.Item>
            {/* <Form.Item label="Address" name="address">
              <Input />
            </Form.Item> */}
            <Form.Item className="flex justify-end">
              <Button type="link" onClick={showChangePasswordModal}>
                Change Password
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Update Profile
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Modal
          title="Change Password"
          open={isChangePasswordModalOpen}
          onCancel={handleCancel}
          footer={null}
        >
          <Form
            form={passwordForm}
            layout="vertical"
            name="changePasswordForm"
            onFinish={onFinish}
            initialValues={{}}
          >
            <Form.Item
              label="Current Password"
              name="currentPassword"
              rules={[
                {
                  required: true,
                  message: "Please input your current password!",
                },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              label="New Password"
              name="newPassword"
              rules={[
                {
                  required: true,
                  message: "Please input your new password!",
                },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={["newPassword"]}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please confirm your password!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(
                        "The two passwords that you entered do not match!"
                      )
                    );
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Change Password
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        <div className="flex justify-end mt-4">
          <Button icon={<LogoutOutlined />} onClick={logout} danger>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
