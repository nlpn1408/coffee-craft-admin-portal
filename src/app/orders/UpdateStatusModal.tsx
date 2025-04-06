"use client";

import React, { useEffect, useMemo } from "react"; // Add useMemo
import { Modal, Tag, Button, Spin, message, Space, Popconfirm } from "antd"; // Import Tag, Popconfirm
import { ExclamationCircleFilled } from "@ant-design/icons"; // Import icon
import { Order, OrderStatus } from "@/types";
import { useUpdateOrderStatusMutation } from "@/state/services/orderService";
import { handleApiError } from "@/lib/api-utils";
import { renderOrderStatusTag } from "./utils/renderOrderStatusTag"; // Import the utility function
// Remove unused Option

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
  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  // Define allowed transitions
  const nextStatusMap: Partial<Record<OrderStatus, OrderStatus>> = {
    [OrderStatus.PENDING]: OrderStatus.CONFIRMED,
    [OrderStatus.CONFIRMED]: OrderStatus.SHIPPED,
    [OrderStatus.SHIPPED]: OrderStatus.DELIVERED,
    // DELIVERED and CANCELED are terminal
  };

  const currentStatus = order?.status;
  const nextStatus = currentStatus ? nextStatusMap[currentStatus] : undefined;

  // Memoize status options to display
  const availableActions = useMemo(() => {
    const actions: OrderStatus[] = [];
    if (nextStatus) {
      actions.push(nextStatus);
    }
    // Always allow cancellation unless already delivered or canceled
    if (currentStatus && currentStatus !== OrderStatus.DELIVERED && currentStatus !== OrderStatus.CANCELED) {
      actions.push(OrderStatus.CANCELED);
    }
    return actions;
  }, [currentStatus, nextStatus]);

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order) return;

    try {
      await updateOrderStatus({ id: order.id, status: newStatus }).unwrap();
      message.success(
        `Order ${order.id.slice(-8)} status updated to ${newStatus}!`
      );
      refetchOrders();
      onClose();
    } catch (err: unknown) {
      console.error("Failed to update order status:", err);
      handleApiError(err); // Use centralized error handler
    }
  };

  // Remove the local helper function

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      title={`Update Status for Order ...${order?.id.slice(-8)}`}
      open={isOpen}
      onCancel={handleCancel}
      footer={[ // Custom footer with only Close button
        <Button key="close" onClick={handleCancel}>
          Close
        </Button>,
      ]}
      destroyOnClose
      maskClosable={false}
    >
      <Spin spinning={isUpdating}>
        <div className="space-y-4">
          <div>
            <span className="font-semibold mr-2">Current Status:</span>
            {currentStatus ? renderOrderStatusTag({ status: currentStatus }) : 'N/A'}
          </div>

          {availableActions.length > 0 && (
            <div>
              <span className="font-semibold mr-2">Available Actions:</span>
              <Space wrap>
                {availableActions.map((status) =>
                  status === OrderStatus.CANCELED ? (
                    <Popconfirm
                      key={status}
                      title="Cancel Order?"
                      description="Are you sure you want to cancel this order?"
                      onConfirm={() => handleStatusUpdate(OrderStatus.CANCELED)}
                      okText="Yes, Cancel Order"
                      cancelText="No"
                      icon={<ExclamationCircleFilled style={{ color: 'red' }} />}
                    >
                      {/* Render the tag, Popconfirm handles the click */}
                      {renderOrderStatusTag({ status: OrderStatus.CANCELED, clickable: true })}
                    </Popconfirm>
                  ) : (
                    // Render clickable tag for next status
                    renderOrderStatusTag({ status: status, clickable: true, onClick: () => handleStatusUpdate(status) })
                  )
                )}
              </Space>
            </div>
          )}

          {availableActions.length === 0 && currentStatus && (
             <p className="text-gray-500">No further status updates available for this order.</p>
          )}

        </div>
      </Spin>
    </Modal>
  );
}
