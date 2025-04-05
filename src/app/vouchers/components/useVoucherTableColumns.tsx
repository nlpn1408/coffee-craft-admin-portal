"use client";

import React from 'react';
import { Voucher, VoucherType } from '@/types';
import { TableColumnsType, Tag as AntTag, Space, Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/utils'; // Assuming currency formatter exists

// Hook Arguments Interface
interface UseVoucherTableColumnsProps {
  onEdit: (voucher: Voucher) => void;
  onDelete: (id: string) => Promise<void>;
  isActionLoading?: boolean;
  isDeleting?: boolean;
}

export const useVoucherTableColumns = ({
  onEdit,
  onDelete,
  isActionLoading = false,
  isDeleting = false,
}: UseVoucherTableColumnsProps): TableColumnsType<Voucher> => {

  // TODO: Add useColumnSearch hook if needed for code searching

  const columns: TableColumnsType<Voucher> = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      sorter: true,
      // Add search props if needed: ...getColumnSearchProps('code'),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      filters: [
        { text: 'Percentage', value: VoucherType.PERCENT },
        { text: 'Fixed Amount', value: VoucherType.FIXED },
      ],
      render: (type: VoucherType) => (
        <AntTag color={type === VoucherType.PERCENT ? 'blue' : 'green'}>
          {type === VoucherType.PERCENT ? 'Percentage' : 'Fixed Amount'}
        </AntTag>
      ),
      width: 150,
    },
    {
      title: 'Value',
      key: 'value',
      render: (_, record: Voucher) => {
        if (record.type === VoucherType.PERCENT) {
          return `${record.discountPercent}%` + (record.maxDiscount ? ` (Max: ${formatCurrency(record.maxDiscount)})` : '');
        } else if (record.type === VoucherType.FIXED) {
          return formatCurrency(record.discountAmount ?? 0);
        }
        return '-';
      },
      align: 'right',
    },
     {
      title: 'Min Order',
      dataIndex: 'minimumOrderValue',
      key: 'minimumOrderValue',
      sorter: true,
      render: (value) => value ? formatCurrency(value) : '-',
      align: 'right',
      width: 130,
    },
    {
      title: 'Usage',
      key: 'usage',
      render: (_, record: Voucher) => `${record.usedCount} / ${record.usageLimit ?? '∞'}`,
      align: 'center',
      width: 100,
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      sorter: true,
      render: (date: string | Date) => format(new Date(date), 'dd/MM/yyyy HH:mm'),
      width: 160,
      align: 'center',
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      sorter: true,
      render: (date: string | Date) => format(new Date(date), 'dd/MM/yyyy HH:mm'),
      width: 160,
      align: 'center',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      sorter: true,
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      render: (active: boolean) => (
        <AntTag color={active ? 'success' : 'error'}>
          {active ? 'Active' : 'Inactive'}
        </AntTag>
      ),
      width: 100,
      align: 'center',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: Voucher) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            size="small"
            aria-label="Edit Voucher"
            disabled={isActionLoading}
          />
          <Popconfirm
            title="Delete Voucher"
            description={`Are you sure you want to delete voucher "${record.code}"?`}
            onConfirm={() => onDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ loading: isDeleting }}
            disabled={isActionLoading}
          >
            <Button icon={<DeleteOutlined />} danger size="small" aria-label="Delete Voucher" disabled={isActionLoading}/>
          </Popconfirm>
        </Space>
      ),
      width: 100,
      fixed: 'right',
      align: 'center',
    },
  ];

  return columns;
};
