"use client";

import React from "react";
import { Category, NewCategory } from "@/types";
import { Modal } from "antd"; // Only need Modal import
import { CategoryForm } from "./CategoryForm"; // Import the new form component

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: NewCategory) => Promise<void> | void; // Renamed from onSubmit
  isSuccess: boolean; // Keep for potential form reset logic if needed
  parentCategories?: Category[];
  initialData?: Category | null;
  isLoading?: boolean;
}

const CreateCategoryModal = ({
  isOpen,
  onClose,
  onCreate,
  isSuccess, // Pass down if CategoryForm needs it for reset
  parentCategories = [],
  initialData,
  isLoading = false,
}: CreateCategoryModalProps) => {
  const modalTitle = initialData ? "Edit Category" : "Create New Category";

  // Note: isSuccess prop is not directly used by CategoryForm currently,
  // but kept in props in case future reset logic needs it.
  // Form reset on open/close is handled within CategoryForm's useEffect.

  return (
    <Modal
      title={modalTitle}
      open={isOpen}
      onCancel={onClose} // Modal's cancel calls onClose directly
      footer={null} // Footer is rendered within CategoryForm
      destroyOnClose
      maskClosable={false}
      // Consider adjusting width if needed
    >
      {/* Render CategoryForm and pass necessary props */}
      <CategoryForm
        onSubmit={onCreate} // Pass the submission handler
        initialData={initialData}
        parentCategories={parentCategories}
        isLoading={isLoading}
        onCancel={onClose} // Pass onClose for the form's cancel button
      />
    </Modal>
  );
};

export default CreateCategoryModal;
