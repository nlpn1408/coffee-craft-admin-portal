"use client";

import {
  Brand,
  Category,
  NewProduct,
  NewProductImage,
  Product,
  ProductImage,
} from "@/types";
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetBrandQuery,
  useGetBrandsQuery,
  useGetCategoriesQuery,
  useGetProductImagesQuery,
  useGetProductsQuery,
  useUpdateProductImageMutation,
  useUpdateProductMutation,
  useUploadProductImageMutation,
} from "@/state/api";
import { useEffect, useRef, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ActionColumn } from "@/components/TableActionRow/ActionColumn";
import { handleApiError, showSuccessToast } from "@/lib/api-utils";
import Image from "next/image";
import { object } from "zod";
import CreateProductModal from "../ProductTab/CreateProductModal";
import { Carousel, Select, Table, TableColumnsType } from "antd";
import { DataSourceItemType } from "antd/es/auto-complete/AutoComplete";
import { TableToolbar } from "@/components/TableToolbar/TableToolbar";
import { formatCurrency } from "@/utils/utils";
import { ProductImageTable } from "./ProductImageTable";
import UploadImageModal from "./UploadImageModal";

const ProductImageTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductImage | null>(
    null
  );
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const { data: products, isLoading, isError } = useGetProductsQuery({});

  const [uploadProductImage] = useUploadProductImageMutation();
  const [updateProductImage] = useUpdateProductImageMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const handleCreateProduct = async (imageData: NewProductImage) => {
    try {
      await uploadProductImage(imageData).unwrap();
      showSuccessToast("Product created successfully");
      setIsModalOpen(false);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleUpdateProductImage = async (
    id: string,
    productImageData: NewProductImage
  ) => {
    try {
      await updateProductImage({ id, productImageData }).unwrap();

      showSuccessToast("Product updated successfully");
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleEdit = (imgs: ProductImage) => {
    setEditingProduct(imgs);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete).unwrap();
        showSuccessToast("Product deleted successfully");
        setProductToDelete(null);
        setDeleteDialogOpen(false);
      } catch (error) {
        handleApiError(error);
      }
    }
  };

  //   if (isLoading) {
  //     return <div className="py-4">Loading...</div>;
  //   }

  if (!isLoading && (isError || !products)) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch products
      </div>
    );
  }

  return (
    <>
      {products?.data && products.data.length > 0 && (
        <Select
          showSearch
          placeholder="Select a product"
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          options={products.data.map((product) => ({
            value: product.id,
            label: product.name,
          }))}
          onChange={(value) => setSelectedProductId(value)}
          style={{ width: "35%" }}
        />
      )}
      {selectedProductId ? (
        <ProductImageTable
          selectedProductId={selectedProductId}
          onCreate={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          onUpdate={handleUpdateProductImage}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : null}

      <UploadImageModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onCreate={
          editingProduct
            ? (data) => handleUpdateProductImage(editingProduct.id, data)
            : handleCreateProduct
        }
        initialData={editingProduct || undefined}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
      />
    </>
  );
};

export default ProductImageTab;
