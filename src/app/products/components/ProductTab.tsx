"use client";

import { Brand, Category, NewProduct, Product } from "@/types";
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetBrandQuery,
  useGetBrandsQuery,
  useGetCategoriesQuery,
  useGetProductsQuery,
  useUpdateProductMutation,
} from "@/state/api";
import { useRef, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ActionColumn } from "@/components/TableActionRow/ActionColumn";
import { handleApiError, showSuccessToast } from "@/lib/api-utils";
import Image from "next/image";
import { object } from "zod";
import CreateProductModal from "./CreateProductModal";
import { Carousel, Table, TableColumnsType } from "antd";
import { DataSourceItemType } from "antd/es/auto-complete/AutoComplete";
import { TableToolbar } from "@/components/TableToolbar/TableToolbar";
import { formatCurrency } from "@/utils/utils";

const ProductTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }>({});

  const {
    data: products,
    isLoading,
    isError,
  } = useGetProductsQuery({
    search: searchTerm || undefined,
    ...sortConfig,
  });

  const { data: categories } = useGetCategoriesQuery();
  const { data: brands } = useGetBrandsQuery();

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const handleCreateProduct = async (productData: NewProduct) => {
    try {
      await createProduct(productData).unwrap();
      showSuccessToast("Product created successfully");
      setIsModalOpen(false);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleUpdateProduct = async (id: string, productData: NewProduct) => {
    try {
      await updateProduct({ id, formData: productData }).unwrap();
      showSuccessToast("Product updated successfully");
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

  const handleDelete = (id: string) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete).unwrap();
        showSuccessToast("Product deleted successfully");
        setProductToDelete(null);
        setDeleteDialogOpen(false);
      } catch (error) {
        handleApiError(error);
      }
    }
  };

  //   if (isLoading) {
  //     return <div className="py-4">Loading...</div>;
  //   }

  if (!isLoading && (isError || !products)) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch products
      </div>
    );
  }

  const columns: TableColumnsType<Product> = [
    {
      title: "Image",
      dataIndex: "images",
      key: "images",
      render: (images) => {
        return images && images?.length ? (
          <div className="w-50 h-50 relative">
            <Carousel arrows infinite={false}>
              {images.map((image: any) => (
                <div key={image.id}>
                  <img src={image.url} alt={image.name} className="w-100" />
                </div>
              ))}
            </Carousel>
          </div>
        ) : (
          <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center">
            No image
          </div>
        );
      },
      width: 150,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      onFilter: (value, record) => record.name.includes(value as string),
      sorter: (a, b) => a.name.length - b.name.length,
      ellipsis: true,
      width: 250,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      filters:
        categories && categories.length > 0
          ? categories.map((category) => ({
              text: category.name,
              value: category.id,
            }))
          : [],
      onFilter: (value, record) => record.categoryId === value,
      sorter: (a, b) => a.category.name.length - b.category.name.length,
      ellipsis: true,
      render: (category) => category.name,
    },
    {
      title: "Brand",
      dataIndex: "brand",
      key: "brand",
      filters:
        brands && brands.length > 0
          ? brands.map((brand) => ({
              text: brand.name,
              value: brand.id,
            }))
          : [],
      onFilter: (value, record) => record.brandId === value,
      sorter: (a, b) => a.brand.name.length - b.brand.name.length,
      ellipsis: true,
      render: (brand) => brand.name,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      onFilter: (value, record) => record.description.includes(value as string),
      sorter: (a, b) => a.description.length - b.description.length,
      ellipsis: true,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => a.price - b.price,
      render: (price) => formatCurrency(price),
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      sorter: (a, b) => a.stock - b.stock,
      width: 100,
    },
    {
      title: "Rating",
      dataIndex: "avgRating",
      key: "avgRating",
      sorter: (a, b) => a.avgRating - b.avgRating,
      render: (avgRating) => {
        return avgRating > 0 ? avgRating.toFixed(1) : "N/A";
      },
      width: 100,
    },
    {
      title: "Status",
      dataIndex: "active",
      key: "active",
      filters: [
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
      onFilter: (value, record) => record.active === value,
      render: (active) => (active ? "Active" : "Inactive"),
      width: 100,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (createdAt) => new Date(createdAt).toLocaleString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <ActionColumn
          onEdit={() => handleEdit(record)}
          onDelete={() => handleDelete(record.id)}
        />
      ),
      width: 80,
      fixed: "right",
      align: "center",
    },
  ];

  return (
    <>
      <div className="mt-5">
        <div className="mb-4">
          <TableToolbar
            onCreate={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            createButtonLabel="Create Product"
          />
        </div>

        <Table<Product>
          columns={columns}
          dataSource={products?.data || []}
          pagination={{
            showTotal: (total) => `Total ${total} items`,
            showSizeChanger: true,
          }}
          loading={isLoading}
          scroll={{ x: 1800 }}
        />
      </div>

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
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
      />
    </>
  );
};

export default ProductTab;
