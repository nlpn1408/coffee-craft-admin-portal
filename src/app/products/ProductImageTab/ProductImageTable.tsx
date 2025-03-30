import { ActionColumn } from "@/components/TableActionRow/ActionColumn";
import { TableToolbar } from "@/components/TableToolbar/TableToolbar";
import { useGetProductImagesQuery, useGetProductsQuery } from "@/state/api";
import { NewProductImage, ProductImage } from "@/types";
import { Switch, Table, TableColumnsType } from "antd";

type Props = {
  selectedProductId?: string;
  onCreate?: () => void;
  onEdit: (imgs: ProductImage) => void;
  onUpdate: (id: string, data: NewProductImage) => void;
  onDelete: (id: string) => void;
};
export const ProductImageTable = ({
  selectedProductId = "",
  onCreate,
  onEdit,
  onUpdate,
  onDelete,
}: Props) => {
  const {
    data: imgs,
    isLoading,
    isError,
  } = useGetProductImagesQuery({ productId: selectedProductId });
  const { data: products } = useGetProductsQuery({});
  //   const []

  if (!isLoading && (isError || !imgs)) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch products
      </div>
    );
  }

  const columns: TableColumnsType<ProductImage> = [
    {
      title: "Image",
      dataIndex: "url",
      key: "images",
      render: (url) => {
        return url ? (
          <div className="w-50 h-50 relative">
            <img src={url} className="w-100" />
          </div>
        ) : (
          <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center">
            No image
          </div>
        );
      },
      width: 150,
    },
    {
      title: "Product Name",
      dataIndex: "productId",
      key: "productId",
      render: (productId) => {
        const product =
          products?.data && products.data.find((p) => p.id === productId);
        return product ? product.name : "N/A";
      },
      ellipsis: true,
    },
    {
      title: "Is Thumbnail",
      dataIndex: "isThumbnail",
      key: "isThumbnail",
      render: (isThumbnail, record) => (
        <Switch
          value={isThumbnail}
          onChange={() =>
            onUpdate(record.id, {
              ...record,
              isThumbnail: !isThumbnail,
            })
          }
        />
      ),
      width: 150,
    },
    {
      title: "Order",
      dataIndex: "order",
      key: "order",
      width: 100,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (createdAt) => new Date(createdAt).toLocaleString(),
      width: 180,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <ActionColumn
          onEdit={() => onEdit(record)}
          onDelete={() => onDelete(record.id)}
        />
      ),
      width: 80,
      fixed: "right",
      align: "center",
    },
  ];

  //   if (!isLoading && (isError || !imgs)) {
  //     return (
  //       <div className="text-center text-red-500 py-4">
  //         Failed to fetch products
  //       </div>
  //     );
  //   }
  return selectedProductId ? (
    <div className="mt-5">
      <div className="mb-4">
        <TableToolbar
          onCreate={onCreate}
          createButtonLabel="Upload Product Image"
        />
      </div>

      <Table<ProductImage>
        columns={columns}
        dataSource={imgs}
        pagination={{
          showTotal: (total) => `Total ${total} items`,
          showSizeChanger: true,
        }}
        loading={isLoading}
      />
    </div>
  ) : null;
};
