"use client";

import React, { useRef, useState, useMemo, useEffect } from "react"; // Added useEffect
import type { Category, NewCategory } from "@/types";
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useExportCategoriesQuery,
  useGetCategoriesQuery, // Correct hook name
  useGetCategoryTemplateQuery,
  useImportCategoriesMutation,
  useUpdateCategoryMutation,
} from "@/state/api";
import {
  Button,
  Input,
  // Modal, // Will replace CreateCategoryModal later
  Popconfirm,
  Space,
  Table,
  Upload,
  message,
  Spin,
} from "antd";
import type { TableProps, UploadProps } from "antd";
import {
  PlusOutlined,
  ExportOutlined,
  ImportOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  FilterOutlined, // Added FilterOutlined
} from "@ant-design/icons";
import CreateCategoryModal from "./CreateCategoryModal";
import { handleApiError } from "@/lib/api-utils";
import { dummyData } from "./dummy";
import type { InputRef } from "antd"; // Import InputRef
import type { ColumnType } from "antd/es/table"; // Corrected import for ColumnType
import type {
  FilterConfirmProps,
  FilterDropdownProps,
} from "antd/es/table/interface"; // Import FilterConfirmProps and FilterDropdownProps

// Removed CategoriesResponse interface

// Define type for search input ref
type DataIndex = keyof Category;

