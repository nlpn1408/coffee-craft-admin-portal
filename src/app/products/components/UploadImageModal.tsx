"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductForm } from "./ProductForm";
import { NewProduct, Product } from "@/types";
import { Button } from "@/components/ui/button";

interface UploadImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newProduct: NewProduct) => void;
  initialData?: Product;
}

const UploadImageModal = ({
  isOpen,
  onClose,
  onCreate,
  initialData,
}: UploadImageModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[900px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Image" : "Upload New Image"}
          </DialogTitle>
        </DialogHeader>
        <ProductForm
          onSave={onCreate}
          product={initialData}
          isLoading={false}
        />
      </DialogContent>
    </Dialog>
  );
};

export default UploadImageModal;
