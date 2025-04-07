"use client";

import React from "react";
import {
  Modal,
  Spin,
  Descriptions,
  Tag,
  Typography,
  Divider,
  Timeline, // Import Timeline
  Alert,    // Import Alert
} from "antd";
import { Order, OrderStatus, OrderHistoryEvent } from "@/types"; // Import OrderHistoryEvent
import { useGetOrderByIdQuery, useGetOrderHistoryQuery } from "@/state/services/orderService"; // Import history hook
import { format } from "date-fns";
import { formatCurrency } from "@/utils/utils";
import { renderOrderStatusTag } from "./utils/renderOrderStatusTag";
import { User, Clock, Edit3, XCircle, CheckCircle, Package, Truck } from 'lucide-react'; // Import icons

const { Text, Paragraph } = Typography;

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
}

// Helper function to generate timeline item content
const renderHistoryItem = (event: OrderHistoryEvent) => {
    let title = `Action: ${event.action}`;
    let details: React.ReactNode[] = [];
    let icon = <Edit3 size={14} />; // Default icon

    if (event.action === 'CREATE_ORDER') {
        title = 'Order Created';
        icon = <CheckCircle size={14} className="text-green-600"/>;
    } else if (event.action === 'UPDATE_STATUS') {
        title = `Status changed: ${event.oldValue} → ${event.newValue}`;
        if (event.newValue === OrderStatus.CONFIRMED) icon = <CheckCircle size={14} className="text-blue-600"/>;
        else if (event.newValue === OrderStatus.SHIPPED) icon = <Truck size={14} className="text-purple-600"/>;
        else if (event.newValue === OrderStatus.DELIVERED) icon = <Package size={14} className="text-green-600"/>;
        else if (event.newValue === OrderStatus.CANCELED) icon = <XCircle size={14} className="text-red-600"/>;
    } else if (event.action === 'CANCEL_ORDER') {
         title = 'Order Canceled';
         icon = <XCircle size={14} className="text-red-600"/>;
    }
    // Add more conditions for other actions like payment status changes if needed

    if (event.user) {
        details.push(
            <span key="user" className="text-xs text-gray-600">
                by {event.user.name || event.user.email} ({event.user.role})
            </span>
        );
    } else if (event.userId) {
         details.push(
            <span key="user-id" className="text-xs text-gray-600">
                by User ID: {event.userId}
            </span>
         );
    } else {
         details.push(
            <span key="system" className="text-xs text-gray-600">
                by System
            </span>
         );
    }

    return (
        <Timeline.Item key={event.id} dot={icon}>
            <div className="flex justify-between items-start">
                <div>
                    <Text strong>{title}</Text>
                    {details.length > 0 && <div className="mt-1">{details}</div>}
                </div>
                <Text type="secondary" style={{ fontSize: '0.8em', whiteSpace: 'nowrap', marginLeft: '10px' }}>
                    {format(new Date(event.timestamp), "PPpp")}
                </Text>
            </div>
        </Timeline.Item>
    );
};


export default function OrderDetailModal({
  isOpen,
  onClose,
  orderId,
}: OrderDetailModalProps) {
  // Fetch order details
  const {
    data: order,
    isLoading: isLoadingOrder,
    isError: isErrorOrder,
    error: errorOrder,
  } = useGetOrderByIdQuery(orderId!, {
    skip: !orderId || !isOpen,
  });

  // Fetch order history
  const {
      data: history,
      isLoading: isLoadingHistory,
      isError: isErrorHistory,
      error: errorHistory,
  } = useGetOrderHistoryQuery(orderId!, {
      skip: !orderId || !isOpen, // Skip if no order ID or modal closed
  });


  const handleCancel = () => {
    onClose();
  };

  // Combine loading states
  const isLoading = isLoadingOrder || isLoadingHistory;

  return (
    <Modal
      title={`Order Details - ${orderId ?? '...'}`}
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Spin spinning={isLoadingOrder}> {/* Spin only for order details loading */}
        {isErrorOrder ? (
          <Alert
            message="Error Loading Order Details"
            description={JSON.stringify(errorOrder)}
            type="error"
            showIcon
          />
        ) : order ? (
          <>
            {/* Order Details Section */}
            <Descriptions bordered column={2} size="small" className="mb-4">
              <Descriptions.Item label="Order ID">{order.id}</Descriptions.Item>
              <Descriptions.Item label="Order Date">
                {format(new Date(order.createdAt), "PPpp")}
              </Descriptions.Item>
              <Descriptions.Item label="Customer Email">
                {order.user?.email ?? "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {renderOrderStatusTag({ status: order.status })}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                {order.paymentMethod.replace("_", " ")}
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount">
                {formatCurrency(order.total)}
              </Descriptions.Item>
              {order.voucher && (
                <Descriptions.Item label="Voucher Code">
                  {order.voucher.code}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Note" span={2}>
                {order.note || <Text type="secondary">None</Text>}
              </Descriptions.Item>
            </Descriptions>

            {/* Shipping Info Section */}
            <Divider>Shipping Information</Divider>
            {order.shippingAddress ? (
              <Descriptions bordered column={1} size="small" className="mb-4">
                <Descriptions.Item label="Receiver Name">
                  {order.shippingAddress.receiverName}
                </Descriptions.Item>
                <Descriptions.Item label="Receiver Phone">
                  {order.shippingAddress.receiverPhone}
                </Descriptions.Item>
                <Descriptions.Item label="Address">
                  {order.shippingAddress.address}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Text type="secondary">No shipping address details available.</Text>
            )}

            {/* Order Items Section */}
            <Divider>Order Items</Divider>
            {(order.orderItems ?? []).length > 0 ? (
              (order.orderItems ?? []).map((item, index) => (
                <Descriptions
                  key={item.id || index}
                  bordered
                  column={3}
                  size="small"
                  className="mb-3"
                >
                  <Descriptions.Item label="Product" span={3}>
                    <Text strong>
                      {item.product?.name ?? `Product ID: ${item.productId}`}
                    </Text>
                    {item.productVariant?.name && (
                      <Text type="secondary" style={{ display: "block", fontSize: "0.85em" }}>
                        Variant: {item.productVariant.name}
                      </Text>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Price at order">
                    {formatCurrency(item.priceAtOrder)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Quantity">
                    {item.quantity}
                  </Descriptions.Item>
                  <Descriptions.Item label="Subtotal" style={{ textAlign: "right", fontWeight: "bold" }}>
                    {formatCurrency(item.subTotal)}
                  </Descriptions.Item>
                </Descriptions>
              ))
            ) : (
              <Text type="secondary">No items found in this order.</Text>
            )}

             {/* Order History Section */}
             <Divider>Order History</Divider>
             <Spin spinning={isLoadingHistory}>
                {isErrorHistory ? (
                     <Alert
                        message="Error Loading History"
                        description={JSON.stringify(errorHistory)}
                        type="error"
                        showIcon
                    />
                ) : history && history.length > 0 ? (
                    <Timeline mode="left" className="mt-4 pr-4"> {/* Removed max-h and overflow */}
                        {history.map(renderHistoryItem)}
                    </Timeline>
                ) : (
                    <Text type="secondary">No history found for this order.</Text>
                )}
             </Spin>

          </>
        ) : (
           !isLoadingOrder && <Text type="secondary">Order data not found.</Text> // Show if not loading and no order
        )}
      </Spin>
    </Modal>
  );
}
