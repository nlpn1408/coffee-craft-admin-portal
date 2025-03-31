"use client";

import React from "react"; // Import React
import { Modal } from "antd"; // Import Ant Design Modal
import { ProductForm } from "./ProductForm";
import { NewProduct, Product } from "@/types";
// Removed Shadcn Dialog imports

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newProduct: NewProduct) => void; // Keep onCreate prop name
  initialData?: Product;
  isLoading?: boolean; // Add isLoading prop for consistency, passed to ProductForm
}

const CreateProductModal = ({
  isOpen,
  onClose,
  onCreate,
  initialData,
  isLoading = false, // Default isLoading
}: CreateProductModalProps) => {
  const modalTitle = initialData ? "Edit Product" : "Create New Product";

  // Note: The actual form submission logic and state are handled within ProductForm.
  // This component just wraps it in a modal.

  return (
    <Modal
      title={modalTitle}
      open={isOpen}
      onCancel={onClose} // Use Antd Modal's onCancel
      footer={null} // Footer is likely handled within ProductForm or not needed
      width={900} // Keep the width
      destroyOnClose // Destroy form state when modal is closed
      maskClosable={false}
    >
      {/* Pass necessary props down to ProductForm */}
      <ProductForm
        onSave={onCreate} // Pass onCreate to ProductForm's onSave
        product={initialData}
        isLoading={isLoading} // Pass loading state down
        onCancel={onClose} // Re-add onCancel prop
      />
    </Modal>
  );
};

export default CreateProductModal;
