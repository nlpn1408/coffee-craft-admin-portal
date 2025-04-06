"use client";

"use client";

"use client";

import React, { useState } from "react";
import { Button, message } from "antd"; // Import Button and message
import { Voucher } from "@/types";
import VoucherList from "@/app/vouchers/components/VoucherList";
import CreateEditVoucherModal from "@/app/vouchers/components/CreateEditVoucherModal";
import { useGetVouchersQuery, useCreateVoucherMutation } from "@/state/services/voucherService"; // Import mutation hook
import { dummyVouchers } from "./dummyVouchers"; // Import dummy data
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
  const { refetch: refetchVouchers } = useGetVouchersQuery({}); // Fetch initial page for refetch trigger
  const [createVoucher, { isLoading: isCreating }] = useCreateVoucherMutation(); // Get mutation hook and loading state
  const [isDummyLoading, setIsDummyLoading] = useState(false); // Loading state for dummy data creation

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

  // Handler for creating dummy data
  const handleCreateDummyData = async () => {
    setIsDummyLoading(true);
    message.loading({ content: `Creating ${dummyVouchers.length} dummy vouchers...`, key: 'dummyCreate', duration: 0 });

    const results = await Promise.allSettled(
      dummyVouchers.map(voucherData => {
        console.log("Attempting to create voucher:", JSON.stringify(voucherData, null, 2)); // Log data before sending
        return createVoucher(voucherData).unwrap();
      })
    );

    let successCount = 0;
    let errorCount = 0;
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        successCount++;
      } else {
        errorCount++;
        // Log more details about the failed voucher and the reason
        const failedIndex = results.findIndex(r => r === result);
        const failedVoucherData = dummyVouchers[failedIndex];
        console.error(`Failed to create dummy voucher (Code: ${failedVoucherData?.code}):`, result.reason);
      }
    });

    message.destroy('dummyCreate'); // Close loading message

    if (errorCount > 0) {
      message.error(`Failed to create ${errorCount} dummy vouchers. ${successCount} created successfully.`);
    } else {
      message.success(`Successfully created ${successCount} dummy vouchers!`);
    }

    if (successCount > 0) {
       refetchVouchers(); // Refetch list if any were created
    }

    setIsDummyLoading(false);
  };

  // Handler for successful save (create/update)
  const handleSaveSuccess = () => {
    handleCloseModal();
    refetchVouchers();
  };

  return (
    <div className="mx-auto pb-5 w-full">
      {/* Add button for dummy data creation */}
      <div className="mb-4 flex justify-end">
         <Button
           onClick={handleCreateDummyData}
           loading={isDummyLoading || isCreating} // Disable if general creation is also loading
           disabled={isDummyLoading}
         >
           Create Dummy Vouchers
         </Button>
      </div>

      {/* Render the main voucher list component */}
      <VoucherList
        onCreate={handleOpenCreateModal}
        onEdit={handleOpenEditModal}
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
