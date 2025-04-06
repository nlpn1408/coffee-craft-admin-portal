"use client";

import React, { useMemo, useRef, useState } from "react";
import { Input, Select, Switch, Form, FormInstance } from "antd";
import { useGetBrandsQuery, useGetCategoriesQuery } from "@/state/api";
import RichTextEditor from "@/components/RichTextEditor";
import ProductTagAssociation from "./ProductTagAssociation";

const { Option } = Select;

interface ProductFormFieldsProps {
  isViewMode?: boolean;
}

export const ProductFormFields = ({
  isViewMode = false,
}: ProductFormFieldsProps) => {
  const form = Form.useFormInstance();
  const price = Form.useWatch("price", form);

  const { data: categoriesResponse } = useGetCategoriesQuery({});
  const { data: brandsResponse } = useGetBrandsQuery({});
  // Extract the arrays from the responses
  const categories = useMemo(
    () => categoriesResponse?.data ?? [],
    [categoriesResponse]
  );

  const brands = useMemo(() => brandsResponse?.data ?? [], [brandsResponse]);

  return (
    <div> {/* Main wrapper - Remove space-y-6 if present */}
      {/* Row 1: SKU & Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Form.Item
          label="SKU"
          name="sku"
          rules={[{ required: true, message: "SKU is required" }]}
        >
          <Input placeholder="Enter product SKU" disabled={isViewMode} />
        </Form.Item>
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Name is required" }]}
        >
          <Input placeholder="Enter product name" disabled={isViewMode} />
        </Form.Item>
      </div> {/* End of SKU/Name row */}

      {/* Short Description */}
      <Form.Item label="Short Description" name="shortDescription" className="mb-4">
        {/* Replace with RichTextEditor */}
        <RichTextEditor
          placeholder="Enter short description (optional)"
          disabled={isViewMode}
        />
      </Form.Item>

      {/* Long Description */}
      <Form.Item label="Long Description" name="longDescription" className="mb-4">
        {/* Replace with RichTextEditor */}
        <RichTextEditor
          placeholder="Enter detailed description (optional)"
          disabled={isViewMode}
        />
      </Form.Item>

      {/* Row 3: Category, Brand, Tags */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
         {/* Category */}
         <Form.Item
           label="Category"
           name="categoryId"
           rules={[{ required: true, message: "Category is required" }]}
         >
           <Select
             placeholder="Select a category"
             allowClear
             disabled={isViewMode}
           >
             {categories.map((category) => (
               <Option key={category.id} value={category.id}>
                 {category.name}
               </Option>
             ))}
           </Select>
         </Form.Item>

         {/* Brand */}
         <Form.Item label="Brand" name="brandId">
           <Select
             placeholder="Select a brand (optional)"
             allowClear
             disabled={isViewMode}
           >
             {brands.map((brand) => (
               <Option key={brand.id} value={brand.id}>
                 {brand.name}
               </Option>
             ))}
           </Select>
         </Form.Item>

         {/* Tags */}
         <Form.Item label="Tags" name="tags">
            <ProductTagAssociation disabled={isViewMode} />
         </Form.Item>
      </div>

      {/* Row 4: Price, Discount Price, Stock, Active */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"> {/* No margin needed on last row */}
         {/* Price */}
         <Form.Item
           label="Price (VND)"
           name="price"
           rules={[
             { required: true, message: "Price is required" },
             {
               validator: (_, value) => {
                 if (value === undefined || value === null || value === "") {
                   return Promise.reject(new Error("Price is required"));
                 }
                 const numValue = Number(value);
                 if (isNaN(numValue)) {
                   return Promise.reject(new Error("Price must be a valid number"));
                 }
                 if (numValue < 0) {
                   return Promise.reject(new Error("Price must be non-negative"));
                 }
                 return Promise.resolve();
               },
             },
           ]}
         >
           <Input
             placeholder="Enter price"
             style={{ width: "100%", textAlign: "end" }}
             disabled={isViewMode}
           />
         </Form.Item>

         {/* Discount Price */}
         <Form.Item
           label="Discount Price (VND)"
           name="discountPrice"
           rules={[
             {
               validator: (_, value) => {
                 if (value === undefined || value === null || value === "") {
                   return Promise.resolve();
                 }
                 const numValue = Number(value);
                 if (isNaN(numValue)) {
                   return Promise.reject(new Error("Discount price must be a valid number"));
                 }
                 if (numValue < 0) {
                   return Promise.reject(new Error("Discount price must be non-negative"));
                 }
                 if (price !== undefined && price !== null && numValue >= Number(price)) {
                   return Promise.reject(new Error("Discount must be less than price"));
                 }
                 return Promise.resolve();
               },
             },
           ]}
         >
           <Input
             placeholder="Optional discount price"
             style={{ width: "100%", textAlign: "end" }}
             disabled={isViewMode}
           />
         </Form.Item>

        {/* Stock */}
        <Form.Item
          label="Stock"
          name="stock"
          rules={[
            { required: true, message: "Stock is required" },
            {
              validator: (_, value) => {
                if (value === undefined || value === null || value === "") {
                  return Promise.reject(new Error("Stock is required"));
                }
                const numValue = Number(value);
                if (isNaN(numValue) || !Number.isInteger(numValue)) {
                  return Promise.reject(
                    new Error("Stock must be a valid integer")
                  );
                }
                if (numValue < 0) {
                  return Promise.reject(
                    new Error("Stock must be non-negative")
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input
            placeholder="Enter stock quantity"
            style={{ width: "100%", textAlign: "end" }}
            disabled={isViewMode}
          />
        </Form.Item>

        {/* Active */}
        <Form.Item label="Active Status" name="active" valuePropName="checked">
          <Switch disabled={isViewMode} />
        </Form.Item>
      </div>
    </div>
  );
};