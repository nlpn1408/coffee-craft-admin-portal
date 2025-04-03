"use client";

import React, { useState, useMemo } from "react";
import { Blog } from "@/types";
import {
  useGetBlogsQuery,
  useDeleteBlogMutation,
} from "@/state/services/blogService";
import { Button, Space, Table, message, notification } from "antd";
import type { TableProps } from "antd";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import { PlusOutlined } from "@ant-design/icons";
import { handleApiError } from "@/lib/api-utils";
import { useBlogTableColumns } from "./useBlogTableColumns"; // Import the columns hook
import LoadingScreen from "@/components/LoadingScreen";

// Define props interface
interface BlogListProps {
  onCreate: () => void;
  onEdit: (blog: Blog) => void;
  onViewDetails: (blog: Blog) => void;
}

const BlogList: React.FC<BlogListProps> = ({ onCreate, onEdit, onViewDetails }) => {
  // State for pagination, sorting, filtering
  const [queryParams, setQueryParams] = useState<{
    page: number;
    limit: number;
    filters: Record<string, FilterValue | null>;
    sortField?: string;
    sortOrder?: "ascend" | "descend";
  }>({
    page: 1,
    limit: 10,
    filters: {},
  });

  // Fetch Blogs using RTK Query
  const {
    data: blogsResponse,
    isLoading,
    isFetching,
    isError,
    refetch: refetchBlogs,
  } = useGetBlogsQuery({
    page: queryParams.page,
    limit: queryParams.limit,
    // Map Ant Design filter/sort state to API query params
    sortBy: queryParams.sortField,
    sortOrder:
      queryParams.sortOrder === "ascend"
        ? "asc"
        : queryParams.sortOrder === "descend"
        ? "desc"
        : undefined,
    active: queryParams.filters?.active?.[0] as boolean | undefined,
    // Add other filters like authorId if needed from queryParams.filters
  });

  const blogs = useMemo(() => blogsResponse?.data ?? [], [blogsResponse]);
  const totalBlogs = useMemo(() => blogsResponse?.total ?? 0, [blogsResponse]);

  // Mutations
  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();

  // --- Handlers ---
  const handleEdit = (blog: Blog) => {
    onEdit(blog); // Call prop to open drawer in edit mode
  };

  const handleDeleteSingle = async (id: string): Promise<void> => {
    try {
      await deleteBlog(id).unwrap();
      notification.success({ message: "Success", description: "Blog post deleted successfully" });
      // Refetch or adjust pagination after delete
      if (blogs.length === 1 && queryParams.page > 1) {
        setQueryParams(prev => ({ ...prev, page: prev.page - 1 }));
      } else {
        refetchBlogs();
      }
    } catch (error) {
      handleApiError(error);
      throw error; // Re-throw for Popconfirm loading state
    }
  };

  // --- Table Change Handler ---
  // Add explicit types for parameters
  const handleTableChange: TableProps<Blog>["onChange"] = (
    paginationConfig: TableProps<Blog>['pagination'],
    filters: Record<string, FilterValue | null>,
    sorterResult: SorterResult<Blog> | SorterResult<Blog>[]
  ) => {
    // Handle single sorter case (Ant Design might pass an array for multi-sort)
    const currentSorter = Array.isArray(sorterResult) ? sorterResult[0] : sorterResult;
    setQueryParams(prev => ({
      ...prev,
      // Check if paginationConfig is an object before accessing properties
      page: (paginationConfig && typeof paginationConfig === 'object' && paginationConfig.current) || 1,
      limit: (paginationConfig && typeof paginationConfig === 'object' && paginationConfig.pageSize) || 10,
      filters: filters,
      sortField: currentSorter?.field as string | undefined, // Add optional chaining for sorter
      sortOrder: currentSorter.order === null ? undefined : currentSorter.order,
    }));
  };

  // --- Get Columns from Hook ---
  const columns = useBlogTableColumns({
    onEdit: handleEdit,
    onDelete: handleDeleteSingle,
    onViewDetails: onViewDetails, // Pass view details handler
    isActionLoading: isFetching || isDeleting, // Disable actions while fetching or deleting
    isDeleting: isDeleting,
  });

  if (isLoading && !isFetching) {
    return <LoadingScreen />;
  }

  if (isError && !isLoading) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch blog posts. Please try again later.
      </div>
    );
  }

  return (
    <>
      <div className="p-4 space-y-4">
        {/* Toolbar */}
        <div className="flex justify-end items-center flex-wrap gap-2">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreate} // Call prop to open drawer in create mode
            disabled={isFetching} // Disable while fetching
          >
            Create Blog Post
          </Button>
        </div>

        {/* Table */}
        <Table<Blog>
          columns={columns}
          dataSource={blogs}
          rowKey="id"
          pagination={{
            current: queryParams.page,
            pageSize: queryParams.limit,
            total: totalBlogs,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            // Add explicit types for showTotal parameters
            showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          loading={isFetching}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
          size="small"
        />
      </div>
    </>
  );
};

export default BlogList;
