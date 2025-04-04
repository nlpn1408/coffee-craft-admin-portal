"use client";

import React, { useMemo } from "react";
import { Product, Tag as TagType, NewProduct } from "@/types";
import { Select, Spin, Alert, Space, Tag as AntTag } from "antd"; // Removed notification
import { useGetTagsQuery } from "@/state/services/tagService";
// Removed useUpdateProductMutation

// Define props
interface ProductTagAssociationProps {
  value?: string[]; // Current selected tag IDs from form state
  onChange?: (selectedTagIds: string[]) => void; // Callback to update form state
  disabled?: boolean; // General disabled state from form
  isViewMode?: boolean; // Specific view mode state
}

// Renamed component
const ProductTagAssociation: React.FC<ProductTagAssociationProps> = ({
  value,
  onChange,
  disabled = false,
  isViewMode = false,
}) => {
  const {
    data: allTagsResponse,
    isLoading: isLoadingTags,
    isError: isTagsError,
  } = useGetTagsQuery({
    limit: 9999,
    page: 1, // Fetch all tags for selection
  });

    const tagOptions = useMemo(() => {
        // Ensure options have unique keys if names can collide, but value should be name
        return (
            allTagsResponse?.data?.map((tag: TagType) => ({
                label: tag.name, // Use tag name for display
                value: tag.name, // Use tag NAME as the value for the Select component
            })) ?? []
        );
    }, [allTagsResponse]);
  if (isTagsError) {
    return (
      <Alert
        message="Error loading tags"
        type="error"
        showIcon
        className="my-2"
      />
    );
  }

  // This component is now a controlled component, managed by react-hook-form via ProductFormFields
  return (
    <Spin spinning={isLoadingTags}>
      <Select
        mode="tags" 
        allowClear
        style={{ width: "100%" }}
        placeholder="Select or type to add new tags" // Updated placeholder
        value={value} // Use value from props (form state)
        onChange={onChange} // Use onChange from props to update form state
        options={tagOptions}
        loading={isLoadingTags}
        filterOption={(input, option) =>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
        }
        disabled={disabled || isViewMode || isLoadingTags}
      />
    </Spin>
  );
};

// Update export default
export default ProductTagAssociation;
