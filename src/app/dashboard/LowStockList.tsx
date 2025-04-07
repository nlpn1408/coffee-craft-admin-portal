"use client";

import Link from "next/link";
import { ProductInventorySummary } from "@/types/api";
import { formatNumber } from "@/utils/utils";
import { AlertTriangle, AlertCircle } from "lucide-react";
import { Spin, Alert } from 'antd'; // Import Spin and Alert
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";

interface LowStockListProps {
  data: ProductInventorySummary | undefined;
  isLoading: boolean; // Add isLoading prop
  error: FetchBaseQueryError | SerializedError | undefined; // Add error prop
}

const LowStockList: React.FC<LowStockListProps> = ({ data, isLoading, error }) => {
  const lowStockProducts = data?.lowStockProducts ?? [];
  const threshold = data?.lowStockThreshold ?? 10;

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-[200px]"><Spin size="default" /></div>; // Adjust height
    }

    if (error) {
      console.error("Low Stock List Error:", error);
      return (
          <div className="flex justify-center items-center h-[200px]">
               <Alert
                  message="Error Loading Data"
                  type="error"
                  showIcon
                  icon={<AlertCircle size={16}/>}
              />
          </div>
      );
    }

     if (!data) {
        return <div className="text-center text-gray-500 py-4 h-[200px]">Inventory data unavailable.</div>;
     }

    // Render the list if data is available
    return (
       <div className="space-y-2 max-h-60 overflow-y-auto"> {/* Added max height and scroll */}
        {lowStockProducts.length > 0 ? (
          lowStockProducts.map((product) => (
            <div
              key={product.productId}
              className="flex justify-between items-center text-sm border-b pb-1 last:border-b-0"
            >
              <Link href={`/products/${product.productId}`} passHref>
                <span
                  className="text-blue-600 hover:underline cursor-pointer truncate pr-2" // Add link styles
                  title={`${product.name} (${product.sku})`}
                >
                  {product.name} ({product.sku})
                </span>
              </Link>
              <span className="text-red-600 font-medium whitespace-nowrap"> {/* Prevent wrapping */}
                {formatNumber(product.stock)} Units Left
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm text-center py-4">
            No products are currently below the low stock threshold.
          </p>
        )}
      </div>
    );
  };


  return (
    <div className="bg-white p-4 rounded-lg shadow min-h-[150px]"> {/* Added min-h */}
      <h3 className="text-lg font-medium mb-3 flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2 text-red-500" /> Low Stock Items
        {!isLoading && data ? ` (≤ ${threshold} Units)` : ''} {/* Show threshold only when data loaded */}
      </h3>
      {renderContent()}
    </div>
  );
};

export default LowStockList;