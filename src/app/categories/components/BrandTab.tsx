"use client";

import React, { useRef, useState, useMemo, useEffect, Key } from "react";
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
  Button,
  Input,
  Popconfirm,
  Space,
  message,
  InputRef,
} from "antd";
import type { TableProps, UploadProps } from "antd";
import type { ColumnType, FilterConfirmProps, FilterDropdownProps } from 'antd/es/table/interface';
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
// Ensure this path is correct for the refactored modal
import CreateBrandModal from "@/components/modals/CreateBrandModal";
import { handleApiError } from "@/lib/api-utils";
import { GenericDataTable } from "@/components/GenericDataTable/GenericDataTable";

// Define type for search input ref
type DataIndex = keyof Brand;

const BrandTab = () => {
  // Fetch ALL brands
  const {
    data: allBrands = [],
    isError,
    isLoading,
    isFetching,
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
  // Pass individual loading states to GenericDataTable
  const isActionLoading = isCreating || isDeleting || isUpdating || isImporting;

  if (isError && !isLoading) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch brands. Please try again later.
      </div>
    );
  }

  // Handlers remain mostly the same, but onDeleteSelected needs adjustment
  const handleCreateBrand = async (brandData: NewBrand) => {
    try {
      await createBrand(brandData).unwrap();
      message.success("Brand created successfully");
      setIsModalOpen(false);
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
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setIsModalOpen(true);
  };

  const handleDeleteSingle = async (id: string) => {
    try {
      await deleteBrand(id).unwrap();
      message.success("Brand deleted successfully");
      // Optionally trigger refetch or let cache invalidation handle update
    } catch (error) {
      handleApiError(error);
    }
  };

  // Adjusted to accept selectedIds from GenericDataTable
  const handleDeleteSelected = async (selectedIds: React.Key[]): Promise<boolean> => {
    const key = "deleting_selected_brands";
    try {
      message.loading({ content: `Deleting ${selectedIds.length} brands...`, key, duration: 0 });
      for (const id of selectedIds) {
        await deleteBrand(id as string).unwrap();
      }
      message.success({ content: `${selectedIds.length} brands deleted successfully`, key });
      return true; // Indicate success
      
      // Selection state is managed internally by GenericDataTable, no need to reset here
    } catch (error) {
      message.error({ content: `Failed to delete selected brands`, key });
      handleApiError(error);
      return false; // Indicate failure
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
      } else {
        throw new Error("Export failed: Invalid data received");
      }
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
      } else {
        throw new Error("Template download failed: Invalid data received");
      }
    } catch (error) {
       const errorMsg = error instanceof Error ? error.message : 'Unknown error';
       message.error({ content: `Template download failed: ${errorMsg}`, key });
    }
  };

  // Antd Upload props remain the same
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
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        message.error({ content: `Import failed: ${errorMsg}`, key });
        if (onError) onError(error as Error);
      }
    },
    disabled: isImporting,
  };

  // --- Column Search Logic (remains the same) ---
  const searchInput = useRef<InputRef>(null);

  const handleColumnSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: DataIndex,
  ) => {
    confirm();
  };

  const handleColumnReset = (clearFilters: () => void) => {
    clearFilters();
  };

  const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<Brand> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }: FilterDropdownProps) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${String(dataIndex)}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleColumnSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleColumnSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleColumnReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => { close(); }}
          >
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (value: Key | boolean, record: Brand) => {
      const stringValue = String(value).toLowerCase();
      const recordValue = record[dataIndex];
      return recordValue
        ? recordValue.toString().toLowerCase().includes(stringValue)
        : false;
    },
    onFilterDropdownOpenChange: (visible: boolean) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text: any) => text,
  });
  // --- End Column Search Logic ---


  const columns: TableProps<Brand>["columns"] = [
    // ID column removed
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      ...getColumnSearchProps('name'),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text: string | null) => text || "N/A",
      sorter: (a, b) => (a.description || "").localeCompare(b.description || ""),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => new Date(text).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      width: 120,
    },
    {
      title: "Actions",
      key: "actions",
      align: 'center',
      width: 100,
      render: (_: any, record: Brand) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
            aria-label="Edit"
            disabled={isActionLoading}
          />
          <Popconfirm
            title="Delete Brand"
            description="Are you sure you want to delete this brand?"
            onConfirm={() => handleDeleteSingle(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ loading: isDeleting }}
            disabled={isActionLoading}
          >
            <Button icon={<DeleteOutlined />} danger size="small" aria-label="Delete" disabled={isActionLoading}/>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    // Removed outer div, GenericDataTable provides padding
    <>
      <GenericDataTable
        columns={columns}
        dataSource={allBrands} // Pass all data
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
