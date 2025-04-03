"use client";

import React, { useState, useMemo, useEffect } from "react"; // Added useEffect
import { Tag, NewTag } from "@/types";
import {
  useGetTagsQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
} from "@/state/services/tagService";
import { Button, Space, Table, message } from "antd"; // Removed Input
import type { TableProps, TablePaginationConfig } from "antd";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import { PlusOutlined } from "@ant-design/icons";
import CreateEditTagModal from "./CreateEditTagModal";
import { handleApiError } from "@/lib/api-utils";
import { useTagTableColumns } from "./useTagTableColumns";
import LoadingScreen from "@/components/LoadingScreen";
// Removed useDebounce import and Search constant
// Removed const { Search } = Input;

const TagTab = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  // Removed searchTerm state

  const [queryParams, setQueryParams] = useState<{ // Added queryParams state
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
    search: queryParams.filters?.name?.[0] as string | undefined, // Use filters from queryParams
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
        message.success(`Tag "${data.name}" updated successfully`);
      } else {
        await createTag(data).unwrap();
        message.success(`Tag "${data.name}" created successfully`);
      }
      handleCloseModal();
      refetchTags(); // Refresh the tag list
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDeleteSingle = async (id: string): Promise<void> => {
    try {
      await deleteTag(id).unwrap();
      message.success("Tag deleted successfully");
      // If the deleted item was the last one on the current page, go back one page
      if (tags.length === 1 && queryParams.page > 1) { // Use queryParams.page
        setQueryParams(prev => ({ ...prev, page: prev.page - 1 })); // Update queryParams
      } else {
        refetchTags();
      }
    } catch (error) {
      handleApiError(error);
      throw error; // Re-throw for Popconfirm loading state
    }
  };

  // --- Table Change Handler ---
  const handleTableChange: TableProps<Tag>["onChange"] = (
    paginationConfig,
    filters, // Now using filters from Ant Design Table
    sorterResult
  ) => {
    const currentSorter = sorterResult as SorterResult<Tag>;
    setQueryParams(prev => ({
      ...prev,
      page: paginationConfig.current || 1,
      limit: paginationConfig.pageSize || 10,
      filters: filters, // Update filters from table state
      sortField: currentSorter.field as string | undefined,
      sortOrder: currentSorter.order === null ? undefined : currentSorter.order, // Handle null case for sortOrder
    }));
  };

  // --- Get Columns from Hook ---
  const columns = useTagTableColumns({
    onEdit: handleOpenEditModal,
    onDelete: handleDeleteSingle,
    isActionLoading: isActionLoading || isDeleting, // Disable actions if any mutation is loading
    isDeleting: isDeleting,
  });

  // Update pagination total when data changes
  useEffect(() => {
    // Update total in the pagination object within queryParams state
    setQueryParams(prev => ({
      ...prev,
      // We don't store total in queryParams, but we can update the pagination object
      // if we were storing it separately. Since we derive it for the Table,
      // this effect might not be strictly necessary anymore unless pagination
      // component itself needs the total directly.
      // For Ant Design's Table pagination prop, we'll construct it below.
    }));
  }, [totalTags]);


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
          {/* Removed Search Input */}
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
          pagination={{ // Construct pagination object for the Table
            current: queryParams.page,
            pageSize: queryParams.limit,
            total: totalTags,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          loading={isFetching} // Show table loading indicator on fetch/refetch/pagination/sort/filter
          onChange={handleTableChange} // Handle pagination, sorting, and filtering changes
          scroll={{ x: 'max-content' }} // Allow horizontal scroll if needed
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

export default TagTab;
