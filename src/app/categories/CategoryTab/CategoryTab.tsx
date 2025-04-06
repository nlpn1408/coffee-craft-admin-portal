"use client";

import React, { useState, useEffect, useMemo } from "react"; // Added useMemo
import type { Category, NewCategory } from "@/types";
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery, // Keep standard query hook
  useImportCategoriesMutation,
  useUpdateCategoryMutation,
  // Import lazy query hooks for on-demand actions
  useLazyExportCategoriesQuery,
  useLazyGetCategoryTemplateQuery,
} from "@/state/services/categoryService";
import {
  Button,
  Upload,
  message,
} from "antd";
import type { UploadProps } from "antd";
import CreateCategoryModal from "./CreateCategoryModal";
import { handleApiError } from "@/lib/api-utils";
import { dummyData } from "../dummy";
import { GenericDataTable } from "@/components/GenericDataTable/GenericDataTable";
import { useCategoryTableColumns } from "./useCategoryTableColumns";
import LoadingScreen from "@/components/LoadingScreen";

const CategoryTab = () => {
  // Fetch ALL categories (now expects paginated response)
  const {
    data: categoriesResponse, // Rename data
    isError,
    isLoading,
    isFetching,
    refetch: refetchCategories,
  } = useGetCategoriesQuery({}); // Pass empty object or required params

  // Extract categories array and total from response using useMemo
  const allCategories = useMemo(() => categoriesResponse?.data ?? [], [categoriesResponse]);
  const totalCategories = useMemo(() => categoriesResponse?.total ?? 0, [categoriesResponse]); // Get total if needed

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
  const [importCategories, { isLoading: isImporting }] = useImportCategoriesMutation();
  // Use correct lazy query hooks
  const [triggerExport, { isFetching: isExporting }] = useLazyExportCategoriesQuery();
  const [triggerTemplate, { isFetching: isDownloadingTemplate }] = useLazyGetCategoryTemplateQuery();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Combined loading states
  const isDataLoading = isLoading || isFetching;
  // Include export/template fetching states in action loading
  const isActionLoading = isCreating || isDeleting || isUpdating || isImporting || isExporting || isDownloadingTemplate;

  // --- Handlers ---
  const handleCreateCategory = async (categoryData: NewCategory) => {
    try {
      await createCategory(categoryData).unwrap();
      message.success("Category created successfully");
      setIsModalOpen(false);
      refetchCategories();
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
      refetchCategories();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteSingle = async (id: string): Promise<void> => {
    try {
      await deleteCategory(id).unwrap();
      message.success("Category deleted successfully");
      refetchCategories();
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  };

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
      return true;
    } catch (error) {
      message.error({ content: `Failed to delete selected categories`, key });
      handleApiError(error);
      return false;
    }
  };

  const handleExport = async () => {
    const key = "exporting";
    try {
      message.loading({ content: "Exporting categories...", key, duration: 0 });
      const result = await triggerExport().unwrap();
      const url = window.URL.createObjectURL(result);
      const a = document.createElement("a");
      a.href = url;
      a.download = "categories.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      message.success({ content: "Categories exported successfully", key });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      message.error({ content: `Export failed: ${errorMsg}`, key });
    }
  };

  const handleDownloadTemplate = async () => {
    const key = "downloading_template";
    try {
      message.loading({ content: "Downloading template...", key, duration: 0 });
      const result = await triggerTemplate().unwrap();
      const url = window.URL.createObjectURL(result);
      const a = document.createElement("a");
      a.href = url;
      a.download = "category_template.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      message.success({ content: "Template downloaded successfully", key });
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
        refetchCategories();
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        message.error({ content: `Import failed: ${errorMsg}`, key });
        if (onError) onError(error as Error);
      }
    },
    disabled: isImporting,
  };

  const columns = useCategoryTableColumns({
    allCategories, // Pass the extracted array
    onEdit: handleEdit,
    onDelete: handleDeleteSingle,
    isActionLoading,
    isDeleting,
  });

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
        description: item.slug,
        parentId: null,
      }));
      for (const item of formattedData) {
        await createCategory(item).unwrap();
      }
      message.success({
        content: "Dummy Categories created successfully",
        key,
      });
      refetchCategories();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      message.error({
        content: `Failed to create dummy categories: ${errorMsg}`,
        key,
      });
    }
  };


  if (isError && !isLoading) {
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
        dataSource={allCategories} // Use the extracted array
        loading={isFetching} // Use isFetching for table loading state
        entityName="Category"
        uploadProps={uploadProps}
        onCreate={() => {
          setEditingCategory(null);
          setIsModalOpen(true);
        }}
        onExport={handleExport}
        onDownloadTemplate={handleDownloadTemplate}
        onDeleteSelected={handleDeleteSelected}
        isActionLoading={isActionLoading}
        isDeleting={isDeleting}
        isImporting={isImporting}
        // Add pagination config if GenericDataTable supports it
        // pagination={{ total: totalCategories, /* other props */ }}
      />

      {/* <div className="p-4 pt-0">
        <Button onClick={createDummy} danger disabled={isActionLoading}>
          Create Dummy Categories
        </Button>
      </div> */}

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
          parentCategories={allCategories} // Pass the extracted array
          initialData={editingCategory}
          isLoading={isCreating || isUpdating}
        />
      )}
    </>
  );
};

export default CategoryTab;
