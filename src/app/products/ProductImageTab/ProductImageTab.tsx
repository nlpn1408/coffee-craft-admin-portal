"use client";

import { NewProductImage, Product, ProductImage } from "@/types"; // Add Product type
import {
  // api, // api seems unused
  useDeleteProductImageMutation,
  // useGetProductsQuery, // Remove product query
  useUpdateProductImageMutation,
  useUploadProductImageMutation,
} from "@/state/api";
import { useState } from "react";
import { notification } from "antd";
// import { DeleteDialog } from "@/components/ui/delete-dialog"; // Remove DeleteDialog import
import { handleApiError } from "@/lib/api-utils";
// import { Select } from "antd";
import { ProductImageTable } from "./ProductImageTable";
import UploadImageModal from "./UploadImageModal";
// import axios from "axios"; // axios seems unused

// Define props
interface ProductImageTabProps {
  selectedProduct: Product | null;
  isViewMode?: boolean; // Add isViewMode prop
}

const ProductImageTab: React.FC<ProductImageTabProps> = ({
  selectedProduct,
  isViewMode = false,
}) => {
  // Destructure isViewMode
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<ProductImage | null>(null);
  // Remove state related to DeleteDialog
  // const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  // const [productImageToDelete, setProductImageToDelete] = useState<string | null>(null);

  // Remove product query hook call

  const [uploadProductImage] = useUploadProductImageMutation();
  const [updateProductImage] = useUpdateProductImageMutation();
  const [deleteProductImage] = useDeleteProductImageMutation();

  // Renamed handler
  const handleCreateImage = async (imageData: NewProductImage) => {
    // Ensure productId is included from the selectedProduct prop
    if (!selectedProduct) return;
    const payload = { ...imageData, productId: selectedProduct.id };
    try {
      await uploadProductImage([payload]).unwrap();
      notification.success({
        message: "Success",
        description: "Image uploaded successfully.",
      }); // Use notification
      setIsModalOpen(false);
    } catch (error) {
      handleApiError(error);
    }
  };

  // Renamed handler
  const handleUpdateImage = async (
    id: string,
    productImageData: Partial<NewProductImage>
  ) => {
    if (!selectedProduct) return;
    // Exclude productId from the update payload, as it's usually not needed/allowed for updates
    const { productId, ...updateData } = productImageData;
    const payload = updateData;
    try {
      // Pass the payload without productId
      await updateProductImage({ id, productImageData: payload }).unwrap();
      notification.success({
        message: "Success",
        description: "Image updated successfully.",
      }); // Use notification
      setIsModalOpen(false);
      setEditingImage(null);
    } catch (error) {
      handleApiError(error);
    }
  };

  // Renamed handler
  const handleEditImage = (img: ProductImage) => {
    setEditingImage(img); // Use renamed state
    setIsModalOpen(true);
  };

  // This handler is now passed directly to ActionColumn's onDelete prop
  // which is used by Popconfirm's onConfirm
  const handleDeleteImage = async (id: string) => {
    try {
      await deleteProductImage(id).unwrap();
      notification.success({
        message: "Success",
        description: "Image deleted successfully.",
      });
      // Refetching might be needed if cache invalidation isn't perfect
    } catch (error) {
      handleApiError(error);
    }
  };

  // Remove handleConfirmDelete as it's handled by Popconfirm now

  // Don't render if no product is selected from the parent
  if (!selectedProduct) {
    return (
      <div className="p-4 text-center text-gray-500">No product selected.</div>
    );
  }

  // Remove loading/error state related to fetching all products

  return (
    <div className="space-y-4 p-4">
      {" "}
      {/* Added padding and spacing */}
      {/* Remove the Select dropdown */}
      {/* Always render table if selectedProduct exists */}
      <ProductImageTable
        selectedProductId={selectedProduct.id}
        // Disable create button trigger in view mode
        onCreate={() => {
          setEditingImage(null);
          setIsModalOpen(true);
        }} // Pass undefined if view mode
        onUpdate={handleUpdateImage}
        onEdit={handleEditImage}
        onDelete={handleDeleteImage}
        isViewMode={isViewMode} // Pass isViewMode down to table
      />
      {/* Modal rendering logic - ensure it doesn't open in view mode (already handled by onCreate check) */}
      {isModalOpen && (
        <UploadImageModal
          productId={selectedProduct.id} // Use ID from prop
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingImage(null); // Use renamed state
          }}
          // Use renamed handlers
          onCreate={
            editingImage
              ? (data) => handleUpdateImage(editingImage.id, data)
              : handleCreateImage
          }
          initialData={editingImage || undefined} // Use renamed state
        />
      )}
      {/* Remove DeleteDialog component */}
    </div>
  );
};

export default ProductImageTab;
