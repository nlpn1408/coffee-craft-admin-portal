"use client";

import React, { useState } from "react"; // Added React import
import { NewProductImage, Product, ProductImage } from "@/types";
import {
  useDeleteProductImageMutation,
  useUpdateProductImageMutation,
  useUploadProductImageMutation,
} from "@/state/api";
import { notification } from "antd";
import { handleApiError } from "@/lib/api-utils";
import { ProductImageTable } from "./ProductImageTable";
import UploadImageModal from "./UploadImageModal";

interface ProductImageManagerProps {
  selectedProduct: Product | null;
  isViewMode?: boolean;
}

const ProductImageManager: React.FC<ProductImageManagerProps> = ({
  selectedProduct,
  isViewMode = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<ProductImage | null>(null);

  const [uploadProductImage] = useUploadProductImageMutation();
  const [updateProductImage] = useUpdateProductImageMutation();
  const [deleteProductImage, { isLoading: isDeleting }] = useDeleteProductImageMutation(); // Keep track of delete loading state

  const handleCreateImage = async (imageData: NewProductImage) => {
    if (!selectedProduct) return;
    const payload = { ...imageData, productId: selectedProduct.id };
    try {
      await uploadProductImage([payload]).unwrap();
      notification.success({
        message: "Success",
        description: "Image uploaded successfully.",
      });
      setIsModalOpen(false);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleUpdateImage = async (
    id: string,
    productImageData: Partial<NewProductImage>
  ) => {
    if (!selectedProduct) return;
    const { productId, ...updateData } = productImageData;
    const payload = updateData;
    try {
      await updateProductImage({ id, productImageData: payload }).unwrap();
      notification.success({
        message: "Success",
        description: "Image updated successfully.",
      });
      setIsModalOpen(false);
      setEditingImage(null);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleEditImage = (img: ProductImage) => {
     // Prevent opening edit modal in view mode
    if (!isViewMode) {
        setEditingImage(img);
        setIsModalOpen(true);
    }
  };

  const handleDeleteImage = async (id: string) => {
    // Prevent delete in view mode (already handled by ActionColumn disable, but good practice)
    if (isViewMode) return;
    try {
      await deleteProductImage(id).unwrap();
      notification.success({
        message: "Success",
        description: "Image deleted successfully.",
      });
    } catch (error) {
      handleApiError(error);
    }
  };

   const handleOpenCreateModal = () => {
        // Prevent opening create modal in view mode
        if (!isViewMode) {
            setEditingImage(null);
            setIsModalOpen(true);
        }
    };

  if (!selectedProduct) {
    return (
      <div className="p-4 text-center text-gray-500">No product selected.</div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <ProductImageTable
        selectedProductId={selectedProduct.id}
        onCreate={handleOpenCreateModal} // Use handler that checks view mode
        onUpdate={handleUpdateImage}
        onEdit={handleEditImage}
        onDelete={handleDeleteImage}
        isViewMode={isViewMode}
        isDeleting={isDeleting} // Pass delete loading state to table/action column
      />
      {/* Modal is only opened via handlers which check isViewMode */}
      {isModalOpen && (
        <UploadImageModal
          productId={selectedProduct.id}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingImage(null);
          }}
          // Add correct types for the 'data' parameter in the callbacks
          onCreate={
            editingImage
              ? (data: Partial<NewProductImage>) => handleUpdateImage(editingImage.id, data)
              : (data: NewProductImage) => handleCreateImage(data)
          }
          initialData={editingImage || undefined}
          // Pass loading state if UploadImageModal uses it
          // isLoading={isUploading || isUpdating}
          isViewMode={isViewMode} // Pass isViewMode to modal/form
        />
      )}
    </div>
  );
};

// Update export default
export default ProductImageManager;