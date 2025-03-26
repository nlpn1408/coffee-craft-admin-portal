"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NewProduct, NewProductImage, Product, ProductImage } from "@/types";
import { UploadImageForm } from "./UploadImageForm";

interface UploadImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newProductImage: NewProductImage) => void;
  initialData?: ProductImage;
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
        <UploadImageForm
          onSave={onCreate}
          productImage={initialData}
          isLoading={false}
        />
      </DialogContent>
    </Dialog>
  );
};

export default UploadImageModal;
