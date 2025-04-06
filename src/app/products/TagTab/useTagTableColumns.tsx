"use client";

import React from "react";
import { Tag } from "@/types";
import { Table, Button, Space, Popconfirm } from "antd"; // Removed InputRef
import type { TableColumnsType } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import { useColumnSearch } from "@/hooks/useColumnSearch";

// Hook Arguments Interface
interface UseTagTableColumnsProps {
  onEdit: (tag: Tag) => void;
  onDelete: (id: string) => Promise<void>;
  isActionLoading?: boolean;
  isDeleting?: boolean;
}

export const useTagTableColumns = ({
  onEdit,
  onDelete,
  isActionLoading = false,
  isDeleting = false,
}: UseTagTableColumnsProps): TableColumnsType<Tag> => {
  const getColumnSearchProps = useColumnSearch<Tag>();

  const columns: TableColumnsType<Tag> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
      ...getColumnSearchProps('name'),
      ellipsis: true,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (createdAt) => createdAt ? format(new Date(createdAt), 'dd/MM/yyyy HH:mm') : '-',
      width: 180,
      align: 'center',
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      sorter: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      render: (updatedAt) => updatedAt ? format(new Date(updatedAt), 'dd/MM/yyyy HH:mm') : '-',
      width: 180,
      align: 'center',
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            size="small"
            aria-label="Edit Tag"
            disabled={isActionLoading}
          />
          <Popconfirm
            title="Delete Tag"
            description={`Are you sure you want to delete the tag "${record.name}"?`}
            onConfirm={() => onDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ loading: isDeleting }}
            disabled={isActionLoading}
          >
            <Button icon={<DeleteOutlined />} danger size="small" aria-label="Delete Tag" disabled={isActionLoading}/>
          </Popconfirm>
        </Space>
      ),
      width: 100,
      fixed: "right",
      align: "center",
    },
  ];

  return columns;
};