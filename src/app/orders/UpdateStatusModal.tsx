"use client";

import React, { useEffect } from "react";
import { Modal, Form, Select, Button, Spin, message, Space } from "antd";
import { Order, OrderStatus } from "@/types";
import { useUpdateOrderStatusMutation } from "@/state/services/orderService";

const { Option } = Select;

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  refetchOrders: () => void; // Function to refetch the orders list
}

export default function UpdateStatusModal({
  isOpen,
  onClose,
  order,
  refetchOrders,
}: UpdateStatusModalProps) {
  const [form] = Form.useForm<{ status: OrderStatus }>();
  const [updateOrderStatus, { isLoading: isUpdating, error }] =
    useUpdateOrderStatusMutation();

  useEffect(() => {
    if (order && isOpen) {
      form.setFieldsValue({ status: order.status });
    } else if (!isOpen) {
      form.resetFields();
    }
  }, [order, isOpen, form]);

  const handleFinish = async (values: { status: OrderStatus }) => {
    if (!order) return;

    try {
      await updateOrderStatus({ id: order.id, status: values.status }).unwrap();
      message.success(
        `Order ${order.id.slice(-8)} status updated successfully!`
      );
      refetchOrders(); // Refetch the list to show the update
      onClose(); // Close the modal on success
    } catch (err: unknown) {
      // Type err as unknown
      console.error("Failed to update order status:", err);
      // Type guard to check for FetchBaseQueryError structure
      let errorMessage = "An unknown error occurred";
      if (typeof err === "object" && err !== null && "status" in err) {
        // It might be FetchBaseQueryError, check for data property
        if (
          "data" in err &&
          typeof err.data === "object" &&
          err.data !== null &&
          "message" in err.data
        ) {
          errorMessage = err.data.message as string;
        } else if ("error" in err) {
          errorMessage = err.error as string; // Handle SerializedError
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      message.error(`Failed to update status: ${errorMessage}`);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      title={`Update Status for Order ...${order?.id.slice(-8)}`}
      open={isOpen}
      onCancel={handleCancel}
      footer={null} // Use Form buttons for footer
      destroyOnClose
      maskClosable={false}
    >
      <Spin spinning={isUpdating}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          className="mt-6"
          initialValues={{ status: order?.status }}
        >
          <Form.Item
            name="status"
            label="Order Status"
            rules={[{ required: true, message: "Please select a status" }]}
          >
            <Select placeholder="Select new status">
              {Object.values(OrderStatus).map((status) => (
                <Option key={status} value={status}>
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item className="text-right mb-0">
            <Space>
              <Button onClick={handleCancel} disabled={isUpdating}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={isUpdating}>
                Update Status
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
}
