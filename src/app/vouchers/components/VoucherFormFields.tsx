'use client';

import React, { useMemo } from 'react'; // Import useMemo
import { Form, Input, InputNumber, Select, DatePicker, Switch, Row, Col } from 'antd';
import { VoucherType, Category, Product } from '@/types'; // Import Category and Product types
import { useGetCategoriesQuery } from '@/state/services/categoryService'; // For category select
import { useGetProductsQuery } from '@/state/services/productService'; // For product select

const { Option } = Select;
const { RangePicker } = DatePicker;

interface VoucherFormFieldsProps {
  // Add props if needed, e.g., isViewMode (though modal usually handles create/edit)
}

export const VoucherFormFields: React.FC<VoucherFormFieldsProps> = () => {
  const form = Form.useFormInstance(); // Correct usage: returns the instance directly
  const voucherType = Form.useWatch('type', form);

  // Fetch data for Select components
  const { data: categoriesResponse } = useGetCategoriesQuery({});
  const { data: productsResponse } = useGetProductsQuery({ page: 1, limit: 9999, filters: {} });
  // Extract arrays using useMemo
  const categories = useMemo(() => categoriesResponse?.data ?? [], [categoriesResponse]);
  const products = useMemo(() => productsResponse?.data ?? [], [productsResponse]);

  return (
    <Row gutter={16}>
      {/* Column 1 */}
      <Col span={12}>
        <Form.Item
          label="Voucher Code"
          name="code"
          rules={[{ required: true, message: 'Please enter a unique voucher code' }]}
        >
          <Input placeholder="e.g., SUMMER25" />
        </Form.Item>

        <Form.Item
          label="Voucher Type"
          name="type"
          rules={[{ required: true, message: 'Please select a voucher type' }]}
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
              rules={[{ required: true, message: 'Please enter discount percentage' }, { type: 'number', min: 0, max: 100, message: 'Percent must be between 0 and 100' }]}
            >
              <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
            </Form.Item>
            <Form.Item
              label="Max Discount (VND, Optional)"
              name="maxDiscount"
               rules={[{ type: 'number', min: 0, message: 'Max discount must be non-negative' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} placeholder="Maximum discount amount" />
            </Form.Item>
          </>
        )}

        {voucherType === VoucherType.FIXED && (
          <Form.Item
            label="Discount Amount (VND)"
            name="discountAmount"
            rules={[{ required: true, message: 'Please enter discount amount' }, { type: 'number', min: 0, message: 'Amount must be non-negative' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="Fixed discount amount" />
          </Form.Item>
        )}

         <Form.Item
            label="Minimum Order Value (VND, Optional)"
            name="minimumOrderValue"
            rules={[{ type: 'number', min: 0, message: 'Minimum value must be non-negative' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="e.g., 100000" />
          </Form.Item>

      </Col>

      {/* Column 2 */}
      <Col span={12}>
        <Form.Item
          label="Validity Period"
          name="dateRange" // Use a single field for RangePicker
          rules={[{ required: true, message: 'Please select the start and end date' }]}
        >
          <RangePicker showTime style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Usage Limit (Optional)"
          name="usageLimit"
           rules={[{ type: 'integer', min: 0, message: 'Usage limit must be a non-negative integer' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} placeholder="Total times the voucher can be used" />
        </Form.Item>

         <Form.Item
            label="Applicable Categories (Optional)"
            name="applicableCategoryIds"
          >
            <Select
              mode="multiple"
              allowClear
              placeholder="Select categories where voucher applies"
              options={categories.map((cat: Category) => ({ label: cat.name, value: cat.id }))} // Add type for cat
              filterOption={(input, option) =>
                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase()) // Ensure label is string
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
              options={products.map((prod: Product) => ({ label: prod.name, value: prod.id }))} // Add type for prod
              filterOption={(input, option) =>
                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase()) // Ensure label is string
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