const CategoryTab = () => {
  // Removed searchTerm, debouncedSearchTerm, searchTimeoutRef, and client-side filtering logic
  // Antd Table will handle filtering internally based on column definitions

  // Fetch ALL categories
  const {
    data: allCategories = [],
    isError,
    isLoading,
    isFetching,
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
  ] = useUpdateCategoryMutation(); // Added isSuccess
  const [importCategories, { isLoading: isImporting }] =
    useImportCategoriesMutation();
  const { refetch: refetchExport } = useExportCategoriesQuery(undefined, {
    skip: true,
  });
  const { refetch: refetchTemplate } = useGetCategoryTemplateQuery(undefined, {
    skip: true,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Combined loading states
  const isDataLoading = isLoading || isFetching; // Loading data for the table
  const isActionLoading = isCreating || isDeleting || isUpdating || isImporting; // Loading during actions

  if (isError && !isLoading) {
    // Show error only if not initial loading
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch categories. Please try again later.
      </div>
    );
  }

  const handleCreateCategory = async (categoryData: NewCategory) => {
    try {
      await createCategory(categoryData).unwrap();
      message.success("Category created successfully");
      setIsModalOpen(false);
    } catch (error) {
      handleApiError(error); // Corrected: Pass only error
    }
  };

  const handleUpdateCategory = async (id: string, data: NewCategory) => {
    try {
      await updateCategory({ id, category: data }).unwrap();
      message.success("Category updated successfully");
      setIsModalOpen(false);
      setEditingCategory(null);
    } catch (error) {
      handleApiError(error); // Corrected: Pass only error
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteSingle = async (id: string) => {
    try {
      await deleteCategory(id).unwrap();
      message.success("Category deleted successfully");
      setSelectedRowKeys((keys) => keys.filter((key) => key !== id)); // Update selection state
    } catch (error) {
      handleApiError(error); // Corrected: Pass only error
    }
  };

  const handleDeleteSelected = async () => {
    const key = "deleting_selected";
    try {
      message.loading({
        content: `Deleting ${selectedRowKeys.length} categories...`,
        key,
        duration: 0,
      });
      // Consider batch delete API if available
      for (const id of selectedRowKeys) {
        await deleteCategory(id as string).unwrap();
      }
      message.success({
        content: `${selectedRowKeys.length} categories deleted successfully`,
        key,
      });
      setSelectedRowKeys([]);
    } catch (error) {
      message.error({ content: `Failed to delete selected categories`, key });
      handleApiError(error); // Corrected: Pass only error
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
      // handleApiError(error); // Optionally log detailed error
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
      // handleApiError(error); // Optionally log detailed error
    }
  };

  // Antd Upload props
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
        if (onSuccess) onSuccess({} /* response */, file as any); // Pass empty response, cast file
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        message.error({ content: `Import failed: ${errorMsg}`, key });
        if (onError) onError(error as Error);
        // handleApiError(error); // Optionally log detailed error
      }
    },
    disabled: isImporting,
  };

  // --- Column Search Logic ---
  const searchInput = useRef<InputRef>(null);
  // Removed searchText and searchedColumn state as they are not strictly needed for the filter logic itself

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: DataIndex
  ) => {
    confirm();
    // setSearchText(selectedKeys[0]); // Not needed
    // setSearchedColumn(dataIndex); // Not needed
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    // setSearchText(''); // Not needed
  };

  // Added explicit types for filterDropdown props
  const getColumnSearchProps = (
    dataIndex: DataIndex
  ): ColumnType<Category> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }: FilterDropdownProps) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput} // Type is InputRef | null
          placeholder={`Search ${String(dataIndex)}`} // Use String() for safety
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)} // Check if clearFilters exists
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
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    // Use React.Key and cast value to string for comparison
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]!.toString()
            .toLowerCase()
            .includes(String(value).toLowerCase())
        : false,
    // Added explicit type for onFilterDropdownOpenChange param
    onFilterDropdownOpenChange: (visible: boolean) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    // Added explicit type for render param
    render: (text: any) => text,
  });
  // --- End Column Search Logic ---

  // --- Parent Category Filter Logic ---
  const parentCategoryFilters = useMemo(() => {
    const parents = new Map<string | null, string>();
    parents.set(null, "None"); // Add 'None' option for root categories
    allCategories.forEach((cat) => {
      if (cat.parentId && !parents.has(cat.parentId)) {
        // Find the parent category's name (assuming parent is also in allCategories)
        const parentName = allCategories.find(
          (p) => p.id === cat.parentId
        )?.name;
        if (parentName) {
          parents.set(cat.parentId, parentName);
        } else {
          parents.set(cat.parentId, cat.parentId); // Fallback to ID if name not found
        }
      }
    });
    return Array.from(parents.entries())
      .map(([value, text]) => ({
        text: text,
        value: value ?? "none", // Use 'none' string for null value filter key
      }))
      .sort((a, b) => a.text.localeCompare(b.text)); // Sort alphabetically
  }, [allCategories]);
  // --- End Parent Category Filter Logic ---

  const columns: TableProps<Category>["columns"] = [
    // ID column removed
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      ...getColumnSearchProps("name"), // Add search to Name column
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text: string | null) => text || "N/A", // Added type
      sorter: (a, b) =>
        (a.description || "").localeCompare(b.description || ""),
    },
    {
      title: "Parent Category",
      dataIndex: "parentId",
      key: "parentId",
      render: (parentId: string | null) => {
        // Added type
        if (!parentId) return "None";
        const parentName = allCategories.find((p) => p.id === parentId)?.name;
        return parentName || parentId;
      },
      sorter: (a, b) => (a.parentId || "").localeCompare(b.parentId || ""),
      filters: parentCategoryFilters,
      // Use React.Key and cast value to string for comparison
      onFilter: (value, record) => {
        const recordParentId = record.parentId ?? "none";
        return String(recordParentId) === String(value); // Compare as strings
      },
      filterIcon: (filtered: boolean) => (
        <FilterOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => new Date(text).toLocaleDateString(), // Added type
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      width: 120,
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      width: 100,
      render: (
        _: any,
        record: Category // Added types
      ) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
            aria-label="Edit"
            disabled={isActionLoading}
          />
          <Popconfirm
            title="Delete Category"
            description="Are you sure you want to delete this category?"
            onConfirm={() => handleDeleteSingle(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ loading: isDeleting }}
            disabled={isActionLoading}
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              size="small"
              aria-label="Delete"
              disabled={isActionLoading}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Re-added createDummy function
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
      }));
      for (const item of formattedData) {
        await createCategory(item).unwrap();
      }
      message.success({
        content: "Dummy Categories created successfully",
        key,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      message.error({
        content: `Failed to create dummy categories: ${errorMsg}`,
        key,
      });
      // handleApiError(error); // Optionally log detailed error
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys);
    },
  };

  const hasSelected = selectedRowKeys.length > 0;

  return (
    <div className="flex flex-col space-y-4 p-4">
      {/* Toolbar - Removed global search Input */}
      <div className="flex justify-end items-center flex-wrap gap-2">
        {" "}
        {/* Changed justify-between to justify-end */}
        {/* <Space> Removed Search Input Space </Space> */}
        <Space wrap>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingCategory(null);
              setIsModalOpen(true);
            }}
            disabled={isActionLoading}
          >
            Create Category
          </Button>
          <Upload {...uploadProps}>
            <Button
              icon={<ImportOutlined />}
              loading={isImporting}
              disabled={isActionLoading}
            >
              Import
            </Button>
          </Upload>
          <Button
            icon={<ExportOutlined />}
            onClick={handleExport}
            disabled={isActionLoading}
          >
            Export
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownloadTemplate}
            disabled={isActionLoading}
          >
            Template
          </Button>
          <Button onClick={createDummy} danger disabled={isActionLoading}>
            {" "}
            Create Dummy{" "}
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
            title={`Delete ${selectedRowKeys.length} Categories`}
            description="Are you sure you want to delete the selected categories?"
            onConfirm={handleDeleteSelected}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ loading: isDeleting }} // Specific loading
            disabled={!hasSelected || isActionLoading} // Disable during any action
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
          dataSource={allCategories} // Use allCategories, filtering is internal
          rowKey="id"
          rowSelection={rowSelection}
          pagination={{
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          // onChange removed, Antd handles client-side changes
          loading={isDataLoading} // Pass loading state
          scroll={{ x: "max-content" }}
          size="small"
        />
      </Spin>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <CreateCategoryModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCategory(null);
          }}
          // Corrected prop name from onSubmit to onCreate
          onCreate={
            editingCategory
              ? (data) => handleUpdateCategory(editingCategory.id, data)
              : handleCreateCategory
          }
          // Pass correct props including isSuccess
          isSuccess={isCreateSuccess || isUpdateSuccess}
          parentCategories={allCategories} // Pass all categories for parent selection
          initialData={editingCategory}
        />
      )}
    </div>
  );
};

export default CategoryTab;
