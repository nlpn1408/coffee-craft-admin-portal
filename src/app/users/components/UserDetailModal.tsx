"use client";

import React from "react";
import {
  Modal,
  Spin,
  Descriptions,
  Tag,
  List,
  Typography,
  Divider,
  Rate,
} from "antd";
import { User, Order, ShippingAddress, Review } from "@/types"; // Import necessary types
import { useGetUserQuery } from "@/state/services/userService"; // Use existing hook
import { format } from "date-fns";
import Link from "next/link"; // For linking to products in reviews
import { formatCurrency } from "@/utils/utils";

const { Text, Title } = Typography;

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

// Helper to render role tag
const renderRoleTag = (role: string) => {
  let color = "blue";
  if (role === "ADMIN") color = "volcano";
  if (role === "STAFF") color = "gold";
  return <Tag color={color}>{role}</Tag>;
};

export default function UserDetailModal({
  isOpen,
  onClose,
  userId,
}: UserDetailModalProps) {
  // Fetch the specific user details when the modal is open and an ID is provided
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useGetUserQuery(userId!, {
    skip: !userId || !isOpen, // Skip query if no ID or modal is closed
  });

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      title={`User Details - ${user?.name ?? `...${userId?.slice(-8)}`}`}
      open={isOpen}
      onCancel={handleCancel}
      footer={null} // No actions in this modal for now
      width={900} // Make modal wider for details
      destroyOnClose
    >
      <Spin spinning={isLoading}>
        {isError ? (
          <Text type="danger">
            Failed to load user details. Error: {JSON.stringify(error)}
          </Text>
        ) : user ? (
          <>
            {/* Basic User Info */}
            <Title level={5}>User Information</Title>
            <Descriptions bordered column={2} size="small" className="mb-4">
              <Descriptions.Item label="User ID">{user.id}</Descriptions.Item>
              <Descriptions.Item label="Name">
                {user.name ?? "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
              <Descriptions.Item label="Phone">
                {user.phone ?? "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Role">
                {renderRoleTag(user.role)}
              </Descriptions.Item>
              <Descriptions.Item label="Gender">
                {user.gender ?? "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Date of Birth">
                {user.dob ? format(new Date(user.dob), "P") : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Member Since">
                {format(new Date(user.createdAt), "P")}
              </Descriptions.Item>
              <Descriptions.Item label="Address" span={2}>
                {user.address ?? "N/A"}
              </Descriptions.Item>
            </Descriptions>

            {/* Shipping Addresses */}
            <Divider>Shipping Addresses</Divider>
            <List
              size="small"
              bordered
              dataSource={user.shippingAddresses ?? []}
              renderItem={(addr: ShippingAddress) => (
                <List.Item>
                  <Descriptions
                    column={3}
                    size="small"
                    layout="horizontal"
                    className="w-full"
                  >
                    <Descriptions.Item label="Receiver Name">
                      {addr.receiverName} 
                    </Descriptions.Item>
                    <Descriptions.Item label="Receiver Phone">
                      {addr.receiverPhone}
                    </Descriptions.Item>
                    <Descriptions.Item label="Address">
                      {addr.address}
                    </Descriptions.Item>
                  </Descriptions>
                </List.Item>
              )}
              locale={{ emptyText: "No shipping addresses found." }}
              className="mb-4"
            />

            {/* Orders */}
            <Divider>Orders</Divider>
            <List
              size="small"
              bordered
              dataSource={user.orders ?? []}
              renderItem={(order: Order) => (
                <List.Item>
                  <Descriptions
                    column={4}
                    size="small"
                    layout="horizontal"
                    className="w-full"
                  >
                    <Descriptions.Item label="Order ID" span={2}>
                      {order.id}
                    </Descriptions.Item>
                    <Descriptions.Item label="Date">
                      {format(new Date(order.createdAt), "P")}
                    </Descriptions.Item>
                    <Descriptions.Item label="Total">
                      {formatCurrency(order.finalTotal)}
                    </Descriptions.Item>
                    {/* Add link to order details page if available */}
                  </Descriptions>
                </List.Item>
              )}
              locale={{ emptyText: "No orders found." }}
              className="mb-4"
            />

            {/* Reviews */}
            <Divider>Reviews</Divider>
            <List
              size="small"
              bordered
              dataSource={user.reviews ?? []}
              renderItem={(review: Review) => (
                <List.Item>
                  <Descriptions
                    column={1}
                    size="small"
                    layout="horizontal"
                    className="w-full"
                  >
                    <Descriptions.Item label="Product">
                      {/* Assuming product name is available, otherwise show ID */}
                      {/* Add Link to product page if possible */}
                      {review.product?.name ?? `ID: ${review.productId}`}
                    </Descriptions.Item>
                    <Descriptions.Item label="Rating">
                      <Rate disabled defaultValue={review.rating} />
                    </Descriptions.Item>
                    <Descriptions.Item label="Comment">
                      {review.comment ?? (
                        <Text type="secondary">No comment</Text>
                      )}
                    </Descriptions.Item>
                  </Descriptions>
                </List.Item>
              )}
              locale={{ emptyText: "No reviews found." }}
            />
          </>
        ) : (
          <Text type="secondary">No user data available.</Text>
        )}
      </Spin>
    </Modal>
  );
}
