import React from 'react';
import { ActionColumn } from "@/components/TableActionRow/ActionColumn";
import { TableToolbar } from "@/components/TableToolbar/TableToolbar";
import { useGetProductImagesQuery } from "@/state/services/productImageService";
import { ProductImage } from "@/types";
import { Switch, Table, TableColumnsType, Image as AntImage } from "antd"; // Added AntImage

type Props = {
  selectedProductId?: string;
  onCreate?: () => void;
  onEdit: (imgs: ProductImage) => void;
  onUpdate: (id: string, data: Partial<ProductImage>) => void; // Use Partial for update data
  onDelete: (id: string) => void;
  isViewMode?: boolean;
  isDeleting?: boolean; // Add prop for delete loading state
};

export const ProductImageTable = ({
  selectedProductId = "",
  onCreate,
  onEdit,
  onUpdate,
  onDelete,
  isViewMode = false,
  isDeleting = false, // Destructure isDeleting
}: Props) => {
  const {
    data: imgsResponse, // Rename to avoid conflict with map variable
    isLoading,
    isError,
  } = useGetProductImagesQuery({ productId: selectedProductId }, {
      skip: !selectedProductId, // Skip if no ID
  });

  // Remove the unnecessary fetch for all products
  // const { data: products } = useGetProductsQuery({});

  const imgs = imgsResponse || []; // Default to empty array

  // Handle loading and error states
  if (isLoading) {
      // Optional: Render a loading indicator specifically for the table
      // return <Spin spinning={isLoading} />;
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch product images.
      </div>
    );
  }

  const columns: TableColumnsType<ProductImage> = [
    {
      title: "Image",
      dataIndex: "url",
      key: "images",
      render: (url: string, record: ProductImage) => { // Added record for key
        return url ? (
          // Use Ant Design Image for preview capability
          <AntImage
            width={60}
            height={60}
            src={url}
            alt={`Product Image ${record.order ?? ''}`}
            style={{ objectFit: "cover", borderRadius: "4px" }}
          />
        ) : (
          <div className="w-[60px] h-[60px] bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">
            No image
          </div>
        );
      },
      width: 100, // Adjusted width
    },
    // Removed Product Name column as it's redundant in this context
    {
      title: "Is Thumbnail",
      dataIndex: "isThumbnail",
      key: "isThumbnail",
      render: (isThumbnail: boolean, record: ProductImage) => (
        <Switch
          checked={isThumbnail}
          onChange={(checked) =>
            // Only allow changing if not in view mode
            !isViewMode && onUpdate(record.id, { isThumbnail: checked })
          }
          disabled={isViewMode} // Disable switch in view mode
        />
      ),
      width: 120, // Adjusted width
    },
    {
      title: "Order",
      dataIndex: "order",
      key: "order",
      width: 80, // Adjusted width
      sorter: (a, b) => (a.order ?? Infinity) - (b.order ?? Infinity), // Sort by order
      defaultSortOrder: 'ascend', // Default sort by order
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (createdAt: string) => new Date(createdAt).toLocaleString(), // Use string type
      width: 180,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record: ProductImage) => ( // Added type for record
        <ActionColumn
          onEdit={() => onEdit(record)}
          onDelete={() => onDelete(record.id)}
          deleteConfirmTitle="Delete Image?"
          deleteConfirmDescription="Are you sure you want to delete this image?"
          isEditDisabled={isViewMode}
          isDeleteDisabled={isViewMode || isDeleting} // Disable if viewing or delete is loading
          isDeleteLoading={isDeleting} // Pass loading state
        />
      ),
      width: 100,
      fixed: "right",
      align: "center",
    },
  ];

  return (
    <div className="mt-5">
      {/* Conditionally render toolbar */}
      {!isViewMode && (
          <div className="mb-4">
              <TableToolbar
                  onCreate={onCreate}
                  createButtonLabel="Upload Product Image"
              />
          </div>
      )}

      <Table<ProductImage>
        columns={columns}
        dataSource={imgs}
        rowKey="id" // Use id as row key
        pagination={{
          showTotal: (total) => `Total ${total} items`,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20"], // Adjust page size options
          defaultPageSize: 5, // Set a default page size
        }}
        loading={isLoading}
        size="small" // Use small size for nested table
      />
    </div>
  );
};