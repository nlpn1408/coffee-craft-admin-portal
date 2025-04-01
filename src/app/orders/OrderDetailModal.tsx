"use client";

import React from 'react';
import { Modal, Spin, Descriptions, Tag, List, Typography, Divider } from 'antd';
import { Order, OrderStatus } from '@/types';
import { useGetOrderByIdQuery } from '@/state/services/orderService';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/utils';

const { Text } = Typography;

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
}

// Helper to render status tag
const renderStatusTag = (status: OrderStatus) => {
  let color = 'default';
  switch (status) {
    case OrderStatus.PENDING: color = 'orange'; break;
    case OrderStatus.CONFIRMED: color = 'processing'; break;
    case OrderStatus.SHIPPED: color = 'blue'; break;
    case OrderStatus.DELIVERED: color = 'success'; break;
    case OrderStatus.CANCELED: color = 'error'; break;
  }
  return <Tag color={color}>{status.charAt(0) + status.slice(1).toLowerCase()}</Tag>;
};

export default function OrderDetailModal({
  isOpen,
  onClose,
  orderId,
}: OrderDetailModalProps) {
  // Fetch the specific order details when the modal is open and an ID is provided
  const { data: order, isLoading, isError, error } = useGetOrderByIdQuery(orderId!, {
    skip: !orderId || !isOpen, // Skip query if no ID or modal is closed
  });

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      title={`Order Details - ${orderId}`}
      open={isOpen}
      onCancel={handleCancel}
      footer={null} // No actions in this modal for now
      width={800} // Make modal wider for details
      destroyOnClose
    >
      <Spin spinning={isLoading}>
        {isError ? (
          <Text type="danger">Failed to load order details. Error: {JSON.stringify(error)}</Text>
        ) : order ? (
          <>
            <Descriptions bordered column={2} size="small" className="mb-4">
              <Descriptions.Item label="Order ID">{order.id}</Descriptions.Item>
              <Descriptions.Item label="Order Date">{format(new Date(order.orderDate), 'PPpp')}</Descriptions.Item>
              <Descriptions.Item label="Customer Email">{order.user?.email ?? 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Status">{renderStatusTag(order.status)}</Descriptions.Item>
              <Descriptions.Item label="Payment Method">{order.paymentMethod.replace('_', ' ')}</Descriptions.Item>
              <Descriptions.Item label="Total Amount">{formatCurrency(order.total)}</Descriptions.Item>
              {order.voucher && (
                <Descriptions.Item label="Voucher Code">{order.voucher.code}</Descriptions.Item>
              )}
               <Descriptions.Item label="Note" span={2}>{order.note || <Text type="secondary">None</Text>}</Descriptions.Item>
            </Descriptions>

            <Divider>Shipping Information</Divider>
            {order.shippingAddress ? (
                 <Descriptions bordered column={1} size="small" className="mb-4">
                    <Descriptions.Item label="Receiver Name">{order.shippingAddress.receiverName}</Descriptions.Item>
                    <Descriptions.Item label="Receiver Phone">{order.shippingAddress.receiverPhone}</Descriptions.Item>
                    <Descriptions.Item label="Address">{order.shippingAddress.address}</Descriptions.Item>
                 </Descriptions>
            ) : (
                <Text type="secondary">No shipping address details available.</Text>
            )}


            <Divider>Order Items</Divider>
            <List
              size="small"
              bordered
              dataSource={order.orderItems ?? []}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={item.product?.name ?? `Product ID: ${item.productId}`}
                    description={`Quantity: ${item.quantity}`}
                  />
                  <div>Subtotal: {formatCurrency(item.subTotal)}</div>
                </List.Item>
              )}
              locale={{ emptyText: 'No items found in this order.' }}
            />
          </>
        ) : (
          <Text type="secondary">No order data available.</Text> // Should not happen if isLoading is false and no error
        )}
      </Spin>
    </Modal>
  );
}
