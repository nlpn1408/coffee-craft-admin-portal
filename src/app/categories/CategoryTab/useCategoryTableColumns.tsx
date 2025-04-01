"use client";

import React, { useMemo, Key } from "react"; // Removed useRef
import { Category } from "@/types";
import { Table, Button, Space, Popconfirm, Tag, message, Dropdown, Menu } from "antd"; // Removed Input, InputRef
import type { TableProps, MenuProps } from "antd";
import type { ColumnType } from 'antd/es/table/interface'; // Removed FilterConfirmProps, FilterDropdownProps
import { EditOutlined, DeleteOutlined, FilterOutlined, MoreOutlined } from "@ant-design/icons"; // Removed SearchOutlined
import { format } from "date-fns";
import { useColumnSearch } from "@/hooks/useColumnSearch"; // Import the new hook

// Removed DataIndex type alias, use keyof Category directly if needed

// Hook Arguments Interface
interface UseCategoryTableColumnsProps {
  allCategories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => Promise<void>;
  isActionLoading?: boolean;
  isDeleting?: boolean;
}

export const useCategoryTableColumns = ({
  allCategories,
  onEdit,
  onDelete,
  isActionLoading = false,
  isDeleting = false,
}: UseCategoryTableColumnsProps): TableProps<Category>["columns"] => {

  // Use the hook to get the search props generator
  const getColumnSearchProps = useColumnSearch<Category>();

  // --- Parent Category Filter Logic (remains the same) ---
  const parentCategoryFilters = useMemo(() => {
    const parents = new Map<string | null, string>();
    parents.set(null, 'None');
    allCategories.forEach(cat => {
      if (cat.parentId && !parents.has(cat.parentId)) {
        const parentName = allCategories.find(p => p.id === cat.parentId)?.name;
        parents.set(cat.parentId, parentName || cat.parentId);
      }
    });
    return Array.from(parents.entries()).map(([value, text]) => ({
      text: text,
      value: value ?? 'none',
    })).sort((a, b) => a.text.localeCompare(b.text));
  }, [allCategories]);
  // --- End Parent Category Filter Logic ---

  const columns: TableProps<Category>["columns"] = [
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
      title: "Parent Category",
      dataIndex: "parentId",
      key: "parentId",
      render: (parentId: string | null) => {
        if (!parentId) return "None";
        const parentName = allCategories.find(p => p.id === parentId)?.name;
        return parentName || parentId;
      },
      sorter: (a, b) => (a.parentId || "").localeCompare(b.parentId || ""),
      filters: parentCategoryFilters,
      onFilter: (value: Key | boolean, record: Category) => {
        const recordParentId = record.parentId ?? 'none';
        return String(recordParentId) === String(value);
      },
      filterIcon: (filtered: boolean) => (
        <FilterOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
      ),
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
      render: (_, record: Category) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            size="small"
            aria-label="Edit"
            disabled={isActionLoading}
          />
          <Popconfirm
            title="Delete Category"
            description="Are you sure you want to delete this category?"
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
