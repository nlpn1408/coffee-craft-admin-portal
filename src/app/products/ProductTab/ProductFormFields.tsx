"use client";

import React from "react";
import { Input, Select, Switch, InputNumber, Form } from "antd";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { Category, Brand, NewProduct } from "@/types";
import { useGetBrandsQuery, useGetCategoriesQuery } from "@/state/api";
import { z } from "zod"; // Import z

const { Option } = Select;

// Define the schema *again* here or import it to ensure type consistency
// (Importing is better, but for simplicity here, we redefine)
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"), // Matches ProductForm schema
  price: z.coerce.number({
    required_error: " Price is required",
    invalid_type_error: "Price must be a number",
  }).positive("Price must be positive"),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().min(1, "Brand is required"),
  stock: z.coerce.number({
    required_error: "Stock is required",
    invalid_type_error: "Stock must be a number",
  }).int().nonnegative("Stock cannot be negative"),
  active: z.boolean().default(true),
});

// Infer type from the consistent schema definition
type ProductFormData = z.infer<typeof formSchema>;

interface ProductFormFieldsProps {
  control: Control<ProductFormData>; // Use the inferred type
  errors: FieldErrors<ProductFormData>;
}

export const ProductFormFields = ({ control, errors }: ProductFormFieldsProps) => {
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: brands = [] } = useGetBrandsQuery();

  return (
    <div className="space-y-4">
      {/* Name */}
      <Form.Item
        label="Name"
        validateStatus={errors.name ? "error" : ""}
        help={errors.name?.message}
        required
      >
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input {...field} placeholder="Enter product name" />
          )}
        />
      </Form.Item>

      {/* Description */}
      <Form.Item
        label="Description"
        validateStatus={errors.description ? "error" : ""}
        help={errors.description?.message}
        required
      >
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            // Handle potential null value from react-hook-form if schema changes later
            <Input.TextArea {...field} value={field.value ?? ''} rows={3} placeholder="Enter product description" />
          )}
        />
      </Form.Item>

      {/* Price */}
      <Form.Item
        label="Price (VND)"
        validateStatus={errors.price ? "error" : ""}
        help={errors.price?.message}
        required
      >
        <Controller
          name="price"
          control={control}
          render={({ field }) => (
            <InputNumber
              {...field}
              min={0}
              placeholder="Enter price"
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              // Fix: Parser must return number or null/undefined
              parser={(value) => {
                  const parsed = value!.replace(/\$\s?|(,*)/g, '');
                  const num = Number(parsed);
                  return isNaN(num) ? 0 : num; // Return 0 if parsing fails
              }}
            />
          )}
        />
      </Form.Item>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Category */}
        <Form.Item
          label="Category"
          validateStatus={errors.categoryId ? "error" : ""}
          help={errors.categoryId?.message}
          required
        >
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <Select {...field} placeholder="Select a category" allowClear>
                {categories.map((category) => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            )}
          />
        </Form.Item>

        {/* Brand */}
        <Form.Item
          label="Brand"
          validateStatus={errors.brandId ? "error" : ""}
          help={errors.brandId?.message}
          required
        >
          <Controller
            name="brandId"
            control={control}
            render={({ field }) => (
              <Select {...field} placeholder="Select a brand" allowClear>
                {brands.map((brand) => (
                  <Option key={brand.id} value={brand.id}>
                    {brand.name}
                  </Option>
                ))}
              </Select>
            )}
          />
        </Form.Item>

        {/* Stock */}
        <Form.Item
          label="Stock"
          validateStatus={errors.stock ? "error" : ""}
          help={errors.stock?.message}
          required
        >
          <Controller
            name="stock"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                min={0}
                placeholder="Enter stock quantity"
                style={{ width: '100%' }}
              />
            )}
          />
        </Form.Item>

        {/* Active */}
        <Form.Item
          label="Active Status"
          name="active"
          valuePropName="checked"
          validateStatus={errors.active ? "error" : ""}
          help={errors.active?.message}
        >
           <Controller
            name="active"
            control={control}
            render={({ field }) => (
               <Switch {...field} checked={field.value} />
            )}
          />
        </Form.Item>
      </div>
    </div>
  );
};
