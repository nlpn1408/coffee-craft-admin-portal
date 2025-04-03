"use client";

import React from 'react';
import { Modal } from 'antd';
import { NewProductImage, ProductImage } from "@/types";
import { UploadImageForm } from "@/app/products/product-details/UploadImageForm"; // Use absolute path alias

interface UploadImageModalProps {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newProductImage: NewProductImage) => void;
  initialData?: ProductImage;
  isLoading?: boolean;
  isViewMode?: boolean;
}

const UploadImageModal: React.FC<UploadImageModalProps> = ({
  productId,
  isOpen,
  onClose,
  onCreate,
  initialData,
  isLoading = false,
  isViewMode = false,
}) => {

  // Assuming UploadImageForm handles its own submission via internal button

  return (
    <Modal
      title={initialData ? "Edit Image" : "Upload New Image"}
      open={isOpen}
      onCancel={onClose}
      footer={null} // Hide default buttons
      width={600}
      destroyOnClose
    >
      <UploadImageForm
        productId={productId}
        onSave={onCreate}
        productImage={initialData}
        isLoading={isLoading}
        onCancel={onClose} // Pass cancel handler to form
        isViewMode={isViewMode}
      />
    </Modal>
  );
};

export default UploadImageModal;
