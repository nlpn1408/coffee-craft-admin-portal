"use client";

import React from "react";
import { Brand, NewBrand } from "@/types";
import { Modal } from "antd";
import { BrandForm } from "./BrandForm"; // Import the form component

// Define props, ensuring initialData is included
interface CreateBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: NewBrand) => Promise<void> | void;
  isSuccess?: boolean;
  initialData?: Brand | null; // Add initialData prop
  isLoading?: boolean;
}

export default function CreateBrandModal({
  isOpen,
  onClose,
  onCreate,
  isSuccess, // Prop is kept but not directly used by BrandForm
  initialData, // Accept initialData
  isLoading = false,
}: CreateBrandModalProps) {
  const modalTitle = initialData ? "Edit Brand" : "Create Brand";

  return (
    <Modal
      title={modalTitle}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      maskClosable={false}
    >
      {/* Render BrandForm and pass necessary props */}
      <BrandForm
        onSubmit={onCreate}
        initialData={initialData} // Pass initialData down
        isLoading={isLoading}
        onCancel={onClose}
      />
    </Modal>
  );
}
