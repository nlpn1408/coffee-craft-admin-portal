"use client";

import React, { useState } from "react";
import { Button, Popconfirm, Space, Table, Upload, Spin } from "antd";
import type { TableProps, UploadProps } from "antd";
import {
  PlusOutlined,
  ExportOutlined,
  ImportOutlined,
  DownloadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { on } from "node:events";

// Generic type for data items, assuming they have an 'id'
interface DataItem {
  id: React.Key;
  [key: string]: any; // Allow other properties
}

interface GenericDataTableProps<T extends DataItem> {
  columns: TableProps<T>["columns"];
  dataSource: T[];
  rowKey?: keyof T | ((record: T) => React.Key);
  loading: boolean;
  entityName: string; // e.g., "Category", "Brand"
  uploadProps?: UploadProps;
  onCreate: () => void;
  onExport?: () => void;
  onDownloadTemplate?: () => void;
  onDeleteSelected?: (selectedIds: React.Key[]) => Promise<boolean>; // Make optional
  isActionLoading?: boolean; // General loading state for actions
  isDeleting?: boolean; // Specific loading state for delete actions
  isImporting?: boolean; // Specific loading state for import
}

export function GenericDataTable<T extends DataItem>({
  columns,
  dataSource,
  rowKey = "id",
  loading,
  entityName,
  uploadProps,
  onCreate,
  onExport,
  onDownloadTemplate,
  onDeleteSelected,
  isActionLoading = false,
  isDeleting = false,
  isImporting = false,
}: GenericDataTableProps<T>) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys);
    },
  };

  const hasSelected = selectedRowKeys.length > 0;

  const handleDelete = async () => {
    // Only proceed if the handler exists
    if (onDeleteSelected) {
        const success = await onDeleteSelected(selectedRowKeys);
        // Reset selection after delete is attempted (success/fail handled by parent)
        if (success) {
            setSelectedRowKeys([]);
        }
    } else {
        console.warn("onDeleteSelected handler is not provided to GenericDataTable.");
    }
  };

  return (
    <div className="flex flex-col space-y-4 p-4">
      {/* Toolbar */}
      <div className="flex justify-end items-center flex-wrap gap-2">
        <Space wrap>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreate}
            disabled={isActionLoading}
          >
            Create {entityName}
          </Button>
          {uploadProps && (
            <Upload {...uploadProps}>
              <Button
                icon={<ImportOutlined />}
                loading={isImporting}
                disabled={isActionLoading}
              >
                Import
              </Button>
            </Upload>
          )}
          {onExport && (
            <Button
              icon={<ExportOutlined />}
              onClick={onExport}
              disabled={isActionLoading}
            >
              Export
            </Button>
          )}
          {onDownloadTemplate && (
            <Button
              icon={<DownloadOutlined />}
              onClick={onDownloadTemplate}
              disabled={isActionLoading}
            >
              Template
            </Button>
          )}
          {/* Add other generic buttons here if needed */}
        </Space>
      </div>

      {/* Selected Rows Actions - Render only if onDeleteSelected is provided */}
      {hasSelected && onDeleteSelected && (
        <div className="flex justify-start items-center space-x-2 p-2 bg-blue-50 border border-blue-200 rounded">
          <span className="text-sm font-medium text-blue-700">
            {selectedRowKeys.length} selected
          </span>
          <Popconfirm
            title={`Delete ${selectedRowKeys.length} ${entityName}(s)`}
            description={`Are you sure you want to delete the selected ${entityName}(s)?`}
            // Directly assign handleDelete, as the parent block ensures onDeleteSelected exists
            onConfirm={handleDelete}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ loading: isDeleting }}
            disabled={!hasSelected || isActionLoading || !onDeleteSelected} // Disable if handler missing
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              size="small"
              disabled={!hasSelected || isActionLoading || !onDeleteSelected} // Disable if handler missing
            >
              Delete Selected
            </Button>
          </Popconfirm>
        </div>
      )}

      {/* Table */}
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey={rowKey}
          rowSelection={rowSelection}
          pagination={{
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          loading={loading}
          scroll={{ x: "max-content" }}
          size="small"
        />
      </Spin>
    </div>
  );
}
