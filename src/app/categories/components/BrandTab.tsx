"use client";

import type { Brand } from "@/types";
import { NewBrand } from "@/types";
import {
  useCreateBrandMutation,
  useDeleteBrandMutation,
  useExportBrandsQuery,
  useGetBrandsQuery,
  useGetBrandTemplateQuery,
  useImportBrandsMutation,
  useUpdateBrandMutation,
} from "@/state/api";
import { useRef, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ActionColumn } from "@/components/TableActionRow/ActionColumn";
import { handleApiError, showSuccessToast } from "@/lib/api-utils";
import { DataTable } from "@/components/data-table/data-table";
import CreateBrandModal from "@/components/modals/CreateBrandModal";

const BrandTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ sortBy?: string; sortOrder?: 'asc' | 'desc' }>({});
  
  const { data: brands, isError, isLoading } = useGetBrandsQuery({
    search: searchTerm,
    ...sortConfig
  });
  const [createBrand, status] = useCreateBrandMutation();
  const [deleteBrand] = useDeleteBrandMutation();
  const [updateBrand] = useUpdateBrandMutation();
  const [importBrands] = useImportBrandsMutation();
  const { data: exportData, refetch: refetchExport } = useExportBrandsQuery(
    undefined,
    {
      skip: true,
    }
  );
  const { data: templateData, refetch: refetchTemplate } =
    useGetBrandTemplateQuery(undefined, {
      skip: true,
    });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (isError || !brands) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch brands
      </div>
    );
  }

  const handleCreateBrand = async (brandData: NewBrand) => {
    try {
      await createBrand(brandData).unwrap();
      showSuccessToast("Brand created successfully");
      setIsModalOpen(false);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleUpdateBrand = async (id: string, data: NewBrand) => {
    try {
      await updateBrand({ id, brand: data }).unwrap();
      showSuccessToast("Brand updated successfully");
      setIsModalOpen(false);
      setEditingBrand(null);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setBrandToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (brandToDelete) {
      try {
        await deleteBrand(brandToDelete).unwrap();
        showSuccessToast("Brand deleted successfully");
        setBrandToDelete(null);
        setDeleteDialogOpen(false);
      } catch (error) {
        handleApiError(error);
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedRows.length} brands?`
      )
    ) {
      try {
        for (const id of selectedRows) {
          await deleteBrand(id).unwrap();
        }
        showSuccessToast(`${selectedRows.length} brands deleted successfully`);
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
      a.download = "brands.xlsx";
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
      a.download = "brand_template.xlsx";
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
        await importBrands(formData).unwrap();
        showSuccessToast("Brands imported successfully");
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

  const columns: ColumnDef<Brand>[] = [
    // {
    //   accessorKey: "id",
    //   header: "ID",
    //   sortingFn: "alphanumeric"
    // },
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
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString(),
      sortingFn: "datetime"
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const brand = row.original;
        return (
          <ActionColumn
            onEdit={() => handleEdit(brand)}
            onDelete={() => handleDelete(brand.id)}
          />
        );
      },
      enableSorting: false
    },
  ];

  return (
    <div className="flex flex-col">
      <div className="mt-5">
        <DataTable
          columns={columns}
          data={brands}
          onRowSelectionChange={setSelectedRows}
          getRowId={(row) => row.id}
          searchField="name"
          onCreate={() => {
            setEditingBrand(null);
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

      <CreateBrandModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBrand(null);
        }}
        onCreate={
          editingBrand
            ? (data) => handleUpdateBrand(editingBrand.id, data)
            : handleCreateBrand
        }
        isSuccess={status.isSuccess}
        initialData={editingBrand}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Brand"
        description="Are you sure you want to delete this brand? This action cannot be undone."
      />
    </div>
  );
};

export default BrandTab; 