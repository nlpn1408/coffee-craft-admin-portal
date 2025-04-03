"use client";

import React from 'react';
import { Blog, User } from '@/types';
import { TableColumnsType, Tag as AntTag, Space, Button, Popconfirm, Image } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { format } from 'date-fns';

// Hook Arguments Interface
interface UseBlogTableColumnsProps {
  onEdit: (blog: Blog) => void;
  onDelete: (id: string) => Promise<void>;
  onViewDetails: (blog: Blog) => void;
  isActionLoading?: boolean; // General loading for edit/view buttons
  isDeleting?: boolean; // Specific loading for delete button
}

export const useBlogTableColumns = ({
  onEdit,
  onDelete,
  onViewDetails,
  isActionLoading = false,
  isDeleting = false,
}: UseBlogTableColumnsProps): TableColumnsType<Blog> => {

  // Note: Add useColumnSearch hook here if searching is needed later

  const columns: TableColumnsType<Blog> = [
    {
      title: 'Thumbnail',
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      render: (thumbnail: string | null | undefined) =>
        thumbnail ? (
          <Image width={60} height={40} src={thumbnail} alt="Thumbnail" style={{ objectFit: 'cover' }} />
        ) : (
          <div className="w-[60px] h-[40px] bg-gray-200 flex items-center justify-center text-xs text-gray-500">No Image</div>
        ),
      width: 100,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      sorter: true, // Assuming server-side sorting
      ellipsis: true,
      // Add search props if needed: ...getColumnSearchProps('title'),
    },
    {
        title: 'Author',
        dataIndex: ['author', 'name'], // Access nested property
        key: 'authorName',
        // Add filtering/searching by author if needed
        render: (name: string | undefined, record: Blog) => name || record.userId, // Display name or ID
        ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      sorter: true,
      filters: [ // Add filters for status
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      render: (active: boolean) => (
        <AntTag color={active ? 'green' : 'red'}>
          {active ? 'Active' : 'Inactive'}
        </AntTag>
      ),
      width: 100,
      align: 'center',
    },
    {
      title: 'Publication Date',
      dataIndex: 'publicationDate',
      key: 'publicationDate',
      sorter: true,
      render: (date: string | Date | null | undefined) =>
        date ? format(new Date(date), 'dd/MM/yyyy HH:mm') : '-',
      width: 180,
      align: 'center',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render: (date: string | Date) => format(new Date(date), 'dd/MM/yyyy HH:mm'),
      width: 180,
      align: 'center',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Blog) => ( // Add type for unused first argument
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            onClick={() => onViewDetails(record)}
            size="small"
            aria-label="View Details"
            title="View Details"
            disabled={isActionLoading}
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            size="small"
            aria-label="Edit Post"
            title="Edit Post"
            disabled={isActionLoading}
          />
          <Popconfirm
            title="Delete Blog Post"
            description={`Are you sure you want to delete "${record.title}"?`}
            onConfirm={() => onDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ loading: isDeleting }}
            disabled={isActionLoading}
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              size="small"
              aria-label="Delete Post"
              title="Delete Post"
              disabled={isActionLoading}
            />
          </Popconfirm>
        </Space>
      ),
      width: 120,
      fixed: 'right',
      align: 'center',
    },
  ];

  return columns;
};
