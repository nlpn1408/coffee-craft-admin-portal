"use client";

import React, { useRef, useState, useMemo, useEffect, Key } from "react";
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
import { Button, Input, Popconfirm, Space, message, InputRef } from "antd";
import type { TableProps, UploadProps } from "antd";
import type {
  ColumnType,
  FilterConfirmProps,
  FilterDropdownProps,
} from "antd/es/table/interface";
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import CreateCategoryModal from "./CreateCategoryModal";
import { handleApiError } from "@/lib/api-utils";
import { dummyData } from "./dummy"; // Keep for dummy data creation
import { GenericDataTable } from "@/components/GenericDataTable/GenericDataTable"; // Import the new component

// Define type for search input ref
type DataIndex = keyof Category;

const CategoryTab = () => {
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
  // Selected row keys state is now managed within GenericDataTable
  // const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Combined loading states
  const isDataLoading = isLoading || isFetching;
  // Pass individual loading states to GenericDataTable
  const isActionLoading = isCreating || isDeleting || isUpdating || isImporting;

  if (isError && !isLoading) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch categories. Please try again later.
      </div>
    );
  }

  // Handlers remain mostly the same, but onDeleteSelected needs adjustment
  const handleCreateCategory = async (categoryData: NewCategory) => {
    try {
      await createCategory(categoryData).unwrap();
      message.success("Category created successfully");
      setIsModalOpen(false);
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
    } catch (error) {
      handleApiError(error);
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
      // Optionally trigger refetch or let cache invalidation handle update
    } catch (error) {
      handleApiError(error);
    }
  };

  // Adjusted to accept selectedIds from GenericDataTable
  const handleDeleteSelected = async (selectedIds: React.Key[]) => {
    const key = "deleting_selected";
    try {
      message.loading({
        content: `Deleting ${selectedIds.length} categories...`,
        key,
        duration: 0,
      });
      for (const id of selectedIds) {
        await deleteCategory(id as string).unwrap();
      }
      message.success({
        content: `${selectedIds.length} categories deleted successfully`,
        key,
      });
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

  // Antd Upload props remain the same
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
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        message.error({ content: `Import failed: ${errorMsg}`, key });
        if (onError) onError(error as Error);
      }
    },
    disabled: isImporting,
  };

  // --- Column Search & Filter Logic (remains the same) ---
  const searchInput = useRef<InputRef>(null);

  const handleColumnSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: DataIndex
  ) => {
    confirm();
  };

  const handleColumnReset = (clearFilters: () => void) => {
    clearFilters();
  };

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
          ref={searchInput}
          placeholder={`Search ${String(dataIndex)}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleColumnSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleColumnSearch(selectedKeys as string[], confirm, dataIndex)
            }
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
    onFilter: (value: Key | boolean, record: Category) => {
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

  const parentCategoryFilters = useMemo(() => {
    const parents = new Map<string | null, string>();
    parents.set(null, "None");
    allCategories.forEach((cat) => {
      if (cat.parentId && !parents.has(cat.parentId)) {
        const parentName = allCategories.find(
          (p) => p.id === cat.parentId
        )?.name;
        parents.set(cat.parentId, parentName || cat.parentId);
      }
    });
    return Array.from(parents.entries())
      .map(([value, text]) => ({
        text: text,
        value: value ?? "none",
      }))
      .sort((a, b) => a.text.localeCompare(b.text));
  }, [allCategories]);
  // --- End Column Search & Filter Logic ---

  const columns: TableProps<Category>["columns"] = [
    // ID column removed
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      ...getColumnSearchProps("name"),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text: string | null) => text || "N/A",
      sorter: (a, b) =>
        (a.description || "").localeCompare(b.description || ""),
    },
    {
      title: "Parent Category",
      dataIndex: "parentId",
      key: "parentId",
      render: (parentId: string | null) => {
        if (!parentId) return "None";
        const parentName = allCategories.find((p) => p.id === parentId)?.name;
        return parentName || parentId;
      },
      sorter: (a, b) => (a.parentId || "").localeCompare(b.parentId || ""),
      filters: parentCategoryFilters,
      onFilter: (value: Key | boolean, record: Category) => {
        const recordParentId = record.parentId ?? "none";
        return String(recordParentId) === String(value);
      },
      filterIcon: (filtered: boolean) => (
        <FilterOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => new Date(text).toLocaleDateString(),
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      width: 120,
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      width: 100,
      render: (_: any, record: Category) => (
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
    }
  };

  return (
    // Removed outer div, GenericDataTable provides padding
    <>
      <GenericDataTable
        columns={columns}
        dataSource={allCategories} // Pass all data, filtering/sorting is internal to Antd Table
        loading={isDataLoading}
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
