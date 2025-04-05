"use client";

import React, { useMemo } from "react"; // Import useMemo
import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Switch,
  Row,
  Col,
} from "antd";
import { VoucherType, Category, Product } from "@/types"; // Import Category and Product types
import { useGetCategoriesQuery } from "@/state/services/categoryService"; // For category select
import { useGetProductsQuery } from "@/state/services/productService"; // For product select

const { Option } = Select;
const { RangePicker } = DatePicker;

interface VoucherFormFieldsProps {
  // Add props if needed, e.g., isViewMode (though modal usually handles create/edit)
}

export const VoucherFormFields: React.FC<VoucherFormFieldsProps> = () => {
  const form = Form.useFormInstance();
  const voucherType = Form.useWatch("type", form);

  // Fetch data for Select components
  const { data: categoriesResponse } = useGetCategoriesQuery({});
  const { data: productsResponse } = useGetProductsQuery({
    page: 1,
    limit: 9999,
    filters: {},
  });
  // Extract arrays using useMemo
  const categories = useMemo(
    () => categoriesResponse?.data ?? [],
    [categoriesResponse]
  );
  const products = useMemo(
    () => productsResponse?.data ?? [],
    [productsResponse]
  );

  return (
    <Row gutter={16}>
      {/* Column 1 */}
      <Col span={12}>
        <Form.Item
          label="Voucher Code"
          name="code"
          rules={[
            { required: true, message: "Please enter a unique voucher code" },
          ]}
        >
          <Input placeholder="e.g., SUMMER25" />
        </Form.Item>

        <Form.Item
          label="Voucher Type"
          name="type"
          rules={[{ required: true, message: "Please select a voucher type" }]}
        >
          <Select placeholder="Select type">
            <Option value={VoucherType.PERCENT}>Percentage (%)</Option>
            <Option value={VoucherType.FIXED}>Fixed Amount (VND)</Option>
          </Select>
        </Form.Item>

        {/* Conditional Fields based on Type */}
        {voucherType === VoucherType.PERCENT && (
          <>
            <Form.Item
              label="Discount Percent (%)"
              name="discountPercent"
              rules={[
                { required: true, message: "Please enter discount percentage" },
                { // Custom validator
                  validator: (_, value) => {
                    if (value === undefined || value === null || value === "") return Promise.reject(new Error("Please enter discount percentage"));
                    const numValue = Number(value);
                    if (isNaN(numValue)) return Promise.reject(new Error("Must be a valid number"));
                    if (numValue < 0 || numValue > 100) return Promise.reject(new Error("Percent must be between 0 and 100"));
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input
                placeholder="e.g., 10"
                style={{ textAlign: "end" }}
                addonAfter="%"
              />
            </Form.Item>
            <Form.Item
              label="Max Discount (VND, Optional)"
              name="maxDiscount"
              rules={[
                 { // Custom validator for optional non-negative number
                  validator: (_, value) => {
                    if (value === undefined || value === null || value === "") return Promise.resolve();
                    const numValue = Number(value);
                    if (isNaN(numValue)) return Promise.reject(new Error("Must be a valid number"));
                    if (numValue < 0) return Promise.reject(new Error("Max discount must be non-negative"));
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input
                style={{ width: "100%", textAlign: "end" }}
                placeholder="Maximum discount amount (VND)"
              />
            </Form.Item>
          </>
        )}

        {voucherType === VoucherType.FIXED && (
          <Form.Item
            label="Discount Amount (VND)"
            name="discountAmount"
            rules={[
              { required: true, message: "Please enter discount amount" },
              { // Custom validator for required non-negative number
                  validator: (_, value) => {
                    if (value === undefined || value === null || value === "") return Promise.reject(new Error("Please enter discount amount"));
                    const numValue = Number(value);
                    if (isNaN(numValue)) return Promise.reject(new Error("Must be a valid number"));
                    if (numValue < 0) return Promise.reject(new Error("Amount must be non-negative"));
                    return Promise.resolve();
                  }
                }
            ]}
          >
            <Input
              style={{ width: "100%", textAlign: "end" }}
              placeholder="Fixed discount amount (VND)"
            />
          </Form.Item>
        )}

        <Form.Item
          label="Minimum Order Value (VND, Optional)"
          name="minimumOrderValue"
          rules={[
             { // Custom validator for optional non-negative number
                validator: (_, value) => {
                  if (value === undefined || value === null || value === "") return Promise.resolve();
                  const numValue = Number(value);
                  if (isNaN(numValue)) return Promise.reject(new Error("Must be a valid number"));
                  if (numValue < 0) return Promise.reject(new Error("Minimum value must be non-negative"));
                  return Promise.resolve();
                }
              }
          ]}
        >
          <Input
            // Remove type="number" as validation is handled by rules
            style={{ width: "100%", textAlign: "end" }}
            placeholder="e.g., 100000 (VND)"
          />
        </Form.Item>
      </Col>

      {/* Column 2 */}
      <Col span={12}>
        <Form.Item
          label="Validity Period"
          name="dateRange" // Use a single field for RangePicker
          rules={[
            { required: true, message: "Please select the start and end date" },
          ]}
        >
          <RangePicker showTime style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Usage Limit (Optional)"
          name="usageLimit"
          rules={[
             { // Custom validator for optional non-negative integer
                validator: (_, value) => {
                  if (value === undefined || value === null || value === "") return Promise.resolve();
                  const numValue = Number(value);
                  if (isNaN(numValue) || !Number.isInteger(numValue)) return Promise.reject(new Error("Usage limit must be a valid integer"));
                  if (numValue < 0) return Promise.reject(new Error("Usage limit must be non-negative"));
                  return Promise.resolve();
                }
              }
          ]}
        >
          <Input
            style={{ width: "100%", textAlign: "end" }}
            placeholder="Total times the voucher can be used"
          />
        </Form.Item>

        <Form.Item
          label="Applicable Categories (Optional)"
          name="applicableCategoryIds"
        >
          <Select
            mode="multiple"
            allowClear
            placeholder="Select categories where voucher applies"
            options={categories.map((cat: Category) => ({
              label: cat.name,
              value: cat.id,
            }))} // Add type for cat
            filterOption={
              (input, option) =>
                (option?.label ?? "")
                  .toString()
                  .toLowerCase()
                  .includes(input.toLowerCase()) // Ensure label is string
            }
          />
        </Form.Item>

        <Form.Item
          label="Excluded Products (Optional)"
          name="excludedProductIds"
        >
          <Select
            mode="multiple"
            allowClear
            placeholder="Select products where voucher DOES NOT apply"
            options={products.map((prod: Product) => ({
              label: prod.name,
              value: prod.id,
            }))} // Add type for prod
            filterOption={
              (input, option) =>
                (option?.label ?? "")
                  .toString()
                  .toLowerCase()
                  .includes(input.toLowerCase()) // Ensure label is string
            }
            loading={!productsResponse} // Show loading while products fetch
          />
        </Form.Item>

        <Form.Item
          label="Active Status"
          name="isActive"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Col>
    </Row>
  );
};
