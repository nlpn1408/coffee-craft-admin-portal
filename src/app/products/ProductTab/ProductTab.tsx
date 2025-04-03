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
  useUploadProductImageMutation,
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
import LoadingScreen from "@/components/LoadingScreen";
import { dummyProduct } from "../components/dummyProduct";

// Define props interface
interface ProductTabProps {
  onCreate: () => void; // Add onCreate prop
  onEdit: (product: Product) => void; // Keep onEdit prop (now opens drawer)
  onViewDetails: (product: Product) => void; // Keep onViewDetails prop
}

const ProductTab: React.FC<ProductTabProps> = ({ onCreate, onEdit, onViewDetails }) => { // Use new props
  // Remove modal state as it's handled by the parent drawer now
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const [uploadImage] = useUploadProductImageMutation();

  // Remove isActionLoading calculation related to internal modal state
  const isActionLoading = isDeleting; // Only consider delete loading for table actions now

  // --- Handlers ---
  // Remove handlers related to the internal modal (handleCreateProduct, handleUpdateProduct)
  // The save logic is now in ProductDetailView

  // Keep handleEdit, but it now calls the prop to open the drawer
  const handleEdit = (product: Product) => {
    onEdit(product); // Call prop to open drawer in edit mode
  };

  // Keep handleDeleteSingle
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
    onEdit: handleEdit, // Pass the updated handleEdit
    onDelete: handleDeleteSingle,
    onViewDetails: onViewDetails, // Pass onViewDetails prop down
    isActionLoading, // Pass down delete loading state
    isDeleting, // Pass down delete loading state
    // Pass queryParams if hook needs it for controlled sortOrder/filteredValue
    // queryParams,
  });


  const handleCreateDummy = async () => {
    dummyProduct.forEach(async (product) => {
      const formattedProduct: NewProduct = {
        name: product.name,
        sku: product.productCode,
        shortDescription: product.slug,
        longDescription: product.slug,
        price: product.priceVAT,
        discountPrice: product.priceNoVAT,
        categoryId:
          categoriesData.find(
            (category) => category?.name == product.productCategory.categoryName
          )?.id || categoriesData[0].id,
        stock: product.quantity,
      };
      try {
        const response = await createProduct(formattedProduct).unwrap();
        message.success("Product created successfully");
        const formattedImages = product.imageLanguage.map((image) => ({
          productId: response.id,
          url: image.image.secure_url,
          order: image.index,
        }));
        await uploadImage(formattedImages).unwrap();
      } catch (error) {}
    });
  };

  return (
    <>
      <div className="p-4 space-y-4">
        {/* Inline Toolbar */}
        <div className="flex justify-end items-center flex-wrap gap-2">
          <Space wrap>
            {/* Call onCreate prop to open drawer in create mode */}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onCreate}
              disabled={isActionLoading} // Disable if deleting
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
          loading={isLoading && !isFetching} // Show table loading indicator on fetch
          onChange={handleTableChange} // Handle server-side sort/filter changes
          scroll={{ x: 2000 }}
          size="small"
        />
      </div>

      {/* Remove Create/Edit Modal - Handled by Drawer now */}
    </>
  );
};

export default ProductTab;
