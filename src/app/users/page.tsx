"use client";

import React, { useMemo, useRef, useState, Key, useEffect } from "react";
import Header from "@/components/Header";
// Import actual mutation hooks
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "@/state/api";
import { User as ApiUser, NewUser } from "@/types";
import { format } from "date-fns";
import {
  Button,
  Dropdown,
  Menu,
  Space,
  Tag,
  Input,
  InputRef,
  message,
} from "antd";
import type { MenuProps, TableProps } from "antd";
import type {
  ColumnType,
  FilterConfirmProps,
  FilterDropdownProps,
} from "antd/es/table/interface";
import { MoreOutlined, SearchOutlined } from "@ant-design/icons";
import { GenericDataTable } from "@/components/GenericDataTable/GenericDataTable";
import LoadingScreen from "@/components/LoadingScreen";
import CreateUserModal from "./components/CreateUserModal";
import { handleApiError } from "@/lib/api-utils";
import { USER_ROLES } from "@/lib/constants/constans";

// Define the User type used in this component
interface User extends ApiUser {
  // status: "active" | "inactive"; // Example if status is added client-side
}

// Define type for search input ref
type DataIndex = keyof User;

const UsersPage = () => {
  const {
    data: users = [],
    isError,
    isLoading,
    refetch: refetchUsers,
  } = useGetUsersQuery();

  // Use actual mutation hooks
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Combined loading states for actions passed to GenericDataTable and Modal
  const isActionLoading = isCreating || isUpdating || isDeleting;

  // --- Modal Handlers ---
  const handleCreateUserClick = () => {
    setEditingUser(null);
    setIsUserModalOpen(true);
  };

  const handleEditUserClick = (user: User) => {
    setEditingUser(user);
    setIsUserModalOpen(true);
  };

  const handleModalClose = () => {
    setIsUserModalOpen(false);
    setEditingUser(null);
  };

  // --- CRUD Handlers ---
  const handleCreateUser = async (userData: Partial<NewUser>) => {
    if (
      !userData.name ||
      !userData.email ||
      !userData.password ||
      !userData.role
    ) {
      message.error(
        "Name, Email, Password, and Role are required to create a user."
      );
      return;
    }
    const finalUserData = userData as NewUser;

    message.loading({ content: "Creating user...", key: "createUser" });
    try {
      await createUser(finalUserData).unwrap();
      message.success({
        content: "User created successfully",
        key: "createUser",
      });
      setIsUserModalOpen(false);
      refetchUsers();
    } catch (error) {
      message.error({ content: "Failed to create user", key: "createUser" });
      handleApiError(error);
    }
  };

  const handleUpdateUser = async (id: string, userData: Partial<NewUser>) => {
    message.loading({ content: "Updating user...", key: "updateUser" });
    try {
      await updateUser({ id, ...userData }).unwrap();
      message.success({
        content: "User updated successfully",
        key: "updateUser",
      });
      setIsUserModalOpen(false);
      setEditingUser(null);
      refetchUsers();
    } catch (error) {
      message.error({ content: "Failed to update user", key: "updateUser" });
      handleApiError(error);
    }
  };

  const handleDeleteSelected = async (
    selectedIds: React.Key[]
  ): Promise<boolean> => {
    const key = "deleting_selected_users";
    message.loading({
      content: `Deleting ${selectedIds.length} users...`,
      key,
      duration: 0,
    });
    try {
      // Use Promise.all for potentially faster deletion if API supports concurrent requests
      await Promise.all(
        selectedIds.map((id) => deleteUser(id as string).unwrap())
      );
      message.success({
        content: `${selectedIds.length} users deleted successfully`,
        key,
      });
      refetchUsers();
      // Selection state is reset within GenericDataTable
      return true; // Indicate success
    } catch (error) {
      message.error({ content: `Failed to delete selected users`, key });
      handleApiError(error); // Handle potential errors from Promise.all
      return false; // Indicate failure
    }
  };
  // --- End CRUD Handlers ---

  // --- Column Search Logic ---
  const searchInput = useRef<InputRef>(null);
  const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<User> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }: FilterDropdownProps) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${String(dataIndex)}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => confirm({ closeDropdown: false })}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => confirm({ closeDropdown: false })}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && clearFilters()}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value: Key | boolean, record: User) => {
      const stringValue = String(value).toLowerCase();
      const recordValue = record[dataIndex];
      return recordValue
        ? recordValue.toString().toLowerCase().includes(stringValue)
        : false;
    },
    onFilterDropdownOpenChange: (visible: boolean) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text: any) => text,
  });
  // --- End Column Search Logic ---

  // --- Action Menu ---
  const handleMenuClick = (e: { key: string }, user: User) => {
    if (e.key === "edit") {
      return handleEditUserClick(user);
    }
    message.info(`Action '${e.key}' clicked for user ID: ${user.id}`);
    if (e.key === "copyId") {
      navigator.clipboard.writeText(user.id);
      message.success("User ID copied to clipboard");
    }
  };

  const getMenuItems = (user: User): MenuProps["items"] => [
    { label: "Copy User ID", key: "copyId" },
    { label: "Edit User", key: "edit" },
    { type: "divider" },
    { label: "Deactivate User", key: "deactivate", danger: true },
  ];
  // --- End Action Menu ---

  const columns: TableProps<User>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      ...getColumnSearchProps("name"),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
      ...getColumnSearchProps("email"),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      filters: Object.entries(USER_ROLES).map(([key, role]) => ({
        text: role.name,
        value: role.value,
      })),
      onFilter: (value, record) => record.role === value,
      sorter: (a, b) => a.role.localeCompare(b.role),
      render: (role: string) => (
        <Tag
          color={
            role === USER_ROLES.ADMIN.value
              ? "red"
              : role === USER_ROLES.STAFF.value
              ? "blue"
              : "green"
          }
        >
          {role}
        </Tag>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (createdAt: string) =>
        format(new Date(createdAt), "MMM d, yyyy HH:mm"),
      width: 180,
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      width: 80,
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu
              items={getMenuItems(record)}
              onClick={(e) => handleMenuClick(e, record)}
            />
          }
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError || !users) {
    return (
      <div className="text-center text-red-500 py-4">Failed to fetch users</div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header name="Users" />
      {/* Use GenericDataTable */}
      <GenericDataTable
        columns={columns}
        dataSource={users}
        loading={isLoading}
        entityName="User"
        onCreate={handleCreateUserClick}
        onDeleteSelected={handleDeleteSelected} // Now matches Promise<boolean>
        isActionLoading={isActionLoading}
        isDeleting={isDeleting} // Pass specific deleting state for bulk delete button
      />

      {/* Create/Edit User Modal */}
      {isUserModalOpen && (
        <CreateUserModal
          isOpen={isUserModalOpen}
          onClose={handleModalClose}
          onSubmit={
            editingUser
              ? (data) => handleUpdateUser(editingUser.id, data)
              : handleCreateUser
          }
          initialData={editingUser}
          isLoading={isCreating || isUpdating}
        />
      )}
    </div>
  );
};

export default UsersPage;
