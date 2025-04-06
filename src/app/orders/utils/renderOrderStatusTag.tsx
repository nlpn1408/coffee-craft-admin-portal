import React from 'react';
import { Tag } from 'antd';
import { OrderStatus } from '@/types';

interface RenderOrderStatusTagProps {
  status: OrderStatus;
  clickable?: boolean;
  onClick?: () => void;
}

export const renderOrderStatusTag = ({ status, clickable = false, onClick }: RenderOrderStatusTagProps): React.ReactElement => {
  let color = "default";
  switch (status) {
    case OrderStatus.PENDING: color = "orange"; break;
    case OrderStatus.CONFIRMED: color = "processing"; break;
    case OrderStatus.SHIPPED: color = "magenta"; break;
    case OrderStatus.DELIVERED: color = "success"; break;
    case OrderStatus.CANCELED: color = "error"; break;
  }

  const props = clickable ? { onClick, style: { cursor: 'pointer' } } : {};

  // Use specific text for SHIPPED status
  const displayText = status === OrderStatus.SHIPPED
    ? "Shipping"
    : status.charAt(0) + status.slice(1).toLowerCase();

  return (
    <Tag color={color} {...props}>
      {displayText}
    </Tag>
  );
};