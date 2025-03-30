"use client";

import type { Category } from "@/types";
import { NewCategory } from "@/types";
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useExportCategoriesQuery,
  useGetCategoriesQuery,
  useGetCategoryTemplateQuery,
  useImportCategoriesMutation,
  useUpdateCategoryMutation,
} from "@/state/api";
import { useRef, useState } from "react";
import CreateCategoryModal from "@/components/modals/CreateCategoryModal";
import { ColumnDef } from "@tanstack/react-table";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ActionColumn } from "@/components/TableActionRow/ActionColumn";
import { handleApiError, showSuccessToast } from "@/lib/api-utils";
import { DataTable } from "@/components/data-table/data-table";
import { dummyData } from "./dummy";
import LoadingScreen from "@/components/LoadingScreen";

const CategoryTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ sortBy?: string; sortOrder?: 'asc' | 'desc' }>({});
  
  const { data: categories, isError, isLoading } = useGetCategoriesQuery({
    search: searchTerm,
    ...sortConfig
  });
  const [createCategory, status] = useCreateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [importCategories] = useImportCategoriesMutation();
  const { data: exportData, refetch: refetchExport } = useExportCategoriesQuery(
    undefined,
    {
      skip: true,
    }
  );
  const { data: templateData, refetch: refetchTemplate } =
    useGetCategoryTemplateQuery(undefined, {
      skip: true,
    });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError || !categories) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch categories
      </div>
    );
  }

  const handleCreateCategory = async (categoryData: NewCategory) => {
    try {
      await createCategory(categoryData).unwrap();
      showSuccessToast("Category created successfully");
      setIsModalOpen(false);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleUpdateCategory = async (id: string, data: NewCategory) => {
    try {
      await updateCategory({ id, category: data }).unwrap();
      showSuccessToast("Category updated successfully");
      setIsModalOpen(false);
      setEditingCategory(null);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setCategoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (categoryToDelete) {
      try {
        await deleteCategory(categoryToDelete).unwrap();
        showSuccessToast("Category deleted successfully");
        setCategoryToDelete(null);
        setDeleteDialogOpen(false);
      } catch (error) {
        handleApiError(error);
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedRows.length} categories?`
      )
    ) {
      try {
        for (const id of selectedRows) {
          await deleteCategory(id).unwrap();
        }
        showSuccessToast(`${selectedRows.length} categories deleted successfully`);
        setSelectedRows([]);
      } catch (error) {
        handleApiError(error);
      }
    }
  };

  const handleExport = async () => {
    const result = await refetchExport();
    if (result.data) {
      const url = window.URL.createObjectURL(result.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "categories.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const handleDownloadTemplate = async () => {
    const result = await refetchTemplate();
    if (result.data) {
      const url = window.URL.createObjectURL(result.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "category_template.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        await importCategories(formData).unwrap();
        showSuccessToast("Categories imported successfully");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        handleApiError(error);
      }
    }
  };

  const handleSort = (field: string, order: 'asc' | 'desc') => {
    setSortConfig({ sortBy: field, sortOrder: order });
  };

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "id",
      header: "ID",
      sortingFn: "alphanumeric"
    },
    {
      accessorKey: "name",
      header: "Name",
      sortingFn: "alphanumeric"
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => row.getValue("description") || "N/A",
      sortingFn: "alphanumeric"
    },
    {
      accessorKey: "parentId",
      header: "Parent Category",
      cell: ({ row }) => row.getValue("parentId") || "None",
      sortingFn: "alphanumeric"
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString(),
      sortingFn: "datetime"
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const category = row.original;
        return (
          <ActionColumn
            onEdit={() => handleEdit(category)}
            onDelete={() => handleDelete(category.id)}
          />
        );
      },
      enableSorting: false
    },
  ];

  const createDummy = async () => {
    try {
      const formattedData = dummyData.map((item) => ({
        name: item.name,
        description: item.slug,
      }));
      for (const item of formattedData) {
        await createCategory(item).unwrap();
      }
      showSuccessToast("Dummy Categories created successfully");
    } catch (error) {
      handleApiError(error);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="mt-5">
        <DataTable
          columns={columns}
          data={categories}
          onRowSelectionChange={setSelectedRows}
          getRowId={(row) => row.id}
          searchField="name"
          onCreate={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
          onExport={handleExport}
          onImport={handleImport}
          onDownloadTemplate={handleDownloadTemplate}
          createButtonLabel="Create"
          selectedRows={selectedRows}
          onDeleteSelected={handleDeleteSelected}
          importRef={fileInputRef}
          onImportChange={handleFileChange}
          onSort={handleSort}
          enableClientSort={false}
        />
      </div>

      <button onClick={createDummy}> Create Dummy </button>

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
        isSuccess={status.isSuccess}
        parentCategories={categories}
        initialData={editingCategory}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
      />
    </div>
  );
};

export default CategoryTab;
