"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Tag, NewTag } from "@/types";
import {
  useGetTagsQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
} from "@/state/services/tagService";
import { Button, Space, /*Table,*/ message, notification } from "antd"; // Removed Table
// import type { TableProps } from "antd"; // Removed TableProps
// import type { FilterValue, SorterResult } from "antd/es/table/interface"; // Removed FilterValue, SorterResult
import { PlusOutlined } from "@ant-design/icons";
// Use absolute path aliases
import CreateEditTagModal from "@/app/products/tag-management/CreateEditTagModal";
import { handleApiError } from "@/lib/api-utils";
import { useTagTableColumns } from "@/app/products/tag-management/useTagTableColumns";
import LoadingScreen from "@/components/LoadingScreen";
import { GenericDataTable } from "@/components/GenericDataTable/GenericDataTable"; // Import GenericDataTable

const GlobalTagManager = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  // Removed queryParams state as GenericDataTable handles client-side filtering/sorting/pagination
  // const [queryParams, setQueryParams] = useState<{ ... }>(...);

  const {
    data: tagsResponse, // Keep the response structure if API returns it
    isLoading, // Keep loading states
    isFetching,
    isError,
    refetch: refetchTags,
  } = useGetTagsQuery(); // Removed query parameters, fetch all tags

  const [createTag, { isLoading: isCreating }] = useCreateTagMutation();
  const [updateTag, { isLoading: isUpdating }] = useUpdateTagMutation();
  const [deleteTag, { isLoading: isDeleting }] = useDeleteTagMutation();

  const isActionLoading = isCreating || isUpdating;

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
        notification.success({
          message: "Success",
          description: `Tag "${data.name}" updated successfully`,
        });
      } else {
        await createTag(data).unwrap();
        notification.success({
          message: "Success",
          description: `Tag "${data.name}" created successfully`,
        });
      }
      handleCloseModal();
      refetchTags();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDeleteSingle = async (id: string): Promise<void> => {
    try {
      await deleteTag(id).unwrap();
      notification.success({
        message: "Success",
        description: "Tag deleted successfully",
      });
      // Always refetch after single delete
      refetchTags();
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  };

  // Add handler for deleting selected tags
  const handleDeleteSelected = async (selectedIds: React.Key[]): Promise<boolean> => {
    const key = "deleting_selected_tags";
    message.loading({
      content: `Deleting ${selectedIds.length} tags...`,
      key,
      duration: 0,
    });
    try {
      await Promise.all(
        selectedIds.map((id) => deleteTag(id as string).unwrap())
      );
      message.success({
        content: `${selectedIds.length} tags deleted successfully`,
        key,
      });
      // Refetch after delete
      refetchTags();
      // Note: Client-side pagination in GenericDataTable will adjust automatically
      return true; // Indicate success
    } catch (error) {
      message.error({ content: `Failed to delete selected tags`, key });
      handleApiError(error);
      return false; // Indicate failure
    }
  };

  // Removed handleTableChange as GenericDataTable handles pagination/sorting internally (client-side by default)
  // const handleTableChange: TableProps<Tag>["onChange"] = ( ... )

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
      {/* Use GenericDataTable */}
      <GenericDataTable<Tag>
        columns={columns}
        dataSource={tagsResponse?.data ?? []} // Provide default empty array
        loading={isFetching}
        entityName="Tag"
        onCreate={handleOpenCreateModal}
        onDeleteSelected={handleDeleteSelected}
        isActionLoading={isActionLoading || isDeleting} // Combine action loading states
        isDeleting={isDeleting}
        // Note: Pagination and onChange might be handled internally by GenericDataTable
        // If server-side pagination/filtering/sorting is needed, adjustments might be required.
        // Pass total for pagination if supported by GenericDataTable (assuming it handles internally)
        // totalItems={tagsResponse?.total} // Assuming GenericDataTable handles pagination internally based on dataSource length or its own props
      />

      {/* Keep Modal separate */}
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
