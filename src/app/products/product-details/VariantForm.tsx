'use client';

import React from 'react';
import { Form, Input, InputNumber, Row, Col } from 'antd';

// Note: This component assumes it's rendered within an Ant Design <Form> component
// provided by its parent (e.g., CreateEditVariantModal).
const VariantForm: React.FC = () => {
    return (
        <>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        label="Variant Name"
                        name="name"
                        rules={[{ required: true, message: 'Please enter the variant name' }]}
                    >
                        <Input placeholder="e.g., Red - Large" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        label="SKU (Optional)"
                        name="sku"
                        rules={[
                            // Add specific SKU validation if needed
                        ]}
                    >
                        <Input placeholder="Variant specific SKU" />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item
                        label="Price"
                        name="price"
                        rules={[
                            { required: true, message: 'Please enter the price' },
                            { type: 'number', min: 0, message: 'Price must be non-negative' }
                        ]}
                    >
                        {/* Removed addonAfter as InputNumber doesn't directly support it like Input */}
                        <InputNumber style={{ width: '100%' }} placeholder="Variant price" min={0} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        label="Discount Price (Optional)"
                        name="discountPrice"
                        rules={[
                            { type: 'number', min: 0, message: 'Discount price must be non-negative' }
                            // Add validation: discountPrice < price if needed
                        ]}
                    >
                         {/* Removed addonAfter */}
                        <InputNumber style={{ width: '100%' }} placeholder="Discounted price" min={0} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        label="Stock"
                        name="stock"
                        rules={[
                            { required: true, message: 'Please enter the stock quantity' },
                            { type: 'integer', min: 0, message: 'Stock must be a non-negative integer' }
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} placeholder="Quantity in stock" min={0} />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item
                        label="Color (Optional)"
                        name="color"
                    >
                        <Input placeholder="e.g., Red, Blue" />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        label="Weight (Optional)"
                        name="weight"
                    >
                        <Input placeholder="e.g., 100g, 2kg" />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        label="Material (Optional)"
                        name="material"
                    >
                        <Input placeholder="e.g., Cotton, Steel" />
                    </Form.Item>
                </Col>
            </Row>
        </>
    );
};

export default VariantForm;
