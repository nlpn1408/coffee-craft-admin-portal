"use client";

import { NewProductImage, ProductImage } from "@/types";
import {
  api,
  useDeleteProductImageMutation,
  useGetProductsQuery,
  useUpdateProductImageMutation,
  useUploadProductImageMutation,
} from "@/state/api";
import { useState } from "react";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { handleApiError, showSuccessToast } from "@/lib/api-utils";
import { Select } from "antd";
import { ProductImageTable } from "./ProductImageTable";
import UploadImageModal from "./UploadImageModal";

const ProductImageTab = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductImage | null>(
    null
  );
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productImageToDelete, setProductImageToDelete] = useState<
    string | null
  >(null);

  const { data: products, isLoading, isError } = useGetProductsQuery({});

  const [uploadProductImage] = useUploadProductImageMutation();
  const [updateProductImage] = useUpdateProductImageMutation();
  const [deleteProductImage] = useDeleteProductImageMutation();

  const handleCreateProduct = async (imageData: NewProductImage) => {
    try {
      await uploadProductImage([imageData]).unwrap();
      showSuccessToast("Product created successfully");
      setIsModalOpen(false);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleUpdateProductImage = async (
    id: string,
    productImageData: NewProductImage
  ) => {
    try {
      await updateProductImage({ id, productImageData }).unwrap();

      showSuccessToast("Product updated successfully");
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleEdit = (imgs: ProductImage) => {
    setEditingProduct(imgs);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setProductImageToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (productImageToDelete) {
      try {
        await deleteProductImage(productImageToDelete).unwrap();
        showSuccessToast("Product deleted successfully");
        setProductImageToDelete(null);
        setDeleteDialogOpen(false);
      } catch (error) {
        handleApiError(error);
      }
    }
  };

  if (!isLoading && (isError || !products)) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch products
      </div>
    );
  }

  return (
    <>
      {products?.data && products.data.length > 0 && (
        <Select
          showSearch
          placeholder="Select a product"
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          options={products.data.map((product) => ({
            value: product.id,
            label: product.name,
          }))}
          onChange={(value) => setSelectedProductId(value)}
          style={{ width: "35%" }}
        />
      )}
      {selectedProductId ? (
        <ProductImageTable
          selectedProductId={selectedProductId}
          onCreate={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          onUpdate={handleUpdateProductImage}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : null}

      {/* Conditionally render modal only when a product is selected */}
      {selectedProductId && (
        <UploadImageModal
          productId={selectedProductId}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
          onCreate={
            editingProduct
              ? (data) => handleUpdateProductImage(editingProduct.id, data)
              : handleCreateProduct
          }
          initialData={editingProduct || undefined}
        />
      )}

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
