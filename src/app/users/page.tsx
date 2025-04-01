"use client";

import React, { useState, useCallback } from "react";
import { Button, Card, message, Spin, Modal as AntModal } from "antd"; // Import AntModal for confirmation
import { PlusOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { useGetUsersQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation } from "@/state/services/userService"; // Import delete hook
import { useUserTableColumns } from "./components/useUserTableColumns";
import { GenericDataTable } from "@/components/GenericDataTable/GenericDataTable";
import { User, NewUser } from "@/types";
import CreateUserModal from "./components/CreateUserModal";
import UserDetailModal from "./components/UserDetailModal";

const { confirm } = AntModal; // Destructure confirm modal

export default function UsersPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation(); // Use delete hook

  const {
    data: usersData,
    isLoading: isLoadingUsers,
    isError,
    refetch,
  } = useGetUsersQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const handleOpenCreateModal = useCallback((user: User | null = null) => {
    setEditingUser(user);
    setIsCreateModalOpen(true);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
    setEditingUser(null);
  }, []);

  const handleOpenDetailModal = useCallback((userId: string) => {
    setViewingUserId(userId);
    setIsDetailModalOpen(true);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setViewingUserId(null);
  }, []);

  const handleCreateSubmit = async (values: Partial<NewUser>) => {
    try {
      if (editingUser) {
        await updateUser({ id: editingUser.id, ...values }).unwrap();
        message.success("User updated successfully!");
      } else {
        await createUser(values as NewUser).unwrap();
        message.success("User created successfully!");
      }
      handleCloseCreateModal();
      refetch();
    } catch (error: any) {
      console.error("Failed to save user:", error);
      message.error(`Failed to save user: ${error.data?.message || error.message || 'Unknown error'}`);
    }
  };

  // Handler for deleting a single user
  const handleDeleteUser = useCallback((userId: string) => {
    confirm({
      title: 'Are you sure you want to delete this user?',
      icon: <ExclamationCircleFilled />,
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await deleteUser(userId).unwrap();
          message.success("User deleted successfully!");
          refetch(); // Refetch the user list
        } catch (error: any) {
          console.error("Failed to delete user:", error);
          message.error(`Failed to delete user: ${error.data?.message || error.message || 'Unknown error'}`);
        }
      },
      onCancel() {
        console.log('Delete cancelled');
      },
    });
  }, [deleteUser, refetch]); // Add dependencies

   // Handler for deleting selected rows (placeholder)
   const handleDeleteSelected = async (selectedIds: React.Key[]) => {
    // Bulk delete might need a different confirmation/API call
    console.log("Attempting to delete selected user IDs:", selectedIds);
    await new Promise(resolve => setTimeout(resolve, 500));
    message.warning("Bulk user deletion not implemented.");
    return false;
  };

  const columns = useUserTableColumns({
    onEdit: handleOpenCreateModal,
    onViewDetails: handleOpenDetailModal,
    onDelete: handleDeleteUser, // Pass the delete handler
  });

  if (isError) {
    message.error("Failed to load users.");
  }

  // Combine all mutation loading states for generic actions if needed
  const isLoadingMutation = isCreating || isUpdating || isDeleting;

  return (
    <Card
      title="Manage Users"
      variant="borderless"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleOpenCreateModal()}
        >
          Create User
        </Button>
      }
    >
      <Spin spinning={isLoadingUsers}>
        <GenericDataTable<User>
          columns={columns}
          dataSource={usersData ?? []}
          loading={isLoadingUsers}
          entityName="User"
          onCreate={() => handleOpenCreateModal()}
          onDeleteSelected={handleDeleteSelected} // Keep placeholder for bulk delete button
          // Pass loading states
          isActionLoading={isLoadingMutation} // General loading for toolbar buttons
          isDeleting={isDeleting} // Specific loading for delete confirmation
        />
      </Spin>

      {/* Create/Edit Modal */}
      {isCreateModalOpen && (
        <CreateUserModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          onSubmit={handleCreateSubmit}
          initialData={editingUser}
          isLoading={isCreating || isUpdating} // Pass relevant loading state
        />
      )}

       {/* Detail Modal */}
      {isDetailModalOpen && viewingUserId && (
        <UserDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          userId={viewingUserId}
        />
      )}
    </Card>
  );
}
