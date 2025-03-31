"use client";

import React, { useRef, useState, useMemo, useEffect, Key } from "react"; // Import Key from React
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
  Table,
  Upload,
  message,
  Spin,
  InputRef,
} from "antd";
import type { TableProps, UploadProps } from "antd";
// Removed Key import from antd/es/_util/type
import type { ColumnType, FilterConfirmProps, FilterDropdownProps } from 'antd/es/table/interface';
import {
  PlusOutlined,
  ExportOutlined,
  ImportOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
// Ensure this path is correct for the refactored modal
import CreateBrandModal from "@/components/modals/CreateBrandModal";
import { handleApiError } from "@/lib/api-utils";

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
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]); // Use React.Key
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  // Combined loading states
  const isDataLoading = isLoading || isFetching;
  const isActionLoading = isCreating || isDeleting || isUpdating || isImporting;

  if (isError && !isLoading) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch brands. Please try again later.
      </div>
    );
  }

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
      setSelectedRowKeys(keys => keys.filter(key => key !== id));
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDeleteSelected = async () => {
    const key = "deleting_selected_brands";
    try {
      message.loading({ content: `Deleting ${selectedRowKeys.length} brands...`, key, duration: 0 });
      for (const id of selectedRowKeys) {
        await deleteBrand(id as string).unwrap();
      }
      message.success({ content: `${selectedRowKeys.length} brands deleted successfully`, key });
      setSelectedRowKeys([]);
    } catch (error) {
      message.error({ content: `Failed to delete selected brands`, key });
      handleApiError(error);
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

  // Antd Upload props
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

  // --- Column Search Logic ---
  const searchInput = useRef<InputRef>(null);

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: DataIndex,
  ) => {
    confirm();
  };

  const handleReset = (clearFilters: () => void) => {
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
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    // Corrected type for onFilter value param to Key | boolean
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
      ...getColumnSearchProps('name'), // Add search to Name column
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text: string | null) => text || "N/A", // Added type
      sorter: (a, b) => (a.description || "").localeCompare(b.description || ""),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => new Date(text).toLocaleDateString(), // Added type
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      width: 120,
    },
    {
      title: "Actions",
      key: "actions",
      align: 'center',
      width: 100,
      render: (_: any, record: Brand) => ( // Added types
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

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => { // Use React.Key
      setSelectedRowKeys(keys);
    },
  };

  const hasSelected = selectedRowKeys.length > 0;

  return (
    <div className="flex flex-col space-y-4 p-4">
      {/* Toolbar - Removed global search Input */}
      <div className="flex justify-end items-center flex-wrap gap-2"> {/* Changed justify-between to justify-end */}
        {/* <Space> Removed Search Input Space </Space> */}
        <Space wrap>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingBrand(null);
              setIsModalOpen(true);
            }}
            disabled={isActionLoading}
          >
            Create Brand
          </Button>
          <Upload {...uploadProps}>
            <Button icon={<ImportOutlined />} loading={isImporting} disabled={isActionLoading}>
              Import
            </Button>
          </Upload>
          <Button icon={<ExportOutlined />} onClick={handleExport} disabled={isActionLoading}>
            Export
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate} disabled={isActionLoading}>
            Template
          </Button>
        </Space>
      </div>

       {/* Selected Rows Actions */}
       {hasSelected && (
         <div className="flex justify-start items-center space-x-2 p-2 bg-blue-50 border border-blue-200 rounded">
           <span className="text-sm font-medium text-blue-700">
             {selectedRowKeys.length} selected
           </span>
           <Popconfirm
             title={`Delete ${selectedRowKeys.length} Brands`}
             description="Are you sure you want to delete the selected brands?"
             onConfirm={handleDeleteSelected}
             okText="Yes"
             cancelText="No"
             okButtonProps={{ loading: isDeleting }}
             disabled={!hasSelected || isActionLoading}
           >
             <Button
               icon={<DeleteOutlined />}
               danger
               size="small"
               disabled={!hasSelected || isActionLoading}
             >
               Delete Selected
             </Button>
           </Popconfirm>
         </div>
       )}


      {/* Table */}
      <Spin spinning={isDataLoading}>
        <Table
          columns={columns}
          dataSource={allBrands} // Use allBrands, filtering is internal
          rowKey="id"
          rowSelection={rowSelection}
          pagination={{
             showSizeChanger: true,
             showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
             pageSizeOptions: ['10', '20', '50', '100'],
          }}
          loading={isDataLoading}
          scroll={{ x: 'max-content' }}
          size="small"
        />
      </Spin>

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
          // Pass isLoading for modal's internal spinner
          isLoading={isCreating || isUpdating}
        />
      )}

      {/* Delete Dialog removed */}
    </div>
  );
};

export default BrandTab;
