"use client";

import React, { useState, useMemo, useEffect } from "react"; // Removed useRef, Key
import { NewProduct, Product, Category, Brand } from "@/types"; // Removed ProductImage
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetBrandsQuery,
  useGetCategoriesQuery,
  useGetProductsQuery,
  useUpdateProductMutation,
  // Assuming export/import/template hooks exist or need to be added
  // useExportProductsQuery,
  // useImportProductsMutation,
  // useGetProductTemplateQuery,
} from "@/state/api";
import {
  Button,
  // Popconfirm, // Moved to hook
  Space,
  Table,
  // Tag, // Moved to hook
  // Image, // Moved to hook
  // Input, // Moved to hook
  message,
  Spin,
  // InputRef, // Moved to hook
} from "antd";
import type { TableProps, TablePaginationConfig } from "antd";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
// Removed ColumnType, FilterConfirmProps, FilterDropdownProps, Key
import {
  PlusOutlined,
  // DeleteOutlined, // Moved to hook
  // EditOutlined, // Moved to hook
  // SearchOutlined, // Moved to hook
} from "@ant-design/icons";
import CreateProductModal from "./CreateProductModal";
import { handleApiError } from "@/lib/api-utils";
// import { formatCurrency } from "@/utils/utils"; // Moved to hook
import { useProductTableColumns } from "./useProductTableColumns"; // Import the hook
import LoadingScreen from "@/components/LoadingScreen"; // Import LoadingScreen
import { dummyProduct } from "../components/dummyProduct";

const ProductTab = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [queryParams, setQueryParams] = useState<{
    sortField?: string;
    sortOrder?: "ascend" | "descend";
    filters: Record<string, FilterValue | null>;
  }>({
    filters: {},
  });

  // Fetch Categories and Brands for filters (needed by the hook)
  const { data: categoriesData = [] } = useGetCategoriesQuery();
  const { data: brandsData = [] } = useGetBrandsQuery();

  // Fetch Products based ONLY on server-side filter/sort params
  const {
    data: productsResponse,
    isLoading,
    isFetching,
    isError,
    refetch: refetchProducts, // Add refetch
  } = useGetProductsQuery({
    search: queryParams.filters?.name?.[0] as string | undefined,
    categoryId: queryParams.filters?.category?.[0] as string | undefined,
    brandId: queryParams.filters?.brand?.[0] as string | undefined,
    sortBy: queryParams.sortField,
    sortOrder:
      queryParams.sortOrder === "ascend"
        ? "asc"
        : queryParams.sortOrder === "descend"
        ? "desc"
        : undefined,
    active: queryParams.filters?.active?.[0] as boolean | undefined, // Added 'active' filter parameter back
  });

  const products = useMemo(
    () => productsResponse?.data ?? [],
    [productsResponse]
  );

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const isActionLoading = isCreating || isUpdating || isDeleting;

  // --- Handlers ---
  const handleCreateProduct = async (productData: NewProduct) => {
    try {
      await createProduct(productData).unwrap();
      message.success("Product created successfully");
      setIsModalOpen(false);
      refetchProducts(); // Refetch after create
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleUpdateProduct = async (id: string, productData: NewProduct) => {
    try {
      await updateProduct({ id, formData: productData }).unwrap();
      message.success("Product updated successfully");
      setIsModalOpen(false);
      setEditingProduct(null);
      refetchProducts(); // Refetch after update
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteSingle = async (id: string): Promise<void> => {
    try {
      await deleteProduct(id).unwrap();
      message.success("Product deleted successfully");
      refetchProducts(); // Refetch after delete
    } catch (error) {
      handleApiError(error);
      throw error; // Re-throw to signal potential failure
    }
  };

  // --- Table Change Handler ---
  const handleTableChange: TableProps<Product>["onChange"] = (
    pagination, // Client-side pagination, ignore changes here
    filters,
    sorter
  ) => {
    const currentSorter = sorter as SorterResult<Product>;
    setQueryParams({
      filters,
      sortField: currentSorter.field as string | undefined,
      sortOrder: currentSorter.order as "ascend" | "descend" | undefined,
    });
  };

  // --- Get Columns from Hook ---
  const columns = useProductTableColumns({
    categories: categoriesData,
    brands: brandsData,
    onEdit: handleEdit,
    onDelete: handleDeleteSingle,
    isActionLoading,
    isDeleting,
    // Pass queryParams if hook needs it for controlled sortOrder/filteredValue
    // queryParams,
  });

  if (isLoading && !isFetching) {
    // Show loading screen only on initial load
    return <LoadingScreen />;
  }

  if (isError && !isLoading) {
    // Show error only if not initial loading
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch products. Please try again later.
      </div>
    );
  }

  const handleCreateDummy = async () => {
    // const formattedDummyProduct: NewProduct = dummyProduct.map((item) => ({
    //  name: item.name,
    //  sku: item.sku,

    // }));

    // try {
    //   await createProduct(formattedDummyProduct).unwrap();
    //   message.success("Dummy products created successfully");
    //   refetchProducts(); // Refetch after create
    // } catch (error) {
    //   handleApiError(error);
    // }
  }

  return (
    <>
      <div className="p-4 space-y-4">
        {/* Inline Toolbar */}
        <div className="flex justify-end items-center flex-wrap gap-2">
          <Space wrap>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingProduct(null);
                setIsModalOpen(true);
              }}
              disabled={isActionLoading}
            >
              Create Product
            </Button>
          </Space>

          <Space wrap>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateDummy}
              disabled={isActionLoading}
            >
              Create Product Dummy
            </Button>
            {/* Add Import/Export/Template buttons here if needed */}
          </Space>
        </div>

        {/* Table */}
        <Table<Product>
          columns={columns}
          dataSource={products}
          rowKey="id"
          pagination={{
            total: products.length, // Total based on current client-side data
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          loading={isFetching} // Show table loading indicator on fetch
          onChange={handleTableChange} // Handle server-side sort/filter changes
          scroll={{ x: 2000 }}
          size="small"
        />
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <CreateProductModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
          onCreate={
            editingProduct
              ? (data) => handleUpdateProduct(editingProduct.id, data)
              : handleCreateProduct
          }
          initialData={editingProduct || undefined}
          isLoading={isCreating || isUpdating} // Pass modal loading state
        />
      )}
    </>
  );
};

export default ProductTab;
