"use client";

import React, { Key } from "react"; // Removed useRef
import { Brand } from "@/types";
import { Table, Button, Space, Popconfirm, message, Dropdown, Menu } from "antd"; // Removed Input, InputRef
import type { TableProps, MenuProps } from "antd";
import type { ColumnType } from 'antd/es/table/interface'; // Removed FilterConfirmProps, FilterDropdownProps
import { EditOutlined, DeleteOutlined, MoreOutlined } from "@ant-design/icons"; // Removed SearchOutlined
import { format } from "date-fns";
import { useColumnSearch } from "@/hooks/useColumnSearch"; // Import the new hook

// Removed DataIndex type alias

// Hook Arguments Interface
interface UseBrandTableColumnsProps {
  onEdit: (brand: Brand) => void;
  onDelete: (id: string) => Promise<void>;
  isActionLoading?: boolean;
  isDeleting?: boolean;
}

export const useBrandTableColumns = ({
  onEdit,
  onDelete,
  isActionLoading = false,
  isDeleting = false,
}: UseBrandTableColumnsProps): TableProps<Brand>["columns"] => {

  // Use the hook to get the search props generator
  const getColumnSearchProps = useColumnSearch<Brand>();

  // --- Action Menu Logic (Optional) ---
  // const handleMenuClick = (e: { key: string }, brand: Brand) => {
  //   if (e.key === 'edit') {
  //      onEdit(brand);
  //   }
  // };
  // const getMenuItems = (brand: Brand): MenuProps['items'] => [
  //   { label: 'Edit Brand', key: 'edit' },
  // ];
  // --- End Action Menu Logic ---

  const columns: TableProps<Brand>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      ...getColumnSearchProps('name'), // Apply search props
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text: string | null) => text || "N/A",
      sorter: (a, b) => (a.description || "").localeCompare(b.description || ""),
      ellipsis: true,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => format(new Date(text), "MMM d, yyyy HH:mm"),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      width: 180,
    },
    {
      title: "Actions",
      key: "actions",
      align: 'center',
      width: 100,
      render: (_, record: Brand) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            size="small"
            aria-label="Edit"
            disabled={isActionLoading}
          />
          <Popconfirm
            title="Delete Brand"
            description="Are you sure you want to delete this brand?"
            onConfirm={() => onDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ loading: isDeleting }}
            disabled={isActionLoading}
          >
            <Button icon={<DeleteOutlined />} danger size="small" aria-label="Delete" disabled={isActionLoading}/>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return columns;
};
