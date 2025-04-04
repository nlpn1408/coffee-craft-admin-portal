"use client";

import React, { useMemo } from "react"; // Removed useRef, Key
import {
  Product,
  Category,
  Brand,
  ProductImage,
  Tag as ProductTagType,
} from "@/types";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  Tag as AntTag,
  Image,
  // InputRef, // Removed unused
  // Menu, // Removed unused
  // Dropdown, // Removed unused
} from "antd";
import type { TableProps, TableColumnsType } from "antd"; // Removed MenuProps
// import type { ColumnType } from "antd/es/table/interface"; // Removed unused
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/utils";
import { useColumnSearch } from "@/hooks/useColumnSearch";

// Removed DataIndex type alias

// Hook Arguments Interface
interface UseProductTableColumnsProps {
  categories: Category[];
  brands: Brand[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => Promise<void>;
  onViewDetails: (product: Product) => void;
  isActionLoading?: boolean;
  isDeleting?: boolean;
}

export const useProductTableColumns = ({
  categories,
  brands,
  onEdit,
  onDelete,
  onViewDetails,
  isActionLoading = false,
  isDeleting = false,
}: UseProductTableColumnsProps): TableColumnsType<Product> => {
  const getColumnSearchProps = useColumnSearch<Product>();

  const categoryFilters = useMemo(
    () => categories?.map((cat) => ({ text: cat.name, value: cat.id })) ?? [],
    [categories]
  );
  const brandFilters = useMemo(
    () => brands?.map((brand) => ({ text: brand.name, value: brand.id })) ?? [],
    [brands]
  );

  const columns: TableColumnsType<Product> = [
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
      sorter: true,
      ...getColumnSearchProps("name"),
      ellipsis: true,
      width: 200,
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      ...getColumnSearchProps("sku"),
      width: 150,
    },
    {
      title: "Category",
      dataIndex: "categoryId",
      key: "categoryId",
      filters: categoryFilters,
      ellipsis: true,
      render: (categoryId: string) =>
        categoryId
          ? categories.find((cat) => cat.id === categoryId)?.name
          : "-",
      width: 150,
    },
    {
      title: "Brand",
      dataIndex: "brandId",
      key: "brandId",
      filters: brandFilters,
      ellipsis: true,
      render: (brandId: string) =>
        brandId ? brands.find((brand) => brand.id === brandId)?.name : "-",
      width: 150,
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
    // {
    //   title: "Short Desc.",
    //   dataIndex: "shortDescription",
    //   key: "shortDescription",
    //   ellipsis: true,
    //   width: 200,
    // },
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
        { text: "Inactive", value: false }, // Removed duplicate Active filter
      ],
      render: (active) => (
        <AntTag color={active ? "green" : "red"}>
          {active ? "Active" : "Inactive"}
        </AntTag>
      ),
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
            icon={<EyeOutlined />}
            onClick={() => onViewDetails(record)}
            size="small"
            aria-label="View Details"
            title="View Details"
            disabled={isActionLoading}
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            size="small"
            aria-label="Edit"
            title="Edit Product"
            disabled={isActionLoading}
          />
          <Popconfirm
            title="Delete Product"
            description="Are you sure you want to delete this product?"
            onConfirm={() => onDelete(record.id)}
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
              title="Delete Product"
              disabled={isActionLoading}
            />
          </Popconfirm>
        </Space>
      ),
      width: 120,
      fixed: "right",
      align: "center",
    },
  ];

  return columns;
};
