"use client";

import React from "react";
import { Order, OrderStatus, PaymentMethod } from "@/types"; // Import necessary types
import { format } from "date-fns";
import { Button, Dropdown, Menu, Tag, message } from "antd";
import type { MenuProps, TableProps } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { useColumnSearch } from "@/hooks/useColumnSearch"; // Assuming this hook is generic enough
import { formatCurrency } from "@/utils/utils";
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

  // --- Action Menu Logic ---
  const handleMenuClick = (e: { key: string }, order: Order) => {
    if (e.key === "copyId") {
      navigator.clipboard.writeText(order.id);
      message.success("Order ID copied to clipboard");
    } else if (e.key === "edit") {
      onEdit(order); // Trigger edit action
    } else if (e.key === 'details') {
      onViewDetails(order.id); // Call the handler with the order ID
    } else {
      message.info(`Action '${e.key}' clicked for order ID: ${order.id}`);
    }
  };

  const getMenuItems = (order: Order): MenuProps["items"] => {
    const items: MenuProps["items"] = [
      { label: "Copy Order ID", key: "copyId" },
      { label: "View Details", key: "details" },
    ];

    // Only allow editing status if it's not Delivered or Canceled
    if (order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELED) {
      items.push({ label: "Edit Order Status", key: "edit" });
    }

    // TODO: Add logic for 'Cancel Order' action if needed, potentially checking status too
    return items;
  };
  // --- End Action Menu Logic ---

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
      width: 150,
      ...getColumnSearchProps("id"),
      render: (id: string) => <span>...{id.slice(-8)}</span>, // Show last 8 chars
    },
    {
      title: "Customer",
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
      render: (status: OrderStatus) => {
        let color = "default";
        switch (status) {
          case OrderStatus.PENDING:
            color = "orange";
            break;
          case OrderStatus.CONFIRMED:
            color = "processing";
            break;
          case OrderStatus.SHIPPED:
            color = "blue";
            break;
          case OrderStatus.DELIVERED:
            color = "success";
            break;
          case OrderStatus.CANCELED:
            color = "error";
            break;
        }
        return (
          <Tag color={color}>
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </Tag>
        );
      },
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
    {
      title: "Actions",
      key: "actions",
      align: "center",
      width: 80,
      render: (_, record) => (
        <Dropdown
          menu={{ // Use menu prop instead of overlay
            items: getMenuItems(record),
            onClick: (e) => handleMenuClick(e, record),
          }}
          trigger={['click']} // Optional: specify trigger if needed
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return columns;
};
