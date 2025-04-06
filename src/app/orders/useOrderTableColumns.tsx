"use client";

import React from "react";
import { Order, OrderStatus, PaymentMethod } from "@/types"; // Import necessary types
import { format } from "date-fns";
import { Button, Space, Tag, message } from "antd"; // Remove Dropdown, Menu; Add Space
import type { TableProps } from "antd"; // Remove MenuProps
import { MoreOutlined, EyeOutlined, EditOutlined } from "@ant-design/icons"; // Import EyeOutlined, EditOutlined
import { useColumnSearch } from "@/hooks/useColumnSearch";
import { formatCurrency } from "@/utils/utils";
import { renderOrderStatusTag } from "./utils/renderOrderStatusTag"; // Import utility
// import { useAuth } from "@/contexts/AuthContext"; // May not be needed unless actions depend on user role

// Hook Arguments Interface
interface UseOrderTableColumnsProps {
  onEdit: (order: Order) => void; // For status update modal
  onViewDetails: (orderId: string) => void; // Handler for viewing details
}

export const useOrderTableColumns = ({
  onEdit,
  onViewDetails, // Destructure the new handler
}: UseOrderTableColumnsProps): TableProps<Order>["columns"] => {
  const getColumnSearchProps = useColumnSearch<Order>();
  // const { user: currentUser } = useAuth(); // Uncomment if needed

  // Remove Action Menu Logic

  // --- Status Filter Logic ---
  const statusFilters = Object.values(OrderStatus).map((status) => ({
    text: status.charAt(0) + status.slice(1).toLowerCase(), // Capitalize first letter
    value: status,
  }));
  // --- End Status Filter Logic ---

  // --- Payment Method Filter Logic ---
  const paymentMethodFilters = Object.values(PaymentMethod).map((method) => ({
    text: method.replace("_", " "), // Replace underscore with space
    value: method,
  }));
  // --- End Payment Method Filter Logic ---

  const columns: TableProps<Order>["columns"] = [
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
      width: 180,
      ...getColumnSearchProps("id"),
      ellipsis: true,
    },
    {
      title: "Customer Email",
      dataIndex: ["user", "email"], // Access nested user email
      key: "customerEmail",
      sorter: (a, b) =>
        (a.user?.email ?? "").localeCompare(b.user?.email ?? ""),
      ...getColumnSearchProps(["user", "email"]), // Search nested prop
      render: (_, record) => record.user?.email ?? "N/A",
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      sorter: (a, b) => a.total - b.total,
      render: (total) => formatCurrency(total), // Format as currency
      width: 120,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: statusFilters,
      onFilter: (value, record) => record.status === value,
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (status: OrderStatus) => renderOrderStatusTag({ status }), // Use utility function
      width: 120,
    },
    {
      title: "Payment",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      filters: paymentMethodFilters,
      onFilter: (value, record) => record.paymentMethod === value,
      sorter: (a, b) => a.paymentMethod.localeCompare(b.paymentMethod),
      render: (method: PaymentMethod) => method.replace("_", " "),
      width: 130,
    },
    // Add Order Date column
    {
      title: "Order Date",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (createdAt) => createdAt ? format(new Date(createdAt), 'dd/MM/yyyy') : '-', // Updated format
      width: 120,
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      width: 100, // Adjust width for buttons
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            onClick={() => onViewDetails(record.id)}
            size="small"
            title="View Details"
          />
          {/* Always render Edit Status button, disable based on status */}
          <Button
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            size="small"
            title="Edit Status"
            disabled={record.status === OrderStatus.DELIVERED || record.status === OrderStatus.CANCELED} // Disable if Delivered or Canceled
          />
        </Space>
      ),
    },
  ];

  return columns;
};
