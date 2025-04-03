"use client";

import React, { useEffect } from "react";
import { Form, Input, Button, Space, Spin } from "antd";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { NewTag, Tag } from "@/types";

// Schema for the tag form
const tagFormSchema = z.object({
  name: z.string().min(1, "Tag name is required"),
});

type TagFormData = z.infer<typeof tagFormSchema>;

interface TagFormProps {
  initialData?: Tag; // Optional initial data for editing
  onSubmit: (data: NewTag) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const TagForm: React.FC<TagFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TagFormData>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: {
      name: initialData?.name || "",
    },
  });

  // Reset form if initialData changes (e.g., opening modal for a different tag)
  useEffect(() => {
    if (initialData) {
      reset({ name: initialData.name });
    } else {
      reset({ name: "" }); // Reset for creating a new tag
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data: TagFormData) => {
    onSubmit(data); // Pass the validated data up
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(handleFormSubmit)}>
      <Spin spinning={isLoading}>
        <Form.Item
          label="Tag Name"
          validateStatus={errors.name ? "error" : ""}
          help={errors.name?.message}
          required
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Enter tag name" autoFocus />
            )}
          />
        </Form.Item>

        <Form.Item className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-end">
            <Space>
              <Button onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={isLoading}>
                {initialData ? "Update Tag" : "Create Tag"}
              </Button>
            </Space>
          </div>
        </Form.Item>
      </Spin>
    </Form>
  );
};
