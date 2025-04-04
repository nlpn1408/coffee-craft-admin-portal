"use client";

import React, { useState } from "react";
import { notification, Button } from "antd";
import { GenericDataTable } from "@/components/GenericDataTable/GenericDataTable";
// Use absolute path aliases
import { useVariantTableColumns } from "@/app/products/product-details/useVariantTableColumns";
import CreateEditVariantModal from "@/app/products/product-details/CreateEditVariantModal";
import {
  useGetProductVariantsQuery,
  useDeleteProductVariantMutation,
} from "@/state/services/productVariantService";
import { Product, ProductVariant } from "@/types";

interface ProductVariantManagerProps {
  // Renamed props interface
  selectedProduct: Product | null;
  isViewMode?: boolean;
}

// Renamed component
const ProductVariantManager: React.FC<ProductVariantManagerProps> = ({
  selectedProduct,
  isViewMode = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );

  // --- Data Fetching ---
  const {
    data: variants,
    isLoading: isVariantsLoading,
    isError: isVariantsError, // Keep track of error state
    refetch: refetchVariants,
  } = useGetProductVariantsQuery(selectedProduct?.id!, {
    skip: !selectedProduct?.id,
  });

  // --- Mutations ---
  const [deleteVariant, { isLoading: isDeletingSingle }] =
    useDeleteProductVariantMutation();

  // --- Delete Handlers ---
  const handleDeleteSingle = async (variantId: string) => {
    if (!selectedProduct) return;

    try {
      await deleteVariant({
        productId: selectedProduct.id,
        id: variantId,
      }).unwrap();
      notification.success({
        message: "Success",
        description: "Variant deleted successfully.",
      });
    } catch (err: any) {
      console.error("Failed to delete variant:", err);
      const errorMessage =
        err?.data?.message || err?.error || "An unknown error occurred";
      notification.error({
        message: "Error",
        description: `Failed to delete variant: ${errorMessage}`,
      });
    }
  };

  // --- Columns Definition ---
  const columns = useVariantTableColumns({
    onEdit: (variant: ProductVariant) => {
      // Add explicit type here
      // Prevent opening edit modal in view mode
      if (!isViewMode) {
        setSelectedVariant(variant);
        setIsModalOpen(true);
      }
    },
    onDelete: handleDeleteSingle,
    isViewMode: isViewMode,
  });

  // --- Modal Handlers ---
  const handleOpenCreateModal = () => {
    // Prevent opening create modal in view mode
    if (!isViewMode) {
      setSelectedVariant(null);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVariant(null);
    // Refetch variants when modal closes (after create/edit)
    if (selectedProduct) {
      refetchVariants();
    }
  };

  if (!selectedProduct) {
    return (
      <div className="p-4 text-center text-gray-500">
        Please select a product first.
      </div>
    );
  }

  // Optional: Show error message if fetching variants failed
  if (isVariantsError) {
    return (
      <div className="p-4 text-center text-red-500">
        Failed to load variants.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Add Variant Button - Conditionally render */}
      {/* Modal is only opened via handlers which check isViewMode */}
      {isModalOpen && selectedProduct && (
        <CreateEditVariantModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          variant={selectedVariant}
          productId={selectedProduct.id}
        />
      )}
      <GenericDataTable<ProductVariant>
        dataSource={variants || []}
        columns={columns}
        loading={isVariantsLoading}
        entityName="Variant"
        // Pass create handler, disable button via isViewMode check above
        onCreate={handleOpenCreateModal}
        // Pass single delete loading state to disable actions column buttons
        isActionLoading={isDeletingSingle}
        rowKey="id"
        // Remove bulk delete props as they are not supported/needed here
      />
    </div>
  );
};

// Update export default
export default ProductVariantManager;
