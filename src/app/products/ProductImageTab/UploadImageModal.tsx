"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NewProductImage, ProductImage } from "@/types"; // Removed unused NewProduct, Product
import { UploadImageForm } from "./UploadImageForm";

interface UploadImageModalProps {
  productId: string; // Added productId
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newProductImage: NewProductImage) => void;
  initialData?: ProductImage;
}

const UploadImageModal = ({
  productId, // Destructure productId
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
          productId={productId} // Pass productId down
          onSave={onCreate}
          productImage={initialData}
          isLoading={false} // Assuming isLoading comes from a mutation hook in the parent
        />
      </DialogContent>
    </Dialog>
  );
};

export default UploadImageModal;
