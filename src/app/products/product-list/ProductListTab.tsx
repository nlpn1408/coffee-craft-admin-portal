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
  // Table, // Removed Table import
  message,
  // Spin, // Spin might be handled by GenericDataTable or LoadingScreen
} from "antd";
// import type { TableProps } from "antd"; // Removed TableProps import
import type { FilterValue, SorterResult } from "antd/es/table/interface"; // Keep for queryParams
import { PlusOutlined } from "@ant-design/icons";
import { handleApiError } from "@/lib/api-utils";
import { useProductTableColumns } from "@/app/products/components/useProductTableColumns";
import LoadingScreen from "@/components/LoadingScreen";
import { dummyProduct } from "../dummyProduct";
import { GenericDataTable } from "@/components/GenericDataTable/GenericDataTable"; // Import GenericDataTable

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

  // Add handler for deleting selected products
  const handleDeleteSelected = async (selectedIds: React.Key[]): Promise<boolean> => {
    const key = "deleting_selected_products";
    message.loading({
      content: `Deleting ${selectedIds.length} products...`,
      key,
      duration: 0,
    });
    try {
      // Assuming deleteProduct mutation handles single ID deletion
      await Promise.all(
        selectedIds.map((id) => deleteProduct(id as string).unwrap())
      );
      message.success({
        content: `${selectedIds.length} products deleted successfully`,
        key,
      });
      refetchProducts();
      return true; // Indicate success
    } catch (error) {
      message.error({ content: `Failed to delete selected products`, key });
      handleApiError(error);
      return false; // Indicate failure
    }
  };


  // --- Table Change Handler (May need adjustment if GenericDataTable handles differently) ---
  // Keep for now, but GenericDataTable might override or use its own internal handling
  const handleTableChange = ( // Removed TableProps type as it might conflict
    pagination: any, // Use any for now, adjust if needed based on GenericDataTable's signature
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<Product> | SorterResult<Product>[]
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
      {/* Use GenericDataTable */}
      <GenericDataTable<Product>
        columns={columns}
        dataSource={products}
        loading={isFetching} // Use isFetching for table loading state
        entityName="Product"
        onCreate={onCreate} // Pass the onCreate handler from props
        onDeleteSelected={handleDeleteSelected} // Pass the bulk delete handler
        // Pass other relevant props if GenericDataTable supports them (e.g., import/export)
        // uploadProps={/* Define uploadProps if needed */}
        // onExport={/* Define handleExport if needed */}
        // onDownloadTemplate={/* Define handleDownloadTemplate if needed */}
        isActionLoading={isActionLoading} // Pass general action loading state
        isDeleting={isDeleting} // Pass specific deleting state
        // isImporting={/* Pass isImporting if needed */}
        // Note: Pagination and onChange might be handled internally by GenericDataTable
        // If server-side pagination/filtering/sorting is needed with GenericDataTable,
        // its props/implementation might need adjustments. Assuming basic client-side for now.
        // totalItems={productsResponse?.total} // Removed totalItems prop
      />

      {/* Keep Dummy data button separate */}
       <div className="p-4 pt-0">
         <Button
           type="primary"
           icon={<PlusOutlined />}
           onClick={handleCreateDummy}
           disabled={isActionLoading}
         >
           Create Product Dummy
         </Button>
       </div>
    </>
  );
};

// Update export default
export default ProductListTab;
