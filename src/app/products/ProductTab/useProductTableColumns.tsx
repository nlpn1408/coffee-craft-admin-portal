"use client";

import React, { useRef, useMemo, Key } from "react";
import {
  Product,
  Category,
  Brand,
  ProductImage,
  Tag as ProductTagType,
} from "@/types"; // Renamed imported Tag type
import {
  Table,
  Button,
  Space,
  Popconfirm,
  Tag as AntTag,
  Image,
  InputRef,
  Menu,
  Dropdown,
} from "antd"; // Aliased Ant Design Tag
import type { TableProps, MenuProps, TableColumnsType } from "antd"; // Import TableColumnsType
import type { ColumnType } from "antd/es/table/interface";
import { EditOutlined, DeleteOutlined, MoreOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/utils";
import { useColumnSearch } from "@/hooks/useColumnSearch"; // Import the reusable search hook

type DataIndex = keyof Product | "category" | "brand";

// Hook Arguments Interface
interface UseProductTableColumnsProps {
  categories: Category[]; // Pass categories for filtering/display
  brands: Brand[]; // Pass brands for filtering/display
  onEdit: (product: Product) => void;
  onDelete: (id: string) => Promise<void>;
  // Pass queryParams for sortOrder and filteredValue if needed for controlled state
  // queryParams: { sortField?: string; sortOrder?: 'descend' | 'ascend'; filters: Record<string, FilterValue | null> };
  isActionLoading?: boolean;
  isDeleting?: boolean;
}

export const useProductTableColumns = ({
  categories,
  brands,
  onEdit,
  onDelete,
  // queryParams, // Receive queryParams if needed for controlled state
  isActionLoading = false,
  isDeleting = false,
}: UseProductTableColumnsProps): TableColumnsType<Product> => {
  // Use TableColumnsType for better type safety

  // Use the hook to get the search props generator
  const getColumnSearchProps = useColumnSearch<Product>();

  // Prepare filters from props
  const categoryFilters = useMemo(
    () => categories?.map((cat) => ({ text: cat.name, value: cat.id })) ?? [],
    [categories]
  );
  const brandFilters = useMemo(
    () => brands?.map((brand) => ({ text: brand.name, value: brand.id })) ?? [],
    [brands]
  );

  // --- Action Menu Logic (Optional) ---
  // const handleMenuClick = (e: { key: string }, product: Product) => {
  //   if (e.key === 'edit') {
  //      onEdit(product);
  //   }
  //   // Add other actions
  // };
  // const getMenuItems = (product: Product): MenuProps['items'] => [
  //   { label: 'Edit Product', key: 'edit' },
  // ];
  // --- End Action Menu Logic ---

  const columns: TableColumnsType<Product> = [
    // Use TableColumnsType
    {
      title: "Image",
      dataIndex: "images",
      key: "images",
      render: (images: ProductImage[] | undefined) => {
        const imageUrl = images && images.length > 0 ? images[0]?.url : null;
        const imageAlt = "Product";
        const allImageUrls = images ? images.map((img) => img.url) : [];

        return imageUrl ? (
          <Image.PreviewGroup items={allImageUrls}>
            <Image
              width={60}
              height={60}
              src={imageUrl}
              alt={imageAlt}
              style={{ objectFit: "cover", borderRadius: "4px" }}
            />
          </Image.PreviewGroup>
        ) : (
          <div className="w-[60px] h-[60px] bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">
            No image
          </div>
        );
      },
      width: 80,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true, // Server-side sort enabled
      ...getColumnSearchProps("name"), // Server-side search enabled
      ellipsis: true,
      width: 200, // Adjusted width
      // sortOrder and filteredValue will be controlled by the Table's state via onChange in ProductTab
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      ...getColumnSearchProps("sku"),
      width: 120,
    },
    {
      title: "Category",
      dataIndex: ["category", "name"],
      key: "category",
      filters: categoryFilters,
      ellipsis: true,
      // onFilter handled server-side
    },
    {
      title: "Brand",
      dataIndex: ["brand", "name"],
      key: "brand",
      filters: brandFilters,
      ellipsis: true,
      // onFilter handled server-side
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      render: (tags: ProductTagType[] | undefined) => {
        return tags && tags.length > 0 ? (
          <Space size={[0, 8]} wrap>
            {tags.map((tag) => (
              <AntTag key={tag.id} color="blue">
                {tag.name}
              </AntTag>
            ))}
          </Space>
        ) : (
          <div className="text-gray-500">No tags</div>
        );
      },
    },
    {
      title: "Short Desc.",
      dataIndex: "shortDescription",
      key: "shortDescription",
      ellipsis: true,
      width: 200,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      sorter: true,
      render: (price) => formatCurrency(price),
      align: "right",
      width: 150,
    },
    {
      title: "Discount Price",
      dataIndex: "discountPrice",
      key: "discountPrice",
      sorter: true,
      render: (price) => (price ? formatCurrency(price) : "-"),
      align: "right",
      width: 150,
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      sorter: true,
      align: "right",
      width: 100,
    },
    {
      title: "Rating",
      dataIndex: "avgRating",
      key: "avgRating",
      sorter: true,
      render: (avgRating) => (avgRating > 0 ? avgRating.toFixed(1) : "N/A"),
      align: "center",
      width: 100,
    },
    {
      title: "Status",
      dataIndex: "active",
      key: "active",
      filters: [
        { text: "Active", value: true },
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
      // onFilter handled server-side
      render: (active) => (
        <AntTag color={active ? "green" : "red"}>
          {active ? "Active" : "Inactive"}
        </AntTag>
      ), // Use aliased AntTag
      width: 100,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      render: (createdAt) =>
        createdAt ? format(new Date(createdAt), "dd/MM/yyyy HH:mm") : "-",
      width: 150,
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      sorter: true,
      render: (updatedAt) =>
        updatedAt ? format(new Date(updatedAt), "dd/MM/yyyy HH:mm") : "-",
      width: 150,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            onClick={() => onEdit(record)} // Use onEdit prop
            size="small"
            aria-label="Edit"
            disabled={isActionLoading}
          />
          <Popconfirm
            title="Delete Product"
            description="Are you sure you want to delete this product?"
            onConfirm={() => onDelete(record.id)} // Use onDelete prop
            okText="Yes"
            cancelText="No"
            okButtonProps={{ loading: isDeleting }}
            disabled={isActionLoading}
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              size="small"
              aria-label="Delete"
              disabled={isActionLoading}
            />
          </Popconfirm>
        </Space>
      ),
      width: 80,
      fixed: "right",
      align: "center",
    },
  ];

  return columns;
};
