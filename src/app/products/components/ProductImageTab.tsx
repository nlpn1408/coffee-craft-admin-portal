import { NewProduct, Product } from "@/types";
import {
  useCreateProductMutation,
  useDeleteProductMutation,
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

const ProductImageTab = () => {
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

  const handleSort = (field: string, order: "asc" | "desc") => {
    setSortConfig({ sortBy: field, sortOrder: order });
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "images",
      header: "Image",
      cell: ({ row }) => {
        console.log("🚀 ~ ProductImageTab ~ row:", row);
        const images = row.getValue("images") as any[];
        const imageUrl =
          images.find((image: any) => image.isThumbnail).url ||
          images[0].url ||
          [];
        return imageUrl ? (
          <div className="relative w-20 h-20">
            <Image
              src={imageUrl}
              alt={row.getValue("name") as string}
              fill
              className="object-cover rounded-md"
              sizes="80px"
            />
          </div>
        ) : (
          <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center">
            No image
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "productName",
      header: "Product Name",
      sortingFn: "basic",
    },

    {
      accessorKey: "order",
      header: "Order",
      sortingFn: "basic",
    },
    {
      accessorKey: "isThumbnail",
      header: "Thumbnail",
      cell: ({ row }) => {
        const isThumbnail = row.getValue("isThumbnail") as boolean;
        return isThumbnail ? "Yes" : "No";
      },
      sortingFn: "basic",
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
      enableSorting: false,
    },
  ];

  // if (isLoading) {
  //   return <div className="py-4">Loading...</div>;
  // }

  if (isError || !products?.data) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch images
      </div>
    );
  }
  return (
    <>
      <div className="mt-5">
        <div className="mb-4"> Total: {products.total}</div>
        <DataTable
          total={products.total}
          columns={columns}
          data={products.data}
          searchField="name"
          onCreate={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          createButtonLabel="Upload Image"
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

export default ProductImageTab;
