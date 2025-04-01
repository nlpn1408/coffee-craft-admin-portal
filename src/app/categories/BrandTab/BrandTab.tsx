"use client";

import React, { useState, useEffect } from "react"; // Removed useRef, useMemo, Key
import type { Brand, NewBrand } from "@/types";
import {
  useCreateBrandMutation,
  useDeleteBrandMutation,
  useExportBrandsQuery,
  useGetBrandsQuery,
  useGetBrandTemplateQuery,
  useImportBrandsMutation,
  useUpdateBrandMutation,
} from "@/state/api";
import {
  Upload,
  message,
  // Removed other Ant Design components
} from "antd";
import type { UploadProps } from "antd";
// Removed Ant Design table/icon imports related to columns
import CreateBrandModal from "./CreateBrandModal";
import { handleApiError } from "@/lib/api-utils";
import { GenericDataTable } from "@/components/GenericDataTable/GenericDataTable";
import { useBrandTableColumns } from "./useBrandTableColumns"; // Import the hook
import LoadingScreen from "@/components/LoadingScreen";

const BrandTab = () => {
  // Fetch ALL brands
  const {
    data: allBrands = [],
    isError,
    isLoading,
    isFetching,
    refetch: refetchBrands,
  } = useGetBrandsQuery();

  const [createBrand, { isLoading: isCreating, isSuccess: isCreateSuccess }] = useCreateBrandMutation();
  const [deleteBrand, { isLoading: isDeleting }] = useDeleteBrandMutation();
  const [updateBrand, { isLoading: isUpdating, isSuccess: isUpdateSuccess }] = useUpdateBrandMutation();
  const [importBrands, { isLoading: isImporting }] = useImportBrandsMutation();
  const { refetch: refetchExport } = useExportBrandsQuery(undefined, { skip: true });
  const { refetch: refetchTemplate } = useGetBrandTemplateQuery(undefined, { skip: true });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  // Combined loading states
  const isDataLoading = isLoading || isFetching;
  const isActionLoading = isCreating || isDeleting || isUpdating || isImporting;

  // --- Handlers ---
  const handleCreateBrand = async (brandData: NewBrand) => {
    try {
      await createBrand(brandData).unwrap();
      message.success("Brand created successfully");
      setIsModalOpen(false);
      refetchBrands();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleUpdateBrand = async (id: string, data: NewBrand) => {
    try {
      await updateBrand({ id, brand: data }).unwrap();
      message.success("Brand updated successfully");
      setIsModalOpen(false);
      setEditingBrand(null);
      refetchBrands();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setIsModalOpen(true);
  };

  const handleDeleteSingle = async (id: string): Promise<void> => {
    try {
      await deleteBrand(id).unwrap();
      message.success("Brand deleted successfully");
      refetchBrands();
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  };

  const handleDeleteSelected = async (selectedIds: React.Key[]): Promise<boolean> => {
    const key = "deleting_selected_brands";
    message.loading({ content: `Deleting ${selectedIds.length} brands...`, key, duration: 0 });
    try {
      await Promise.all(selectedIds.map(id => deleteBrand(id as string).unwrap()));
      message.success({ content: `${selectedIds.length} brands deleted successfully`, key });
      refetchBrands();
      return true;
    } catch (error) {
      message.error({ content: `Failed to delete selected brands`, key });
      handleApiError(error);
      return false;
    }
  };

  const handleExport = async () => {
    const key = "exporting_brands";
    try {
      message.loading({ content: "Exporting brands...", key, duration: 0 });
      const result = await refetchExport();
      if (result.data instanceof Blob) {
        const url = window.URL.createObjectURL(result.data);
        const a = document.createElement("a");
        a.href = url;
        a.download = "brands.xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        message.success({ content: "Brands exported successfully", key });
      } else { throw new Error("Export failed: Invalid data received"); }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      message.error({ content: `Export failed: ${errorMsg}`, key });
    }
  };

  const handleDownloadTemplate = async () => {
     const key = "downloading_brand_template";
    try {
      message.loading({ content: "Downloading template...", key, duration: 0 });
      const result = await refetchTemplate();
       if (result.data instanceof Blob) {
        const url = window.URL.createObjectURL(result.data);
        const a = document.createElement("a");
        a.href = url;
        a.download = "brand_template.xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        message.success({ content: "Template downloaded successfully", key });
      } else { throw new Error("Template download failed: Invalid data received"); }
    } catch (error) {
       const errorMsg = error instanceof Error ? error.message : 'Unknown error';
       message.error({ content: `Template download failed: ${errorMsg}`, key });
    }
  };

  const uploadProps: UploadProps = {
    name: "file",
    accept: ".xlsx, .xls",
    showUploadList: false,
    customRequest: async (options) => {
      const { file, onSuccess, onError } = options;
      const key = "importing_brands";
      try {
        message.loading({ content: "Importing brands...", key, duration: 0 });
        const formData = new FormData();
        formData.append("file", file as Blob);
        await importBrands(formData).unwrap();
        message.success({ content: "Brands imported successfully", key });
        if (onSuccess) onSuccess({} , file as any);
        refetchBrands();
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        message.error({ content: `Import failed: ${errorMsg}`, key });
        if (onError) onError(error as Error);
      }
    },
    disabled: isImporting,
  };

  // Get columns from the hook
  const columns = useBrandTableColumns({
      onEdit: handleEdit,
      onDelete: handleDeleteSingle,
      isActionLoading,
      isDeleting,
  });

   if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError && !isLoading) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch brands. Please try again later.
      </div>
    );
  }

  return (
    <>
      <GenericDataTable
        columns={columns}
        dataSource={allBrands}
        loading={isDataLoading}
        entityName="Brand"
        uploadProps={uploadProps}
        onCreate={() => {
          setEditingBrand(null);
          setIsModalOpen(true);
        }}
        onExport={handleExport}
        onDownloadTemplate={handleDownloadTemplate}
        onDeleteSelected={handleDeleteSelected}
        isActionLoading={isActionLoading}
        isDeleting={isDeleting}
        isImporting={isImporting}
      />

      {/* Create/Edit Modal */}
      {isModalOpen && (
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
          isSuccess={isCreateSuccess || isUpdateSuccess}
          initialData={editingBrand}
          isLoading={isCreating || isUpdating}
        />
      )}
    </>
  );
};

export default BrandTab;
