"use client";

import React, { useState } from "react";
import { notification, Button } from "antd";
import { GenericDataTable } from "@/components/GenericDataTable/GenericDataTable";
// Use relative path aliases for components within the same feature folder

import {
  useGetProductVariantsQuery,
  useDeleteProductVariantMutation,
} from "@/state/services/productVariantService";
import { Product, ProductVariant } from "@/types";
import CreateEditVariantModal from "./CreateEditVariantModal";
import { useVariantTableColumns } from "./useVariantTableColumns";

interface ProductVariantManagerProps {
  selectedProduct: Product | null;
  isViewMode?: boolean;
}

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
    isError: isVariantsError,
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
    if (!isViewMode) {
      setSelectedVariant(null);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVariant(null);
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

  if (isVariantsError) {
    return (
      <div className="p-4 text-center text-red-500">
        Failed to load variants.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
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
        onCreate={handleOpenCreateModal}
        isActionLoading={isDeletingSingle}
        rowKey="id"
        // createDisabled={isViewMode}
      />
    </div>
  );
};

export default ProductVariantManager;