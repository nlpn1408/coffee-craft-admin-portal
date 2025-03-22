import { useState, useEffect } from "react";
import { Product } from "@/types";
import { ProductFormData } from "@/types/product-form";
import { UploadFile, UploadProps } from "antd";
import { deleteFromCloudinary } from "@/lib/cloudinary";

export const useProductForm = (initialData?: Product | null) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    categoryId: "",
    brandId: "",
    stock: 0,
    active: true,
    images: [],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || "",
        price: initialData.price,
        categoryId: initialData.categoryId || "",
        brandId: initialData.brandId || "",
        stock: initialData.stock,
        active: initialData.active,
        images: initialData.images || [],
      });
    }
  }, [initialData]);

  const handleInputChange = (
    name: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleThumbnailUpdate = (file: UploadFile) => {
    const url = file?.response?.secure_url || "";
    setFormData((prev) => ({ ...prev, thumbnail: file, thumbnailUrl: url }));
  };

  const handleImagesUpdate: UploadProps["onChange"] = ({
    fileList: newFileList,
  }) => {
    setFormData((prev) => ({
      ...prev,
      images: newFileList.map((f) => {
        return {

          file: f.originFileObj,
          isThumbnail: false,
          isNewImage: true,
        };
      }),
    }));
  };

  const handleImageRemove = (file: UploadFile, isThumbnail: boolean) => {
    if (isThumbnail) {
      setFormData((prev) => ({ ...prev, thumbnail: undefined }));
    } else {
      //   setFormData((prev) => ({
      //     ...prev,
      //     images: prev.images?.filter((f) => f !== file) || [],
      //   }));
    }
    console.log("🚀 ~ handleImageRemove ~ file:", file);
    deleteFromCloudinary(file?.response?.asset_id);
  };

  return {
    formData,
    handleInputChange,
    handleThumbnailUpdate,
    handleImagesUpdate,
    handleImageRemove,
  };
};
