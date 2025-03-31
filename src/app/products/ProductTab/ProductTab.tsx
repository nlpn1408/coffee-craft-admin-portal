"use client";

import React, { useState, useMemo, useRef, useEffect, Key } from "react";
import { NewProduct, Product, Category, Brand, ProductImage } from "@/types";
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
  Popconfirm,
  Space,
  Table,
  Tag,
  Image,
  Input,
  message,
  Spin,
  InputRef,
  // Carousel, // Removed Carousel
} from "antd";
import type { TableProps, TablePaginationConfig } from "antd";
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import type { ColumnType, FilterConfirmProps, FilterDropdownProps } from 'antd/es/table/interface';
import {
  PlusOutlined,
  // ExportOutlined, // Add back if export is implemented
  // ImportOutlined, // Add back if import is implemented
  // DownloadOutlined, // Add back if template is implemented
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import CreateProductModal from "./CreateProductModal"; // Keep for now, will refactor later
import { handleApiError } from "@/lib/api-utils";
import { formatCurrency } from "@/utils/utils";

type DataIndex = keyof Product | 'category' | 'brand'; // Allow category/brand for filtering

const ProductTab = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  // State for server-side query params (filters, sort)
  const [queryParams, setQueryParams] = useState<{
    sortField?: string;
    sortOrder?: 'ascend' | 'descend';
    filters: Record<string, FilterValue | null>;
  }>({
    filters: {},
  });

  // Fetch Categories and Brands for filters
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: brandsData } = useGetBrandsQuery();

  // Prepare filters based on fetched data
  const categoryFilters = useMemo(() =>
    categoriesData?.map((cat: Category) => ({ text: cat.name, value: cat.id })) ?? [],
    [categoriesData]
  );
  const brandFilters = useMemo(() =>
    brandsData?.map((brand: Brand) => ({ text: brand.name, value: brand.id })) ?? [],
    [brandsData]
  );

  // Fetch Products based ONLY on server-side filter/sort params (excluding 'active')
  const {
    data: productsResponse, // This contains { data: Product[], total: number }
    isLoading,
    isFetching,
    isError,
  } = useGetProductsQuery({
    // No pagination params here
    search: queryParams.filters?.name?.[0] as string | undefined,
    categoryId: queryParams.filters?.category?.[0] as string | undefined,
    brandId: queryParams.filters?.brand?.[0] as string | undefined,
    sortBy: queryParams.sortField,
    sortOrder: queryParams.sortOrder === 'ascend' ? 'asc' : queryParams.sortOrder === 'descend' ? 'desc' : undefined,
    // Removed 'active' parameter as it's not explicitly defined in the hook args
  });

  // Use the fetched data directly for the table dataSource
  const products = useMemo(() => productsResponse?.data ?? [], [productsResponse]);

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  // Add state/hooks for export/import/template if needed

  const isActionLoading = isCreating || isUpdating || isDeleting; // Combine action loading states

  const handleCreateProduct = async (productData: NewProduct) => {
    try {
      await createProduct(productData).unwrap();
      message.success("Product created successfully");
      setIsModalOpen(false);
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
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteSingle = async (id: string) => {
    try {
      await deleteProduct(id).unwrap();
      message.success("Product deleted successfully");
    } catch (error) {
      handleApiError(error);
    }
  };

  // --- Column Search Logic ---
  const searchInput = useRef<InputRef>(null);
  const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<Product> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }: FilterDropdownProps) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${String(dataIndex)}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => confirm({ closeDropdown: false })}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => confirm({ closeDropdown: false })}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && clearFilters()}
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
    // onFilter is not needed for server-side filtering for search
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) => text,
  });
  // --- End Column Search Logic ---

  // Handle Table changes for server-side filtering/sorting
  const handleTableChange: TableProps<Product>['onChange'] = (
    pagination, // Pagination is client-side, ignore changes here
    filters,
    sorter,
  ) => {
    const currentSorter = sorter as SorterResult<Product>;
    // Update queryParams state to trigger refetch with new filters/sort
    setQueryParams({
      filters,
      sortField: currentSorter.field as string | undefined,
      sortOrder: currentSorter.order as 'ascend' | 'descend' | undefined,
    });
  };

  const columns: TableProps<Product>["columns"] = [
     {
      title: "Image",
      dataIndex: "images",
      key: "images",
      render: (images: ProductImage[] | undefined) => {
        const imageUrl = images && images.length > 0 ? images[0]?.url : null;
        const imageAlt = 'Product';
        const allImageUrls = images ? images.map(img => img.url) : [];

        return imageUrl ? (
          <Image.PreviewGroup items={allImageUrls}>
             <Image
                width={60}
                height={60}
                src={imageUrl}
                alt={imageAlt}
                style={{ objectFit: 'cover', borderRadius: '4px' }}
             />
          </Image.PreviewGroup>
        ) : (
          <div className="w-[60px] h-[60px] bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">
            No image
          </div>
        );
      },
      width: 80,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
      ...getColumnSearchProps('name'),
      ellipsis: true,
      width: 250,
      sortOrder: queryParams.sortField === 'name' ? queryParams.sortOrder : undefined,
      filteredValue: queryParams.filters?.name || null,
    },
    {
      title: "Category",
      dataIndex: ["category", "name"],
      key: "category",
      filters: categoryFilters,
      filteredValue: queryParams.filters?.category || null,
      sorter: true, // Server-side sort
      ellipsis: true,
      sortOrder: queryParams.sortField === 'category' ? queryParams.sortOrder : undefined,
      // onFilter is handled server-side via handleTableChange
    },
    {
      title: "Brand",
      dataIndex: ["brand", "name"],
      key: "brand",
      filters: brandFilters,
      filteredValue: queryParams.filters?.brand || null,
      sorter: true, // Server-side sort
      ellipsis: true,
      sortOrder: queryParams.sortField === 'brand' ? queryParams.sortOrder : undefined,
      // onFilter is handled server-side via handleTableChange
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      sorter: true,
      render: (price) => formatCurrency(price),
      align: 'right',
      sortOrder: queryParams.sortField === 'price' ? queryParams.sortOrder : undefined,
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      sorter: true,
      align: 'right',
      width: 100,
      sortOrder: queryParams.sortField === 'stock' ? queryParams.sortOrder : undefined,
    },
    {
      title: "Rating",
      dataIndex: "avgRating",
      key: "avgRating",
      sorter: true,
      render: (avgRating) => (avgRating > 0 ? avgRating.toFixed(1) : "N/A"),
      align: 'center',
      width: 100,
      sortOrder: queryParams.sortField === 'avgRating' ? queryParams.sortOrder : undefined,
    },
    {
      title: "Status",
      dataIndex: "active",
      key: "active",
      filters: [
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
      filteredValue: queryParams.filters?.active || null,
      // onFilter is handled server-side via handleTableChange
      render: (active) => <Tag color={active ? 'green' : 'red'}>{active ? "Active" : "Inactive"}</Tag>,
      width: 100,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      render: (createdAt) => new Date(createdAt).toLocaleString(),
      sortOrder: queryParams.sortField === 'createdAt' ? queryParams.sortOrder : undefined,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
           <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
            aria-label="Edit"
            disabled={isActionLoading}
          />
          <Popconfirm
            title="Delete Product"
            description="Are you sure you want to delete this product?"
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
      width: 80,
      fixed: "right",
      align: "center",
    },
  ];

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
             {/* Add Import/Export/Template buttons here if hooks are available */}
           </Space>
        </div>

        {/* Table */}
        <Spin spinning={isLoading || isFetching}>
          <Table<Product>
            columns={columns}
            dataSource={products}
            rowKey="id"
            // Client-side pagination configuration
            pagination={{
              total: products.length, // Total based on current client-side data
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            loading={isLoading || isFetching}
            onChange={handleTableChange} // Handle server-side sort/filter changes
            scroll={{ x: 1800 }}
            size="small"
          />
        </Spin>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <CreateProductModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
          // Correct prop name is onCreate
          onCreate={
            editingProduct
              ? (data) => handleUpdateProduct(editingProduct.id, data)
              : handleCreateProduct
          }
          initialData={editingProduct || undefined}
          // isLoading prop is not accepted by CreateProductModal
        />
      )}

      {/* Delete Dialog removed - handled by Popconfirm */}
    </>
  );
};

export default ProductTab;
