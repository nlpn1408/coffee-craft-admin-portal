"use client";

import React, { useState, useCallback, useMemo } from "react"; // Import useMemo
import { Button, Card, message, Spin, Modal as AntModal, notification } from "antd"; // Import notification
import type { TableProps, TablePaginationConfig } from "antd"; // Import table types
import type { FilterValue, SorterResult } from "antd/es/table/interface"; // Import table types
import { PlusOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "@/state/services/userService"; // Import delete hook
import { useUserTableColumns } from "./components/useUserTableColumns";
import { GenericDataTable } from "@/components/GenericDataTable/GenericDataTable";
import { User, NewUser } from "@/types";
import CreateUserModal from "./components/CreateUserModal";
import UserDetailModal from "./components/UserDetailModal";
import Header from "@/components/Header";
import { handleApiError } from "@/lib/api-utils"; // Import handleApiError

const { confirm } = AntModal;

export default function UsersPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation(); // Use delete hook

  // State for pagination, sorting, filtering (similar to other list pages)
  const [queryParams, setQueryParams] = useState<{
    page: number;
    limit: number;
    filters: Record<string, FilterValue | null>;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    // Add other specific filters like role, isActive if needed
  }>({
    page: 1,
    limit: 10,
    filters: {},
  });


  const {
    data: usersResponse, // Rename data
    isLoading: isLoadingUsers,
    isFetching: isFetchingUsers, // Add isFetching
    isError,
    refetch,
  } = useGetUsersQuery({ // Pass queryParams
      page: queryParams.page,
      limit: queryParams.limit,
      sortBy: queryParams.sortBy,
      sortOrder: queryParams.sortOrder,
      filters: queryParams.filters,
      // Pass other specific filters if added to state
  }, {
    refetchOnMountOrArgChange: true,
  });

  // Extract data and total
  const usersData = useMemo(() => usersResponse?.data ?? [], [usersResponse]);
  const totalUsers = useMemo(() => usersResponse?.total ?? 0, [usersResponse]);


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
      message.error(
        `Failed to save user: ${
          error.data?.message || error.message || "Unknown error"
        }`
      );
    }
  };

  // Handler for deleting a single user
  const handleDeleteUser = useCallback(
    (userId: string) => {
      confirm({
        title: "Are you sure you want to delete this user?",
        icon: <ExclamationCircleFilled />,
        content: "This action cannot be undone.",
        okText: "Yes, Delete",
        okType: "danger",
        cancelText: "No",
        onOk: async () => {
          try {
            await deleteUser(userId).unwrap();
            message.success("User deleted successfully!");
            refetch(); // Refetch the user list
          } catch (error: any) {
            console.error("Failed to delete user:", error);
            message.error(
              `Failed to delete user: ${
                error.data?.message || error.message || "Unknown error"
              }`
            );
          }
        },
        onCancel() {
          console.log("Delete cancelled");
        },
      });
    },
    [deleteUser, refetch, usersData, queryParams.page] // Add dependencies
  );

  // Handler for deleting selected rows
  const handleDeleteSelected = async (selectedIds: React.Key[]): Promise<boolean> => {
    // Implement bulk delete confirmation and API call if available
    // For now, similar logic to single delete but mapping over IDs
    const key = "deleting_selected_users";
    message.loading({ content: `Deleting ${selectedIds.length} users...`, key, duration: 0 });
    try {
      // Assuming deleteUser handles single ID, map over selectedIds
      // If a bulk delete endpoint exists, call that instead
      await Promise.all(selectedIds.map(id => deleteUser(id as string).unwrap()));
      message.success({ content: `${selectedIds.length} users deleted successfully`, key });
      refetch(); // Refetch list
      return true; // Indicate success
    } catch (error: any) {
      message.error({ content: `Failed to delete selected users`, key });
      handleApiError(error);
      return false; // Indicate failure
    }
  };

  const columns = useUserTableColumns({
    onEdit: handleOpenCreateModal,
    onViewDetails: handleOpenDetailModal,
    onDelete: handleDeleteUser,
    // Pass other props if needed by the columns hook (e.g., for filters)
  });

  // Table change handler for server-side pagination/sort/filter
  const handleTableChange: TableProps<User>["onChange"] = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<User> | SorterResult<User>[]
  ) => {
    const currentSorter = Array.isArray(sorter) ? sorter[0] : sorter;
    setQueryParams(prev => ({
      ...prev,
      page: pagination.current || 1,
      limit: pagination.pageSize || 10,
      filters: filters,
      sortBy: currentSorter?.field as string | undefined,
      sortOrder: currentSorter?.order === null ? undefined : (currentSorter?.order === 'ascend' ? 'asc' : 'desc'),
      // Extract other filters if added
      isActive: filters.isActive?.[0] as boolean | undefined,
      role: filters.role?.[0] as string | undefined,
    }));
  };


  if (isError) {
    message.error("Failed to load users.");
  }

  // Combine all mutation loading states for generic actions if needed
  const isLoadingMutation = isCreating || isUpdating || isDeleting;

  return (
    <>
      <Header name="Users" />
      <GenericDataTable<User>
        columns={columns}
        dataSource={usersData} // Use extracted array
        loading={isFetchingUsers} // Use isFetching for loading state
        entityName="User"
        onCreate={() => handleOpenCreateModal()}
        onDeleteSelected={handleDeleteSelected} // Pass bulk delete handler
        isActionLoading={isLoadingMutation}
        isDeleting={isDeleting}
        // Pass pagination and onChange for server-side handling
        pagination={{
            current: queryParams.page,
            pageSize: queryParams.limit,
            total: totalUsers, // Use total from response
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        onChange={handleTableChange}
      />

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
    </>
  );
}
