import React from 'react';
import { Button, Popconfirm, Space } from 'antd'; // Import Ant Design components
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'; // Import Ant Design icons

interface ActionColumnProps {
  onEdit: () => void;
  onDelete: () => void; // This will now trigger the Popconfirm
  // Add props for Popconfirm customization if needed
  deleteConfirmTitle?: string;
  deleteConfirmDescription?: string;
  isDeleteLoading?: boolean;
  // Add props to disable buttons
  isEditDisabled?: boolean;
  isDeleteDisabled?: boolean;
}

export function ActionColumn({
  onEdit,
  onDelete,
  deleteConfirmTitle = "Confirm Delete",
  deleteConfirmDescription = "Are you sure you want to delete this item?",
  isDeleteLoading = false,
  isEditDisabled = false, // Default to false
  isDeleteDisabled = false, // Default to false
}: ActionColumnProps) {
  return (
    <Space size="small">
      <Button
        icon={<EditOutlined />}
        onClick={onEdit}
        size="small"
        aria-label="Edit"
        title="Edit"
        disabled={isEditDisabled} // Use disabled prop
      />
      <Popconfirm
        title={deleteConfirmTitle}
        description={deleteConfirmDescription}
        onConfirm={onDelete} // Call the passed delete handler on confirmation
        okText="Yes"
        cancelText="No"
        okButtonProps={{ loading: isDeleteLoading }}
        disabled={isDeleteDisabled} // Disable Popconfirm trigger
      >
        <Button
          icon={<DeleteOutlined />}
          danger
          size="small"
          aria-label="Delete"
          title="Delete"
          loading={isDeleteLoading}
          disabled={isDeleteDisabled} // Disable button itself
        />
      </Popconfirm>
    </Space>
  );
}
