"use client";

"use client";

"use client";

import React, { useState } from "react";
import { Voucher } from "@/types";
import VoucherList from "@/app/vouchers/components/VoucherList"; // Use absolute path alias
import CreateEditVoucherModal from "@/app/vouchers/components/CreateEditVoucherModal"; // Use absolute path alias
import { useGetVouchersQuery } from "@/state/services/voucherService";

const VouchersPage = () => {
  // State for managing the modal
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    voucher: Voucher | null; // Null when creating
  }>({
    isOpen: false,
    voucher: null,
  });

  // Refetch function from the query hook to refresh the list after save
  // We call the hook here just to get the refetch function easily
  const { refetch: refetchVouchers } = useGetVouchersQuery({ page: 1, limit: 1 });

  // Handlers to open the modal
  const handleOpenCreateModal = () => {
    setModalState({ isOpen: true, voucher: null });
  };

  const handleOpenEditModal = (voucher: Voucher) => {
    setModalState({ isOpen: true, voucher: voucher });
  };

  // Handler to close the modal
  const handleCloseModal = () => {
    setModalState({ isOpen: false, voucher: null });
  };

  // Handler for successful save (create/update)
  const handleSaveSuccess = () => {
    handleCloseModal();
    refetchVouchers(); // Refetch the voucher list
  };

  return (
    <div className="mx-auto pb-5 w-full">
      {/* Render the main voucher list component */}
      <VoucherList
        onCreate={handleOpenCreateModal}
        onEdit={handleOpenEditModal}
        // Add onViewDetails if needed later
      />

      {/* Conditionally render the Create/Edit Modal */}
      {modalState.isOpen && (
        <CreateEditVoucherModal
          isOpen={modalState.isOpen}
          voucher={modalState.voucher}
          onClose={handleCloseModal}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
};

export default VouchersPage;
