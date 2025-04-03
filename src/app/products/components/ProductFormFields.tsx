"use client";

import React, { useRef, useState } from "react";
import {
  Input,
  Select,
  Switch,
  InputNumber,
  Form,
  Spin,
  Divider,
  Space,
  InputRef,
  Button,
  message, // Add message import
} from "antd";
import { Product, Tag } from "@/types"; // Added Product type
import { useGetBrandsQuery, useGetCategoriesQuery } from "@/state/api";

import ProductTagAssociation from "../product-details/ProductTagAssociation";

const { Option } = Select;

// Removed Zod schema

interface ProductFormFieldsProps {
  isViewMode?: boolean;
}

export const ProductFormFields = ({ isViewMode = false }: ProductFormFieldsProps) => {
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: brands = [] } = useGetBrandsQuery();
  // Removed tag fetching/creation logic, handled by ProductTagAssociation

  // Get the form instance to access the current product data
  const form = Form.useFormInstance();
  // Watch the product data (or pass selectedProduct if available)
  // This is needed to pass the current product to ProductTagAssociation
  // Note: This might cause re-renders. A more optimized way might involve context or props.
  const currentProduct = Form.useWatch([], form) as Product | null; // Watch all fields

  return (
    <div className="space-y-4">
      {/* SKU */}
      <Form.Item
        label="SKU"
        name="sku"
        rules={[{ required: true, message: "SKU is required" }]}
      >
        <Input placeholder="Enter product SKU" disabled={isViewMode} />
      </Form.Item>

      {/* Name */}
      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: "Name is required" }]}
      >
        <Input placeholder="Enter product name" disabled={isViewMode} />
      </Form.Item>

      {/* Short Description */}
      <Form.Item label="Short Description" name="shortDescription">
        <Input.TextArea
          rows={2}
          placeholder="Enter short description (optional)"
          disabled={isViewMode}
        />
      </Form.Item>

      {/* Long Description */}
      <Form.Item label="Long Description" name="longDescription">
        <Input.TextArea
          rows={4}
          placeholder="Enter detailed description (optional)"
          disabled={isViewMode}
        />
      </Form.Item>

      {/* Price & Discount Price in a row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Price */}
        <Form.Item
          label="Price (VND)"
          name="price"
          rules={[
            { required: true, message: "Price is required" },
            { type: 'number', min: 0, message: 'Price must be non-negative' }
          ]}
        >
          <InputNumber
            min={0}
            placeholder="Enter price"
            style={{ width: "100%" }}
            formatter={(value) => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}
            // Remove parser again
            disabled={isViewMode}
          />
        </Form.Item>

        {/* Discount Price */}
        <Form.Item
          label="Discount Price (VND)"
          name="discountPrice"
          rules={[
             { type: 'number', min: 0, message: 'Discount price must be non-negative' }
             // Add custom validator if discountPrice must be less than price
          ]}
        >
          <InputNumber
            min={0}
            placeholder="Optional discount price"
            style={{ width: "100%" }}
            formatter={(value) => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}
            // Remove parser again
            disabled={isViewMode}
          />
        </Form.Item>
      </div>

      {/* Tags - Replace Select with ProductTagAssociation */}
      {/* We need to wrap ProductTagAssociation in Form.Item to connect it to Ant Form state */}
      <Form.Item label="Tags" name="tags">
         {/* Pass the current product data and view mode status */}
         <ProductTagAssociation selectedProduct={currentProduct} isViewMode={isViewMode} />
      </Form.Item>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Category */}
        <Form.Item
          label="Category"
          name="categoryId"
          rules={[{ required: true, message: "Category is required" }]}
        >
          <Select placeholder="Select a category" allowClear disabled={isViewMode}>
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

        {/* Stock */}
        <Form.Item
          label="Stock"
          name="stock"
          rules={[
            { required: true, message: "Stock is required" },
            { type: 'integer', min: 0, message: 'Stock must be a non-negative integer' }
          ]}
        >
          <InputNumber
            min={0}
            placeholder="Enter stock quantity"
            style={{ width: "100%" }}
            disabled={isViewMode}
          />
        </Form.Item>

        {/* Active */}
        <Form.Item
          label="Active Status"
          name="active"
          valuePropName="checked"
        >
          <Switch disabled={isViewMode} />
        </Form.Item>
      </div>
    </div>
  );
};
