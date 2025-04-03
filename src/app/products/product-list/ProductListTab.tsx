"use client";

import React, { useState, useMemo, useEffect } from "react";
import { NewProduct, Product, Category, Brand } from "@/types";
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetBrandsQuery,
  useGetCategoriesQuery,
  useGetProductsQuery,
  useUpdateProductMutation,
  useUploadProductImageMutation,
} from "@/state/api";
import {
  Button,
  Space,
  Table,
  message,
  Spin,
} from "antd";
import type { TableProps } from "antd";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import { PlusOutlined } from "@ant-design/icons";
// Note: CreateProductModal is removed as creation is handled by the drawer now
// import CreateProductModal from "../ProductTab/CreateProductModal";
import { handleApiError } from "@/lib/api-utils";
import { useProductTableColumns } from "@/app/products/components/useProductTableColumns";
import LoadingScreen from "@/components/LoadingScreen";
import { dummyProduct } from "../dummyProduct"; // Adjust path relative to new location

// Define props interface (Renamed)
interface ProductListTabProps {
  onCreate: () => void;
  onEdit: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

// Rename component
const ProductListTab: React.FC<ProductListTabProps> = ({ onCreate, onEdit, onViewDetails }) => {
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
    refetch: refetchProducts,
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
    active: queryParams.filters?.active?.[0] as boolean | undefined,
  });

  const products = useMemo(
    () => productsResponse?.data ?? [],
    [productsResponse]
  );

  // Keep create/upload mutations if needed for dummy data creation
  const [createProduct] = useCreateProductMutation();
  const [uploadImage] = useUploadProductImageMutation();
  // Keep delete mutation
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const isActionLoading = isDeleting; // Only delete matters for table actions now

  // --- Handlers ---
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
    pagination,
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
    onViewDetails: onViewDetails, // Pass onViewDetails prop down
    isActionLoading,
    isDeleting,
  });

  // Keep dummy data handler if still desired
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

   if (isLoading && !isFetching) {
    return <LoadingScreen />;
  }

  if (isError && !isLoading) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch products. Please try again later.
      </div>
    );
  }


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
            // Use total from response if available for server-side pagination
            total: productsResponse?.total ?? products.length,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            // Add current and pageSize if implementing server-side pagination fully
            // current: queryParams.page,
            // pageSize: queryParams.limit,
          }}
          loading={isFetching} // Show table loading indicator on fetch
          onChange={handleTableChange} // Handle server-side sort/filter changes
          scroll={{ x: 2000 }}
          size="small"
        />
      </div>
    </>
  );
};

// Update export default
export default ProductListTab;
