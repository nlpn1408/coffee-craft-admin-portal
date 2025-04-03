"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Tag, NewTag } from "@/types";
import {
  useGetTagsQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
} from "@/state/services/tagService";
import { Button, Space, Table, message, notification } from "antd"; // Use notification
import type { TableProps } from "antd";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import { PlusOutlined } from "@ant-design/icons";
import CreateEditTagModal from "./CreateEditTagModal"; // Re-use the existing modal
import { handleApiError } from "@/lib/api-utils";
import { useTagTableColumns } from "./useTagTableColumns"; // Re-use the columns hook
import LoadingScreen from "@/components/LoadingScreen";

const GlobalTagManager = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const [queryParams, setQueryParams] = useState<{
    page: number;
    limit: number;
    filters: Record<string, FilterValue | null>;
    sortField?: string;
    sortOrder?: "ascend" | "descend";
  }>({
    page: 1,
    limit: 10,
    filters: {},
  });

  // Fetch Tags using RTK Query
  const {
    data: tagsResponse,
    isLoading,
    isFetching,
    isError,
    refetch: refetchTags,
  } = useGetTagsQuery({
    page: queryParams.page,
    limit: queryParams.limit,
    search: queryParams.filters?.name?.[0] as string | undefined,
    sortBy: queryParams.sortField,
    sortOrder:
      queryParams.sortOrder === "ascend"
        ? "asc"
        : queryParams.sortOrder === "descend"
        ? "desc"
        : undefined,
  });

  const tags = useMemo(() => tagsResponse?.data ?? [], [tagsResponse]);
  const totalTags = useMemo(() => tagsResponse?.total ?? 0, [tagsResponse]);

  // Mutations
  const [createTag, { isLoading: isCreating }] = useCreateTagMutation();
  const [updateTag, { isLoading: isUpdating }] = useUpdateTagMutation();
  const [deleteTag, { isLoading: isDeleting }] = useDeleteTagMutation();

  const isActionLoading = isCreating || isUpdating; // Loading state for create/update actions

  // --- Handlers ---
  const handleOpenCreateModal = () => {
    setEditingTag(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tag: Tag) => {
    setEditingTag(tag);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTag(null);
  };

  const handleSaveTag = async (data: NewTag) => {
    try {
      if (editingTag) {
        await updateTag({ id: editingTag.id, body: data }).unwrap();
        notification.success({ message: "Success", description: `Tag "${data.name}" updated successfully` });
      } else {
        await createTag(data).unwrap();
        notification.success({ message: "Success", description: `Tag "${data.name}" created successfully` });
      }
      handleCloseModal();
      refetchTags(); // Refresh the tag list
    } catch (error) {
      handleApiError(error); // Remove notification argument
    }
  };

  const handleDeleteSingle = async (id: string): Promise<void> => {
    try {
      await deleteTag(id).unwrap();
      notification.success({ message: "Success", description: "Tag deleted successfully" });
      // If the deleted item was the last one on the current page, go back one page
      if (tags.length === 1 && queryParams.page > 1) {
        setQueryParams(prev => ({ ...prev, page: prev.page - 1 }));
      } else {
        refetchTags();
      }
    } catch (error) {
      handleApiError(error); // Remove notification argument
      throw error; // Re-throw for Popconfirm loading state
    }
  };

  // --- Table Change Handler ---
  const handleTableChange: TableProps<Tag>["onChange"] = (
    paginationConfig,
    filters,
    sorterResult
  ) => {
    const currentSorter = sorterResult as SorterResult<Tag>;
    setQueryParams(prev => ({
      ...prev,
      page: paginationConfig.current || 1,
      limit: paginationConfig.pageSize || 10,
      filters: filters,
      sortField: currentSorter.field as string | undefined,
      sortOrder: currentSorter.order === null ? undefined : currentSorter.order,
    }));
  };

  // --- Get Columns from Hook ---
  const columns = useTagTableColumns({
    onEdit: handleOpenEditModal,
    onDelete: handleDeleteSingle,
    isActionLoading: isActionLoading || isDeleting,
    isDeleting: isDeleting,
  });

  if (isLoading && !isFetching) {
    return <LoadingScreen />;
  }

  if (isError && !isLoading) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch tags. Please try again later.
      </div>
    );
  }

  return (
    <>
      <div className="p-4 space-y-4">
        {/* Toolbar */}
        <div className="flex justify-end items-center flex-wrap gap-2">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreateModal}
            disabled={isActionLoading}
          >
            Create Tag
          </Button>
        </div>

        {/* Table */}
        <Table<Tag>
          columns={columns}
          dataSource={tags}
          rowKey="id"
          pagination={{
            current: queryParams.page,
            pageSize: queryParams.limit,
            total: totalTags,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          loading={isFetching}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
          size="small"
        />
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <CreateEditTagModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSaveTag}
          initialData={editingTag || undefined}
          isLoading={isCreating || isUpdating}
        />
      )}
    </>
  );
};

export default GlobalTagManager;
