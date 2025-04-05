"use client";

import React, { useState, useMemo } from "react";
import { Voucher } from "@/types";
import {
  useGetVouchersQuery,
  useDeleteVoucherMutation,
} from "@/state/services/voucherService";
import { message, notification } from "antd";
import type { TableProps, TablePaginationConfig } from "antd";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import { handleApiError } from "@/lib/api-utils";
import { useVoucherTableColumns } from "@/app/vouchers/components/useVoucherTableColumns"; // Use absolute path alias
import LoadingScreen from "@/components/LoadingScreen";
import { GenericDataTable } from "@/components/GenericDataTable/GenericDataTable";

// Define props interface
interface VoucherListProps {
  onCreate: () => void;
  onEdit: (voucher: Voucher) => void;
  // Add onViewDetails if needed later
}

const VoucherList: React.FC<VoucherListProps> = ({ onCreate, onEdit }) => {
  // State for pagination, sorting, filtering
  const [queryParams, setQueryParams] = useState<{
    page: number;
    limit: number;
    filters: Record<string, FilterValue | null>;
    sortBy?: string; // Changed from sortField to match API doc
    sortOrder?: "asc" | "desc"; // Changed from sortOrder to match API doc
    isActive?: boolean; // Added isActive filter
  }>({
    page: 1,
    limit: 10,
    filters: {},
    // Default sort can be set here if desired, e.g., sortBy: 'endDate', sortOrder: 'desc'
  });

  // Fetch Vouchers using RTK Query
  const {
    data: vouchersResponse,
    isLoading,
    isFetching,
    isError,
    refetch: refetchVouchers,
  } = useGetVouchersQuery({
    page: queryParams.page,
    limit: queryParams.limit,
    sortBy: queryParams.sortBy,
    sortOrder: queryParams.sortOrder,
    isActive: queryParams.isActive,
    filters: queryParams.filters, // Pass filters object
  });

  const vouchers = useMemo(() => vouchersResponse?.data ?? [], [vouchersResponse]);
  const totalVouchers = useMemo(() => vouchersResponse?.total ?? 0, [vouchersResponse]);

  // Mutations
  const [deleteVoucher, { isLoading: isDeleting }] = useDeleteVoucherMutation();

  // --- Handlers ---
  const handleEdit = (voucher: Voucher) => {
    onEdit(voucher);
  };

  const handleDeleteSingle = async (id: string): Promise<void> => {
    try {
      await deleteVoucher(id).unwrap();
      notification.success({ message: "Success", description: "Voucher deleted successfully" });
      // Refetch or adjust pagination after delete
      if (vouchers.length === 1 && queryParams.page > 1) {
        setQueryParams(prev => ({ ...prev, page: prev.page - 1 }));
      } else {
        refetchVouchers();
      }
    } catch (error) {
      handleApiError(error);
      throw error; // Re-throw for Popconfirm loading state
    }
  };

   const handleDeleteSelected = async (selectedIds: React.Key[]): Promise<boolean> => {
    const key = "deleting_selected_vouchers";
    message.loading({ content: `Deleting ${selectedIds.length} vouchers...`, key, duration: 0 });
    try {
      await Promise.all(selectedIds.map(id => deleteVoucher(id as string).unwrap()));
      message.success({ content: `${selectedIds.length} vouchers deleted successfully`, key });
      refetchVouchers();
      return true;
    } catch (error) {
      message.error({ content: `Failed to delete selected vouchers`, key });
      handleApiError(error);
      return false;
    }
  };


  // --- Table Change Handler ---
  const handleTableChange: TableProps<Voucher>["onChange"] = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<Voucher> | SorterResult<Voucher>[]
  ) => {
    const currentSorter = Array.isArray(sorter) ? sorter[0] : sorter;
    setQueryParams(prev => ({
      ...prev,
      page: pagination.current || 1,
      limit: pagination.pageSize || 10,
      filters: filters,
      // Map Ant sorter 'field' to API 'sortBy'
      sortBy: currentSorter?.field as string | undefined,
      // Map Ant sorter 'order' to API 'sortOrder'
      sortOrder: currentSorter?.order === 'ascend' ? 'asc' : currentSorter?.order === 'descend' ? 'desc' : undefined,
      // Extract isActive filter
      isActive: filters.isActive?.[0] as boolean | undefined,
    }));
  };

  // --- Get Columns from Hook ---
  const columns = useVoucherTableColumns({
    onEdit: handleEdit,
    onDelete: handleDeleteSingle,
    isActionLoading: isFetching || isDeleting, // Disable actions while fetching or deleting
    isDeleting: isDeleting,
  });

  if (isLoading && !isFetching) {
    return <LoadingScreen />;
  }

  if (isError && !isLoading) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch vouchers. Please try again later.
      </div>
    );
  }

  return (
    <>
      <GenericDataTable<Voucher>
        columns={columns}
        dataSource={vouchers}
        loading={isFetching}
        entityName="Voucher"
        onCreate={onCreate}
        onDeleteSelected={handleDeleteSelected} // Enable bulk delete
        // Add import/export if needed later
        // uploadProps={uploadProps}
        // onExport={handleExport}
        // onDownloadTemplate={handleDownloadTemplate}
        isActionLoading={isFetching || isDeleting} // Pass general action loading
        isDeleting={isDeleting} // Pass specific deleting state
        // isImporting={isImporting}
        pagination={{
            current: queryParams.page,
            pageSize: queryParams.limit,
            total: totalVouchers,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        onChange={handleTableChange} // Pass the change handler
      />
    </>
  );
};

export default VoucherList;
