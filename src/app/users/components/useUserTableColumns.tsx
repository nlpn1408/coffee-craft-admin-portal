"use client";

import React, { useRef, Key, useContext } from "react"; // Import useContext
import { User as ApiUser } from "@/types";
import { format } from "date-fns";
import { Button, Dropdown, Menu, Space, Tag, InputRef, message } from "antd";
import type { MenuProps, TableProps } from "antd";
import type { ColumnType } from 'antd/es/table/interface';
import { MoreOutlined } from "@ant-design/icons";
import { useColumnSearch } from "@/hooks/useColumnSearch";
import { USER_ROLES } from "@/lib/constants/constans";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth hook instead

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
}: UseUserTableColumnsProps): TableProps<User>["columns"] => {

  const getColumnSearchProps = useColumnSearch<User>();
  const { user: currentUser } = useAuth(); // Use the useAuth hook

  // --- Action Menu Logic ---
  const handleMenuClick = (e: { key: string }, user: User) => {
    // Only trigger actions if the menu item was actually rendered (role check in getMenuItems)
    if (e.key === 'copyId') {
       navigator.clipboard.writeText(user.id);
       message.success('User ID copied to clipboard');
    } else if (e.key === 'edit') {
       onEdit(user);
    } else if (e.key === 'deactivate') {
       console.warn("Deactivate action not implemented");
       // Add deactivate logic here, potentially calling a prop function
    } else if (e.key === 'details') {
       console.warn("Details view not implemented");
       // Add details view logic here
    } else {
        message.info(`Action '${e.key}' clicked for user ID: ${user.id}`);
    }
  };

  const getMenuItems = (user: User): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      { label: 'Copy User ID', key: 'copyId' },
      { label: 'View Details', key: 'details' },
    ];

    // Only add Edit and Deactivate if the current user is an ADMIN
    if (currentUser?.role === USER_ROLES.ADMIN.value) {
      items.push({ label: 'Edit User', key: 'edit' });
      items.push({ type: 'divider' });
      // Optional: Prevent admin from deactivating themselves
      if (currentUser.id !== user.id) {
        items.push({ label: 'Deactivate User', key: 'deactivate', danger: true });
      }
    }

    return items;
  };
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
      filters: roleFilters,
      onFilter: (value, record) => record.role === value,
      sorter: (a, b) => a.role.localeCompare(b.role),
      render: (role: string) => {
        const roleInfo = Object.values(USER_ROLES).find(r => r.value === role);
        const roleName = roleInfo?.name || role;
        let color = 'blue';
        if (role === USER_ROLES.ADMIN.value) color = 'volcano';
        if (role === USER_ROLES.STAFF.value) color = 'gold';
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
          {/* Render button only if there are items to show (besides copy/details if those are always shown) */}
          {/* Or always render and let the menu handle item visibility */}
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return columns;
};
