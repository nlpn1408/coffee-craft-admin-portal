"use client"; // Ensure client component directive

import React, { useEffect } from "react"; // Import React
import { Button, Form, Space, Spin } from "antd"; // Import Ant Design components
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// Removed Shadcn Form import
import { ProductFormFields } from "./ProductFormFields";
import { NewProduct, Product } from "@/types";

// Updated schema based on Prisma model
const formSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Name is required"),
  shortDescription: z.string().optional().nullable(),
  longDescription: z.string().optional().nullable(),
  price: z.coerce.number({
    required_error: "Price is required",
    invalid_type_error: "Price must be a number",
  }).positive("Price must be positive"),
  discountPrice: z.coerce.number({
    invalid_type_error: "Discount price must be a number",
  }).nonnegative("Discount price cannot be negative").optional().nullable(),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().optional().nullable(), // Optional brand
  stock: z.coerce.number({
    required_error: "Stock is required",
    invalid_type_error: "Stock must be a number",
  }).int().nonnegative("Stock cannot be negative"), // Ensure integer
  active: z.boolean().default(true),
  tags: z.array(z.string()).optional(), // Add tags schema
});

type ProductFormData = z.infer<typeof formSchema>;

// Helper to convert empty strings to null for optional fields
const emptyStringToNull = (value: string | null | undefined): string | null => {
  return value === "" ? null : value ?? null;
};

type Props = {
  product?: Product;
  onSave: (productFormData: NewProduct) => void;
  isLoading: boolean;
  onCancel: () => void; // Add onCancel prop
};

export const ProductForm = ({ onSave, isLoading, product, onCancel }: Props) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }, // Keep errors for potential use with Controller
  } = useForm<ProductFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sku: "",
      name: "",
      shortDescription: "",
      longDescription: "",
      price: 0,
      discountPrice: null, // Default to null for optional number
      categoryId: "",
      brandId: null, // Default to null for optional string
      stock: 0,
      active: true,
      tags: [], // Default tags to empty array
    },
  });

  // Reset form when product data changes
  useEffect(() => {
    if (product) {
      reset({
        sku: product.sku || "",
        name: product.name || "",
        shortDescription: product.shortDescription || "",
        longDescription: product.longDescription || "",
        price: product.price, // Already a number
        discountPrice: product.discountPrice ?? null, // Handle null
        categoryId: product.categoryId || "",
        brandId: product.brandId || null, // Handle null
        stock: product.stock, // Already a number
        active: product.active ?? true,
        tags: product.tags ? product.tags.map(tag => tag.name) : [],
      });
    } else {
      // Reset to default values when creating a new product
      // Reset to default values when creating a new product
      reset({
        sku: "",
        name: "",
        shortDescription: "",
        longDescription: "",
        price: 0,
        discountPrice: null,
        categoryId: "",
        brandId: null,
        stock: 0,
        active: true,
        tags: [],
      });
    }
  }, [product, reset]);

  const onSubmit = (formData: ProductFormData) => {
    // Process data: convert empty strings to null for optional fields
    const processedData: NewProduct = {
      ...formData,
      brandId: emptyStringToNull(formData.brandId),
      shortDescription: emptyStringToNull(formData.shortDescription),
      longDescription: emptyStringToNull(formData.longDescription),
      // Ensure numeric types are correctly handled (already done by zod coerce)
      price: formData.price,
      discountPrice: formData.discountPrice,
      stock: formData.stock,
      tags: formData.tags || [],
    };
    onSave(processedData);
  };

  return (
    // Use Ant Design Form - no need for spread operator {...form}
    // Use handleSubmit from react-hook-form with Antd Form's onFinish
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
       <Spin spinning={isLoading}>
        {/* Pass control and errors down to the fields component */}
        <ProductFormFields/>

        <Form.Item className="mt-6 pt-4 border-t"> {/* Use Form.Item for layout */}
          <div className="flex justify-end">
            <Space>
              <Button onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={isLoading}>
                {product ? "Update" : "Create"} Product
              </Button>
            </Space>
          </div>
        </Form.Item>
       </Spin>
    </Form>
  );
};
