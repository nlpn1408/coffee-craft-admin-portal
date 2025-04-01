"use client";

import React, { useRef, Key } from "react";
import { User as ApiUser } from "@/types"; // Assuming User type is here or in @/types/api
import { format } from "date-fns";
import { Button, Dropdown, Menu, Space, Tag, InputRef, message } from "antd";
import type { MenuProps, TableProps } from "antd";
import type { ColumnType } from 'antd/es/table/interface';
import { MoreOutlined } from "@ant-design/icons";
import { useColumnSearch } from "@/hooks/useColumnSearch"; // Import the reusable search hook
import { USER_ROLES } from "@/lib/constants/constans"; // Import roles enum

// Define the User type used in this hook
interface User extends ApiUser {
  // Add any derived types if needed
}

type DataIndex = keyof User;

// Hook Arguments Interface
interface UseUserTableColumnsProps {
  onEdit: (user: User) => void;
  // Add other action handlers as needed (e.g., onDeactivate, onViewDetails)
}

export const useUserTableColumns = ({
  onEdit,
  // Add other handlers here
}: UseUserTableColumnsProps): TableProps<User>["columns"] => {

  // Use the hook to get the search props generator
  const getColumnSearchProps = useColumnSearch<User>();

  // --- Action Menu Logic ---
  const handleMenuClick = (e: { key: string }, user: User) => {
    message.info(`Action '${e.key}' clicked for user ID: ${user.id}`);
    if (e.key === 'copyId') {
       navigator.clipboard.writeText(user.id);
       message.success('User ID copied to clipboard');
    }
    if (e.key === 'edit') {
       onEdit(user); // Call the passed-in handler
    }
    // Add other action handlers
    if (e.key === 'deactivate') console.warn("Deactivate action not implemented");
    if (e.key === 'details') console.warn("Details view not implemented");
  };

  const getMenuItems = (user: User): MenuProps['items'] => [
    { label: 'Copy User ID', key: 'copyId' },
    { label: 'View Details', key: 'details' },
    { label: 'Edit User', key: 'edit' },
    { type: 'divider' },
    { label: 'Deactivate User', key: 'deactivate', danger: true },
  ];
  // --- End Action Menu Logic ---

  // --- Role Filter Logic ---
   const roleFilters = Object.values(USER_ROLES).map(role => ({
    text: role.name,
    value: role.value,
  }));
  // --- End Role Filter Logic ---

  const columns: TableProps<User>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      ...getColumnSearchProps('name'),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
      ...getColumnSearchProps('email'),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      filters: roleFilters, // Use dynamic filters
      onFilter: (value, record) => record.role === value,
      sorter: (a, b) => a.role.localeCompare(b.role),
      render: (role: string) => {
        // Find role name from enum for display, fallback to value
        const roleInfo = Object.values(USER_ROLES).find(r => r.value === role);
        const roleName = roleInfo?.name || role;
        // Assign color based on role value
        let color = 'blue'; // Default
        if (role === USER_ROLES.ADMIN.value) color = 'volcano';
        if (role === USER_ROLES.STAFF.value) color = 'gold'; // Example for Staff
        return <Tag color={color}>{roleName}</Tag>;
      }
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (createdAt: string) => format(new Date(createdAt), "MMM d, yyyy HH:mm"),
      width: 180,
    },
    {
      title: "Actions",
      key: "actions",
      align: 'center',
      width: 80,
      render: (_, record) => (
        <Dropdown overlay={<Menu items={getMenuItems(record)} onClick={(e) => handleMenuClick(e, record)} />}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return columns;
};
