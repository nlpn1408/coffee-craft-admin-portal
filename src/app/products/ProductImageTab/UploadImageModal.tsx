"use client";

import React from 'react'; // Import React
import { Modal } from 'antd'; // Import Ant Design Modal
import { NewProductImage, ProductImage } from "@/types";
import { UploadImageForm } from "./UploadImageForm";

interface UploadImageModalProps {
  productId: string; // Added productId
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newProductImage: NewProductImage) => void;
  initialData?: ProductImage;
  isLoading?: boolean;
  isViewMode?: boolean; // Add isViewMode prop
}

const UploadImageModal: React.FC<UploadImageModalProps> = ({
  productId,
  isOpen,
  onClose,
  onCreate,
  initialData,
  isLoading = false,
  isViewMode = false, // Destructure isViewMode
}) => {

  // We need a way to trigger the form submission from the Modal's OK button.
  // One way is to use a Form instance and call form.submit()
  // Or, pass a submit handler down to the form and trigger it from here.
  // For simplicity, let's assume UploadImageForm takes an onFinish prop triggered by its own button for now.
  // A more integrated approach would use Ant Design Form instance.

  return (
    <Modal
      title={initialData ? "Edit Image" : "Upload New Image"}
      open={isOpen}
      onCancel={onClose}
      // Footer is often handled by the Form component's submit button
      // Or we can add custom footer buttons that trigger form submission
      footer={null} // Hide default OK/Cancel buttons if form has its own
      width={600} // Adjust width as needed
      destroyOnClose // Reset form state when modal is closed
    >
      <UploadImageForm
        productId={productId}
        onSave={onCreate}
        productImage={initialData}
        isLoading={isLoading}
        onCancel={onClose}
        isViewMode={isViewMode} // Pass isViewMode down
      />
    </Modal>
  );
};

export default UploadImageModal;
