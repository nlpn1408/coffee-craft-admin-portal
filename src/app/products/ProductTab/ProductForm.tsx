"use client"; // Ensure client component directive

import React, { useEffect } from "react"; // Import React
import { Button, Form, Space, Spin } from "antd"; // Import Ant Design components
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// Removed Shadcn Form import
import { ProductFormFields } from "./ProductFormFields"; // Keep ProductFormFields for now
import { NewProduct, Product } from "@/types";

// Keep the same schema
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce
    .number({
      required_error: " Price is required",
      invalid_type_error: "Price must be a number",
    })
    .positive("Price must be positive"),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().min(1, "Brand is required"),
  stock: z.coerce
    .number({
      required_error: "Stock is required",
      invalid_type_error: "Stock must be a number",
    })
    .int()
    .nonnegative("Stock cannot be negative"),
  active: z.boolean().default(true), // Default active to true
});

type ProductFormData = z.infer<typeof formSchema>;

type Props = {
  product?: Product;
  onSave: (productFormData: NewProduct) => void;
  isLoading: boolean;
  onCancel: () => void; // Add onCancel prop
};

export const ProductForm = ({
  onSave,
  isLoading,
  product,
  onCancel,
}: Props) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }, // Keep errors for potential use with Controller
  } = useForm<ProductFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      categoryId: "",
      brandId: "",
      stock: 0,
      active: true, // Default active state
    },
  });

  // Reset form when product data changes
  useEffect(() => {
    if (product) {
      reset({
        name: product.name || "",
        description: product.description || "",
        price: product.price || 0,
        categoryId: product.categoryId || "",
        brandId: product.brandId || "",
        stock: product.stock || 0,
        active: product.active ?? true, // Use nullish coalescing for boolean
      });
    } else {
      // Reset to default values when creating a new product
      reset({
        name: "",
        description: "",
        price: 0,
        categoryId: "",
        brandId: "",
        stock: 0,
        active: true,
      });
    }
  }, [product, reset]);

  const onSubmit = (formDataJson: ProductFormData) => {
    // Process data if needed (e.g., ensure numbers are numbers)
    const processedData: NewProduct = {
      ...formDataJson,
      price: Number(formDataJson.price),
      stock: Number(formDataJson.stock),
    };
    onSave(processedData);
  };

  return (
    // Use Ant Design Form - no need for spread operator {...form}
    // Use handleSubmit from react-hook-form with Antd Form's onFinish
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Spin spinning={isLoading}>
        {/* Pass control and errors down to the fields component */}
        <ProductFormFields control={control} errors={errors} />

        <Form.Item className="mt-6 pt-4 border-t">
          {" "}
          {/* Use Form.Item for layout */}
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
