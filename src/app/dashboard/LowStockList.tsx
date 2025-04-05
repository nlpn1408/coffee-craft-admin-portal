"use client";

import { ProductInventorySummary } from "@/types/api";
import { formatNumber } from "@/utils/utils";
import { AlertTriangle } from "lucide-react";

interface LowStockListProps {
  data: ProductInventorySummary | undefined;
}

const LowStockList: React.FC<LowStockListProps> = ({ data }) => {
  const lowStockProducts = data?.lowStockProducts ?? [];
  const threshold = data?.lowStockThreshold ?? 10; // Use default if not provided

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-3 flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2 text-red-500" /> Low Stock Items
        (≤ {threshold} Units)
      </h3>
      <div className="space-y-2 max-h-60 overflow-y-auto"> {/* Added max height and scroll */}
        {lowStockProducts.length > 0 ? (
          lowStockProducts.map((product) => (
            <div
              key={product.productId}
              className="flex justify-between items-center text-sm border-b pb-1 last:border-b-0"
            >
              <span
                className="text-gray-800 truncate pr-2"
                title={`${product.name} (${product.sku})`} // Add SKU to title
              >
                {product.name} ({product.sku})
              </span>
              <span className="text-red-600 font-medium whitespace-nowrap"> {/* Prevent wrapping */}
                {formatNumber(product.stock)} Units Left
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">
            No products are currently below the low stock threshold.
          </p>
        )}
      </div>
    </div>
  );
};

export default LowStockList;