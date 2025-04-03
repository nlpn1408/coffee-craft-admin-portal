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
import {
  Controller,
  Control,
  FieldErrors,
  SetValueConfig,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { Tag } from "@/types";
import { useGetBrandsQuery, useGetCategoriesQuery } from "@/state/api";
import {
  useCreateTagMutation,
  useGetTagsQuery,
} from "@/state/services/tagService";
import { z } from "zod";
import { PlusOutlined } from "@ant-design/icons";

const { Option } = Select;

// Define the schema matching ProductForm.tsx
const formSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Name is required"),
  shortDescription: z.string().optional().nullable(),
  longDescription: z.string().optional().nullable(),
  price: z.coerce
    .number({
      required_error: "Price is required",
      invalid_type_error: "Price must be a number",
    })
    .positive("Price must be positive"),
  discountPrice: z.coerce
    .number({
      invalid_type_error: "Discount price must be a number",
    })
    .nonnegative("Discount price cannot be negative")
    .optional()
    .nullable(),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().optional().nullable(),
  stock: z.coerce
    .number({
      required_error: "Stock is required",
      invalid_type_error: "Stock must be a number",
    })
    .int()
    .nonnegative("Stock cannot be negative"),
  active: z.boolean().default(true),
  tags: z.array(z.string()).optional(),
});

// Infer type from the schema definition
type ProductFormData = z.infer<typeof formSchema>;

interface ProductFormFieldsProps {
  control: Control<ProductFormData>; // Use the inferred type
  errors: FieldErrors<ProductFormData>;
}

export const ProductFormFields = ({
  control,
  errors,
}: ProductFormFieldsProps) => {
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
        validateStatus={errors.sku ? "error" : ""}
        help={errors.sku?.message}
        required
      >
        <Controller
          name="sku"
          control={control}
          render={({ field }) => (
            <Input {...field} placeholder="Enter product SKU" />
          )}
        />
      </Form.Item>

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

      {/* Short Description */}
      <Form.Item
        label="Short Description"
        validateStatus={errors.shortDescription ? "error" : ""}
        help={errors.shortDescription?.message}
      >
        <Controller
          name="shortDescription"
          control={control}
          render={({ field }) => (
            <Input.TextArea
              {...field}
              value={field.value ?? ""}
              rows={2}
              placeholder="Enter short description (optional)"
            />
          )}
        />
      </Form.Item>

      {/* Long Description */}
      <Form.Item
        label="Long Description"
        validateStatus={errors.longDescription ? "error" : ""}
        help={errors.longDescription?.message}
      >
        <Controller
          name="longDescription"
          control={control}
          render={({ field }) => (
            <Input.TextArea
              {...field}
              value={field.value ?? ""}
              rows={4}
              placeholder="Enter detailed description (optional)"
            />
          )}
        />
      </Form.Item>

      {/* Price & Discount Price in a row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                style={{ width: "100%" }}
                formatter={(value) =>
                  value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
                }
                parser={(value) => {
                  const parsed = value ? value.replace(/\$\s?|(,*)/g, "") : "";
                  const num = Number(parsed);
                  // Ensure a number is always returned for the InputNumber parser
                  return isNaN(num) ? 0 : num;
                }}
              />
            )}
          />
        </Form.Item>

        {/* Discount Price */}
        <Form.Item
          label="Discount Price (VND)"
          validateStatus={errors.discountPrice ? "error" : ""}
          help={errors.discountPrice?.message}
        >
          <Controller
            name="discountPrice"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                value={field.value ?? undefined} // Use undefined for empty display in InputNumber
                onChange={(value) =>
                  field.onChange(value === null ? null : value)
                } // Ensure null is passed back for empty/cleared
                min={0}
                placeholder="Optional discount price"
                style={{ width: "100%" }}
                formatter={(value) =>
                  value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
                }
                parser={(value) => {
                  const parsed = value ? value.replace(/\$\s?|(,*)/g, "") : "";
                  const num = Number(parsed);
                  // Return 0 if empty or invalid to satisfy InputNumber's parser type requirement
                  // The onChange handler and zod schema will manage the actual null/undefined state
                  return parsed === "" || isNaN(num) ? 0 : num;
                }}
              />
            )}
          />
        </Form.Item>
      </div>

      {/* Tags */}
      <Form.Item
        label="Tags"
        validateStatus={errors.tags ? "error" : ""}
        help={errors.tags?.message}
      >
        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              mode="multiple"
              allowClear
              style={{ width: "100%" }}
              placeholder="Select tags (optional)"
              loading={isLoadingTags}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: "8px 0" }} />
                  <Space style={{ padding: "0 8px 4px" }}>
                    <Input
                      placeholder="Please enter tag"
                      ref={inputRef}
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={addItem}
                    >
                      Add tag
                    </Button>
                  </Space>
                </>
              )}
              options={tags.map((tag: Tag) => ({
                label: tag.name,
                value: tag.name,
              }))}
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
        >
          <Controller
            name="brandId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                value={field.value ?? undefined}
                placeholder="Select a brand (optional)"
                allowClear
              >
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
                style={{ width: "100%" }}
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
            render={({ field }) => <Switch {...field} checked={field.value} />}
          />
        </Form.Item>
      </div>
    </div>
  );
};
