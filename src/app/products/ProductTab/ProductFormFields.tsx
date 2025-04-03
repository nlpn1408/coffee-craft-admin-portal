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
} from "antd";
// Removed react-hook-form imports
import { Tag } from "@/types";
import { useGetBrandsQuery, useGetCategoriesQuery } from "@/state/api";
import {
  useCreateTagMutation,
  useGetTagsQuery,
} from "@/state/services/tagService";
import { z } from "zod";
import { PlusOutlined } from "@ant-design/icons";

const { Option } = Select;

// Infer type from the schema definition
// Removed Zod schema and inferred type

interface ProductFormFieldsProps {
  isViewMode?: boolean; // Add prop to disable fields
}

export const ProductFormFields = ({ isViewMode = false }: ProductFormFieldsProps) => {
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: brands = [] } = useGetBrandsQuery();
  const { data: tagsResponse, isLoading: isLoadingTags } = useGetTagsQuery(); // Fetch tags
  const [createTag] = useCreateTagMutation();

  const tags = tagsResponse?.data ?? [];
  const inputRef = useRef<InputRef>(null);
  const [newTag, setNewTag] = useState("");

  const addItem = async (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    e.preventDefault();
    if (!newTag) return;
    const tagExists = tags.some((tag: Tag) => tag.name === newTag);

    try {
      await createTag({ name: newTag }).unwrap();
    } catch (error) {
      console.error("Failed to create tag:", error);
    }

    setNewTag("");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  return (
    <div className="space-y-4">
      {/* SKU */}
      <Form.Item
        label="SKU"
        name="sku" // Use name directly
        rules={[{ required: true, message: "SKU is required" }]}
      >
        <Input placeholder="Enter product SKU" disabled={isViewMode} />
      </Form.Item>

      {/* Name */}
      <Form.Item
        label="Name"
        name="name" // Use name directly
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
          name="price" // Use name directly
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
            // Remove parser, rely on Form's onFinish for number conversion
            disabled={isViewMode}
          />
        </Form.Item>

        {/* Discount Price */}
        <Form.Item
          label="Discount Price (VND)"
          name="discountPrice" // Use name directly
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
             // Remove parser, rely on Form's onFinish for number conversion
            disabled={isViewMode}
          />
        </Form.Item>
      </div>

      {/* Tags */}
      <Form.Item label="Tags" name="tags">
        <Select
          mode="multiple"
          allowClear
          style={{ width: "100%" }}
          placeholder="Select tags (optional)"
          loading={isLoadingTags}
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          dropdownRender={(menu) => (
            <>
              {menu}
              <Divider style={{ margin: "8px 0" }} />
              <Space style={{ padding: "0 8px 4px" }}>
                <Input
                  placeholder="Enter new tag name"
                  ref={inputRef}
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  disabled={isViewMode} // Disable input in view mode
                />
                <Button
                  type="text"
                  icon={<PlusOutlined />}
                  onClick={addItem}
                  disabled={!newTag || isViewMode} // Disable button in view mode
                >
                  Add tag
                </Button>
              </Space>
            </>
          )}
          options={tags.map((tag: Tag) => ({
            label: tag.name,
            value: tag.id, // Use tag ID as value
          }))}
          disabled={isViewMode}
        />
      </Form.Item>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Category */}
        <Form.Item
          label="Category"
          name="categoryId" // Use name directly
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
          name="stock" // Use name directly
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
          name="active" // Use name directly
          valuePropName="checked" // Important for Switch
        >
          <Switch disabled={isViewMode} />
        </Form.Item>
      </div>
    </div>
  );
};
