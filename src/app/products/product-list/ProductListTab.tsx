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
  // Import new product hooks
  useImportProductsMutation,
  useLazyExportProductsQuery,
  useLazyGetProductTemplateQuery,
} from "@/state/api"; // Assuming these are exported from state/api or directly from productService
import { Button, Space, message, Upload, notification } from "antd";
import type { UploadProps, TablePaginationConfig, TableProps } from "antd"; // Add TablePaginationConfig, TableProps
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import { PlusOutlined } from "@ant-design/icons";
import { handleApiError } from "@/lib/api-utils";
import { useProductTableColumns } from "@/app/products/components/useProductTableColumns";
import LoadingScreen from "@/components/LoadingScreen";
import { dummyProduct } from "../dummyProduct";
import { GenericDataTable } from "@/components/GenericDataTable/GenericDataTable"; // Import GenericDataTable
import { format } from "date-fns";

// Define props interface (Renamed)
interface ProductListTabProps {
  onCreate: () => void;
  onEdit: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

// Rename component
const ProductListTab: React.FC<ProductListTabProps> = ({
  onCreate,
  onEdit,
  onViewDetails,
}) => {
  // Add page and limit to state
  const [queryParams, setQueryParams] = useState<{
    page: number;
    limit: number;
    sortField?: string;
    sortOrder?: "ascend" | "descend";
    filters: Record<string, FilterValue | null>;
  }>({
    page: 1,
    limit: 10, // Default page size
    filters: {},
  });

  // Fetch Categories and Brands for filters
  const { data: categoriesResponse } = useGetCategoriesQuery({}); // Pass empty object or required params
  const { data: brandsResponse } = useGetBrandsQuery({}); // Pass empty object or required params
  // Extract the arrays from the responses
  const categoriesData = useMemo(() => categoriesResponse?.data ?? [], [categoriesResponse]);
  const brandsData = useMemo(() => brandsResponse?.data ?? [], [brandsResponse]); // Assuming brands also paginated


  // Fetch Products based ONLY on server-side filter/sort params
  const {
    data: productsResponse,
    isLoading,
    isFetching,
    isError,
    refetch: refetchProducts,
  } = useGetProductsQuery(queryParams); // Pass the state object directly

  const products = useMemo(
    () => productsResponse?.data ?? [],
    [productsResponse]
  );
  // Define totalProducts
  const totalProducts = useMemo(
    () => productsResponse?.total ?? 0,
    [productsResponse]
  );

  // Keep create/upload mutations if needed for dummy data creation
  const [createProduct] = useCreateProductMutation();
  const [uploadImage] = useUploadProductImageMutation();
  // Keep delete mutation
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  // Add import/export hooks
  const [importProducts, { isLoading: isImporting }] =
    useImportProductsMutation();
  const [triggerExport, { isFetching: isExporting }] =
    useLazyExportProductsQuery();
  const [triggerTemplate, { isFetching: isDownloadingTemplate }] =
    useLazyGetProductTemplateQuery();

  const isActionLoading =
    isDeleting || isImporting || isExporting || isDownloadingTemplate; // Include new loading states

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
  const handleDeleteSelected = async (
    selectedIds: React.Key[]
  ): Promise<boolean> => {
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

  // --- Import/Export Handlers ---
  const handleExport = async () => {
    const key = "exporting_products";
    try {
      message.loading({ content: "Exporting products...", key, duration: 0 });
      const result = await triggerExport().unwrap();
      const url = window.URL.createObjectURL(result);
      const a = document.createElement("a");
      a.href = url;
      a.download = "products.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      message.success({ content: "Products exported successfully", key });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      message.error({ content: `Export failed: ${errorMsg}`, key });
    }
  };

  const handleDownloadTemplate = async () => {
    const key = "downloading_product_template";
    try {
      message.loading({ content: "Downloading template...", key, duration: 0 });
      const result = await triggerTemplate().unwrap();
      const url = window.URL.createObjectURL(result);
      const a = document.createElement("a");
      a.href = url;
      a.download = "product_template.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      message.success({ content: "Template downloaded successfully", key });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      message.error({ content: `Template download failed: ${errorMsg}`, key });
    }
  };

  const uploadProps: UploadProps = {
    name: "file",
    accept: ".xlsx, .xls",
    showUploadList: false,
    customRequest: async (options) => {
      const { file, onSuccess, onError } = options;
      const key = "importing_products";
      try {
        message.loading({ content: "Importing products...", key, duration: 0 });
        const formData = new FormData();
        formData.append("file", file as Blob);
        const res = await importProducts(formData).unwrap();
        if (res?.errors && res.errors.length > 0) {
          const errorMessages = (
            <>
              <p className="text-red-500">Import failed: </p>
              {res.errors.map((err, index) => {
                return <p key={index}>{err}</p>;
              })}
            </>
          );
          message.open({ content: errorMessages, key });
        } else {
          message.success({
            content: res?.message || "Products imported successfully",
            key,
          });
        }
        if (onSuccess) onSuccess({}, file as any);
        refetchProducts(); // Refetch after import
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        message.error({ content: `Import failed: ${errorMsg}`, key });
        if (onError) onError(error as Error);
      }
    },
    disabled: isImporting,
  };

  // --- Table Change Handler (May need adjustment if GenericDataTable handles differently) ---
  // Use correct signature from TableProps<Product>["onChange"]
  const handleTableChange: TableProps<Product>["onChange"] = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<Product> | SorterResult<Product>[]
  ) => {
    const currentSorter = Array.isArray(sorter) ? sorter[0] : sorter;
    setQueryParams((prev) => ({
      ...prev, // Keep existing limit/other params if not changed
      page: pagination.current || 1,
      limit: pagination.pageSize || 10, // Update limit from pagination
      filters,
      sortField: currentSorter?.field as string | undefined, // Use optional chaining
      sortOrder:
        currentSorter?.order === null ? undefined : currentSorter?.order, // Handle null case
    }));
  };

  // --- Get Columns from Hook ---
  const columns = useProductTableColumns({
    categories: categoriesData, // Pass the extracted array
    brands: brandsData, // Pass the extracted array
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
          // Use the extracted array
          categoriesData.find(
            (category: Category) => category?.name == product.productCategory.categoryName
          )?.id || categoriesData[0]?.id, // Optional chaining added previously
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
        onCreate={onCreate}
        onDeleteSelected={handleDeleteSelected}
        // Pass import/export props
        uploadProps={uploadProps}
        onExport={handleExport}
        onDownloadTemplate={handleDownloadTemplate}
        isActionLoading={isActionLoading}
        isDeleting={isDeleting}
        isImporting={isImporting}
        // Pass pagination config using the correct prop name 'pagination'
        pagination={{
          current: queryParams.page,
          pageSize: queryParams.limit,
          total: totalProducts,
          // Add other pagination options if needed by GenericDataTable/AntTable
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          showTotal: (total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        onChange={handleTableChange} // Pass the change handler (assuming GenericDataTable uses 'onChange')
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
