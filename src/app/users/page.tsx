"use client";

import React, { useState, useEffect } from "react"; // Removed useMemo, useRef, Key
import Header from "@/components/Header";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "@/state/api";
import { User as ApiUser, NewUser } from "@/types";
// import { format } from "date-fns"; // Moved to hook
import { Button, message } from "antd"; // Removed Dropdown, Menu, Space, Tag, Input, InputRef
// import type { MenuProps, TableProps } from "antd"; // Moved to hook
// import type { ColumnType, FilterConfirmProps, FilterDropdownProps } from 'antd/es/table/interface'; // Moved to hook
// import { MoreOutlined, SearchOutlined } from "@ant-design/icons"; // Moved to hook
import { GenericDataTable } from "@/components/GenericDataTable/GenericDataTable";
import LoadingScreen from "@/components/LoadingScreen";
import CreateUserModal from "./components/CreateUserModal";
import { handleApiError } from "@/lib/api-utils";
import { useUserTableColumns } from "./components/useUserTableColumns"; // Import the hook

// Define the User type used in this component
interface User extends ApiUser {
  // status: "active" | "inactive"; // Example if status is added client-side
}

// Removed DataIndex type alias

const UsersPage = () => {
  const { data: users = [], isError, isLoading, refetch: refetchUsers } = useGetUsersQuery();

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
    if (!userData.name || !userData.email || !userData.password || !userData.role) {
        message.error("Name, Email, Password, and Role are required to create a user.");
        return;
    }
    const finalUserData = userData as NewUser;

    message.loading({ content: 'Creating user...', key: 'createUser' });
    try {
      await createUser(finalUserData).unwrap();
      message.success({ content: 'User created successfully', key: 'createUser' });
      setIsUserModalOpen(false);
      refetchUsers();
    } catch (error) {
      message.error({ content: 'Failed to create user', key: 'createUser' });
      handleApiError(error);
    }
  };

  const handleUpdateUser = async (id: string, userData: Partial<NewUser>) => {
    message.loading({ content: 'Updating user...', key: 'updateUser' });
    try {
      await updateUser({ id, ...userData }).unwrap();
      message.success({ content: 'User updated successfully', key: 'updateUser' });
      setIsUserModalOpen(false);
      setEditingUser(null);
      refetchUsers();
    } catch (error) {
      message.error({ content: 'Failed to update user', key: 'updateUser' });
      handleApiError(error);
    }
  };

   const handleDeleteSelected = async (selectedIds: React.Key[]): Promise<boolean> => {
    const key = "deleting_selected_users";
    message.loading({ content: `Deleting ${selectedIds.length} users...`, key, duration: 0 });
    try {
      await Promise.all(selectedIds.map(id => deleteUser(id as string).unwrap()));
      message.success({ content: `${selectedIds.length} users deleted successfully`, key });
      refetchUsers();
      return true; // Indicate success
    } catch (error) {
      message.error({ content: `Failed to delete selected users`, key });
      handleApiError(error);
      return false; // Indicate failure
    }
  };
  // --- End CRUD Handlers ---

  // --- Get Columns from Hook ---
  const columns = useUserTableColumns({
    onEdit: handleEditUserClick,
    // Pass other handlers if defined in the hook
  });
  // --- End Get Columns from Hook ---


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
        onDeleteSelected={handleDeleteSelected}
        isActionLoading={isActionLoading}
        isDeleting={isDeleting}
      />

      {/* Create/Edit User Modal */}
      {isUserModalOpen && (
          <CreateUserModal
            isOpen={isUserModalOpen}
            onClose={handleModalClose}
            onSubmit={editingUser ? (data) => handleUpdateUser(editingUser.id, data) : handleCreateUser}
            initialData={editingUser}
            isLoading={isCreating || isUpdating}
          />
      )}
    </div>
  );
};

export default UsersPage;
