"use client";

import { NewProduct, Product } from "@/types";
import { 
  useCreateProductMutation, 
  useDeleteProductMutation,
  useGetProductsQuery, 
  useUpdateProductMutation 
} from "@/state/api";
import { useRef, useState } from "react";
import CreateProductModal from "./CreateProductModal";
import Header from "@/components/Header";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ActionColumn } from "@/components/TableActionRow/ActionColumn";
import { handleApiError, showSuccessToast } from "@/lib/api-utils";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ sortBy?: string; sortOrder?: 'asc' | 'desc' }>({});

  const {
    data: products,
    isLoading,
    isError,
  } = useGetProductsQuery({ 
    search: searchTerm || undefined,
    ...sortConfig
  });

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const handleCreateProduct = async (productData: NewProduct) => {
    try {
      const formData = new FormData();
      Object.entries(productData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      await createProduct(formData).unwrap();
      showSuccessToast("Product created successfully");
      setIsModalOpen(false);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleUpdateProduct = async (id: string, data: NewProduct) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      await updateProduct({ id, formData }).unwrap();
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

  const handleSort = (field: string, order: 'asc' | 'desc') => {
    setSortConfig({ sortBy: field, sortOrder: order });
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "id",
      header: "ID",
      sortingFn: "alphanumeric"
    },
    {
      accessorKey: "name",
      header: "Name",
      sortingFn: "alphanumeric"
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => row.getValue("description") || "N/A",
      sortingFn: "alphanumeric"
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => `$${row.getValue("price")}`,
      sortingFn: "basic"
    },
    {
      accessorKey: "stock",
      header: "Stock",
      sortingFn: "basic"
    },
    {
      accessorKey: "avgRating",
      header: "Rating",
      cell: ({ row }) => {
        const rating = row.getValue("avgRating") as number;
        return rating > 0 ? rating.toFixed(1) : "N/A";
      },
      sortingFn: "basic"
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }) => (row.getValue("active") ? "Active" : "Inactive"),
      sortingFn: "basic"
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <ActionColumn
            onEdit={() => handleEdit(product)}
            onDelete={() => handleDelete(product.id)}
          />
        );
      },
      enableSorting: false
    },
  ];

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (isError || !products) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch products
      </div>
    );
  }

  return (
    <div className="mx-auto pb-5 w-full">
      <div className="flex justify-between items-center mb-6">
        <Header name="Products" />
      </div>

      <div className="mt-5">
        <DataTable
          columns={columns}
          data={products}
          searchField="name"
          onCreate={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          createButtonLabel="Create Product"
          onSort={handleSort}
          enableClientSort={false}
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
        initialData={editingProduct}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
      />
    </div>
  );
};

export default Products;
