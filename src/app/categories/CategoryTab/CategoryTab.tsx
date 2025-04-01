"use client";

import React, { useState, useEffect } from "react"; // Removed useRef, useMemo, Key
import type { Category, NewCategory } from "@/types";
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useExportCategoriesQuery,
  useGetCategoriesQuery,
  useGetCategoryTemplateQuery,
  useImportCategoriesMutation,
  useUpdateCategoryMutation,
} from "@/state/api";
import {
  Button, // Keep Button for dummy data
  Upload,
  message,
  // Removed other Ant Design table/form components
} from "antd";
import type { UploadProps } from "antd";
// Removed Ant Design table/icon imports related to columns
import CreateCategoryModal from "./CreateCategoryModal";
import { handleApiError } from "@/lib/api-utils";
import { dummyData } from "../dummy"; // Corrected path
import { GenericDataTable } from "@/components/GenericDataTable/GenericDataTable"; // Import the new component
import { useCategoryTableColumns } from "./useCategoryTableColumns"; // Import the hook
import LoadingScreen from "@/components/LoadingScreen"; // Keep LoadingScreen

const CategoryTab = () => {
  // Fetch ALL categories
  const {
    data: allCategories = [],
    isError,
    isLoading,
    isFetching,
    refetch: refetchCategories, // Add refetch
  } = useGetCategoriesQuery();

  const [
    createCategory,
    { isLoading: isCreating, isSuccess: isCreateSuccess },
  ] = useCreateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();
  const [
    updateCategory,
    { isLoading: isUpdating, isSuccess: isUpdateSuccess },
  ] = useUpdateCategoryMutation();
  const [importCategories, { isLoading: isImporting }] =
    useImportCategoriesMutation();
  const { refetch: refetchExport } = useExportCategoriesQuery(undefined, {
    skip: true,
  });
  const { refetch: refetchTemplate } = useGetCategoryTemplateQuery(undefined, {
    skip: true,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Combined loading states
  const isDataLoading = isLoading || isFetching;
  const isActionLoading = isCreating || isDeleting || isUpdating || isImporting;

  // --- Handlers ---
  const handleCreateCategory = async (categoryData: NewCategory) => {
    try {
      await createCategory(categoryData).unwrap();
      message.success("Category created successfully");
      setIsModalOpen(false);
      refetchCategories(); // Refetch after create
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleUpdateCategory = async (id: string, data: NewCategory) => {
    try {
      await updateCategory({ id, category: data }).unwrap();
      message.success("Category updated successfully");
      setIsModalOpen(false);
      setEditingCategory(null);
      refetchCategories(); // Refetch after update
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  // Single delete is now handled within the hook's column definition,
  // but we need the mutation function for it.
  const handleDeleteSingle = async (id: string): Promise<void> => {
    try {
      await deleteCategory(id).unwrap();
      message.success("Category deleted successfully");
      refetchCategories(); // Refetch after delete
    } catch (error) {
      handleApiError(error);
      // Re-throw or handle error to potentially signal failure if needed
      throw error;
    }
  };

  // Corrected return type to Promise<boolean>
  const handleDeleteSelected = async (
    selectedIds: React.Key[]
  ): Promise<boolean> => {
    const key = "deleting_selected";
    message.loading({
      content: `Deleting ${selectedIds.length} categories...`,
      key,
      duration: 0,
    });
    try {
      await Promise.all(
        selectedIds.map((id) => deleteCategory(id as string).unwrap())
      );
      message.success({
        content: `${selectedIds.length} categories deleted successfully`,
        key,
      });
      refetchCategories();
      // Selection state is reset within GenericDataTable
      return true; // Indicate success
    } catch (error) {
      message.error({ content: `Failed to delete selected categories`, key });
      handleApiError(error);
      return false; // Indicate failure
    }
  };

  const handleExport = async () => {
    const key = "exporting";
    try {
      message.loading({ content: "Exporting categories...", key, duration: 0 });
      const result = await refetchExport();
      if (result.data instanceof Blob) {
        const url = window.URL.createObjectURL(result.data);
        const a = document.createElement("a");
        a.href = url;
        a.download = "categories.xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        message.success({ content: "Categories exported successfully", key });
      } else {
        throw new Error("Export failed: Invalid data received");
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      message.error({ content: `Export failed: ${errorMsg}`, key });
    }
  };

  const handleDownloadTemplate = async () => {
    const key = "downloading_template";
    try {
      message.loading({ content: "Downloading template...", key, duration: 0 });
      const result = await refetchTemplate();
      if (result.data instanceof Blob) {
        const url = window.URL.createObjectURL(result.data);
        const a = document.createElement("a");
        a.href = url;
        a.download = "category_template.xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        message.success({ content: "Template downloaded successfully", key });
      } else {
        throw new Error("Template download failed: Invalid data received");
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      message.error({ content: `Template download failed: ${errorMsg}`, key });
    }
  };

  const uploadProps: UploadProps = {
    name: "file",
    accept: ".xlsx, .xls",
    showUploadList: false,
    customRequest: async (options) => {
      const { file, onSuccess, onError } = options;
      const key = "importing";
      try {
        message.loading({
          content: "Importing categories...",
          key,
          duration: 0,
        });
        const formData = new FormData();
        formData.append("file", file as Blob);
        await importCategories(formData).unwrap();
        message.success({ content: "Categories imported successfully", key });
        if (onSuccess) onSuccess({}, file as any);
        refetchCategories(); // Refetch after import
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        message.error({ content: `Import failed: ${errorMsg}`, key });
        if (onError) onError(error as Error);
      }
    },
    disabled: isImporting,
  };

  // Get columns from the hook
  const columns = useCategoryTableColumns({
    allCategories,
    onEdit: handleEdit,
    onDelete: handleDeleteSingle, // Pass single delete handler
    isActionLoading,
    isDeleting,
  });

  // createDummy function remains the same
  const createDummy = async () => {
    const key = "creating_dummy";
    try {
      message.loading({
        content: "Creating dummy categories...",
        key,
        duration: 0,
      });
      const formattedData = dummyData.map((item) => ({
        name: item.name,
        description: item.slug, // Assuming slug maps to description for dummy data
        parentId: null, // Add parentId if needed by schema
      }));
      for (const item of formattedData) {
        await createCategory(item).unwrap();
      }
      message.success({
        content: "Dummy Categories created successfully",
        key,
      });
      refetchCategories(); // Refetch after creating dummy data
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      message.error({
        content: `Failed to create dummy categories: ${errorMsg}`,
        key,
      });
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError && !isLoading) {
    // Check isError after isLoading is false
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch categories. Please try again later.
      </div>
    );
  }

  return (
    <>
      <GenericDataTable
        columns={columns}
        dataSource={allCategories}
        loading={isDataLoading}
        entityName="Category"
        uploadProps={uploadProps}
        onCreate={() => {
          setEditingCategory(null);
          setIsModalOpen(true);
        }}
        onExport={handleExport}
        onDownloadTemplate={handleDownloadTemplate}
        onDeleteSelected={handleDeleteSelected} // Now matches Promise<boolean>
        isActionLoading={isActionLoading}
        isDeleting={isDeleting}
        isImporting={isImporting}
      />

      {/* Dummy data button - kept separate for now */}
      <div className="p-4 pt-0">
        {" "}
        {/* Add padding to match table */}
        <Button onClick={createDummy} danger disabled={isActionLoading}>
          {" "}
          Create Dummy Categories{" "}
        </Button>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <CreateCategoryModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCategory(null);
          }}
          onCreate={
            editingCategory
              ? (data) => handleUpdateCategory(editingCategory.id, data)
              : handleCreateCategory
          }
          isSuccess={isCreateSuccess || isUpdateSuccess}
          parentCategories={allCategories}
          initialData={editingCategory}
          isLoading={isCreating || isUpdating}
        />
      )}
    </>
  );
};

export default CategoryTab;
