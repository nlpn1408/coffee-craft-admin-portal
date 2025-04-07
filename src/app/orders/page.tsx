"use client";

import React, { useState, useCallback } from "react";
import { Breadcrumb, message } from "antd";
import { GenericDataTable } from "@/components/GenericDataTable/GenericDataTable";
import { Order } from "@/types";
import UpdateStatusModal from "./UpdateStatusModal";
import OrderDetailModal from "./OrderDetailModal"; // Import the detail modal
import { useGetOrdersQuery } from "@/state/services/orderService";
import { useOrderTableColumns } from "./useOrderTableColumns";
import Header from "@/components/Header";
import { HomeOutlined } from "@ant-design/icons";

export default function OrdersPage() {
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); // State for detail modal
  const [editingOrder, setEditingOrder] = useState<Order | null>(null); // For status modal
  const [viewingOrderId, setViewingOrderId] = useState<string | null>(null); // State for detail modal ID
  const [isActionLoading, setIsActionLoading] = useState(false);

  const {
    data,
    isLoading: isLoadingOrders,
    isError,
    refetch,
  } = useGetOrdersQuery();

  // Opens the status update modal
  const handleOpenStatusModal = useCallback((order: Order) => {
    setEditingOrder(order);
    setIsStatusModalOpen(true);
  }, []);

  const handleCloseStatusModal = useCallback(() => {
    setIsStatusModalOpen(false);
    setEditingOrder(null);
  }, []);

  // Opens the detail modal
  const handleOpenDetailModal = useCallback((orderId: string) => {
    setViewingOrderId(orderId);
    setIsDetailModalOpen(true);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setViewingOrderId(null);
  }, []);

  // Handler for deleting selected rows (placeholder)
  const handleDeleteSelected = async (selectedIds: React.Key[]) => {
    setIsActionLoading(true);
    console.log("Attempting bulk action on selected IDs:", selectedIds);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate action
    message.warning("Bulk order actions (delete/cancel) are not implemented.");
    setIsActionLoading(false);
    return false; // Indicate failure
  };

  const columns = useOrderTableColumns({
    onEdit: handleOpenStatusModal,
    onViewDetails: handleOpenDetailModal, // Pass the detail modal handler
  });

  if (isError) {
    message.error("Failed to load orders.");
    // Optionally return an error component
  }

  // Use the data directly, providing an empty array as fallback

  return (
    <>
      <Breadcrumb
        items={[
          { href: "/", title: <HomeOutlined /> },
          { title: "Order" }, // Current page
        ]}
      />
      <GenericDataTable<Order>
        columns={columns}
        dataSource={data?.data || []}
        loading={isLoadingOrders}
        entityName="Order"
        // onCreate={() => {
        //   message.info("Create Order functionality not implemented.");
        // }}
        onDeleteSelected={handleDeleteSelected}
        isActionLoading={isActionLoading}
        isDeleting={isActionLoading}
      />

      {/* Render the status update modal */}
      {isStatusModalOpen && editingOrder && (
        <UpdateStatusModal
          isOpen={isStatusModalOpen}
          onClose={handleCloseStatusModal}
          order={editingOrder}
          refetchOrders={refetch}
        />
      )}

      {/* Render the detail modal */}
      {isDetailModalOpen && viewingOrderId && (
        <OrderDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          orderId={viewingOrderId}
        />
      )}
    </>
  );
}
