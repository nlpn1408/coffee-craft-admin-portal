"use client";

import React from 'react';
import { Form, Input, Switch, DatePicker } from 'antd';
import ImageUpload from '@/components/ImageUpload';
import RichTextEditor from '@/components/RichTextEditor'; // Import the new component

interface BlogFormFieldsProps {
  isViewMode?: boolean;
}

export const BlogFormFields: React.FC<BlogFormFieldsProps> = ({ isViewMode = false }) => {
  return (
    <div className="space-y-4">
      <Form.Item
        label="Title"
        name="title"
        rules={[
          { required: true, message: "Please enter the blog post title" },
          { max: 255, message: "Title cannot exceed 255 characters" }
        ]}
      >
        <Input placeholder="Enter blog post title" disabled={isViewMode} />
      </Form.Item>

      <Form.Item
        label="Content"
        name="content"
        rules={[{ required: true, message: "Please enter the blog post content" }]}
      >
        {/* Replace Input.TextArea with RichTextEditor */}
        {/* Note: Ant Form handles value/onChange automatically via name prop */}
        <RichTextEditor
            placeholder="Enter blog post content..."
            disabled={isViewMode}
        />
      </Form.Item>

      <Form.Item
        label="Thumbnail Image URL (Optional)"
        name="thumbnail"
        rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
      >
         {/* Option 1: Simple Input */}
         <Input placeholder="https://example.com/image.png" disabled={isViewMode} />

         {/* Option 00: Use a dedicated ImageUpload component if available */}
         {/* <ImageUpload
             name="thumbnail" // Ensure name matches Form.Item name
             // Pass other necessary props like action, listType etc.
             disabled={isViewMode}
             // Need to handle value extraction if ImageUpload doesn't integrate directly with Ant Form
         /> */}
      </Form.Item>

      <Form.Item
        label="Publication Date (Optional)"
        name="publicationDate"
        // valuePropName needs careful handling with DatePicker and Ant Form
        // Often requires a custom `getValueProps` or normalization in the form logic
      >
         {/* Note: Ant Form handles Date objects. Need conversion before sending ISO string to API */}
        <DatePicker showTime style={{ width: '100%' }} disabled={isViewMode} />
      </Form.Item>

      <Form.Item
        label="Active Status"
        name="active"
        valuePropName="checked"
      >
        <Switch disabled={isViewMode} />
      </Form.Item>
    </div>
  );
};
