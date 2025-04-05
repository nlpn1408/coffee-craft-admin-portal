"use client";

import {
  DollarSign,
  ShoppingCart,
  BadgeDollarSign,
  Package,
} from "lucide-react";
import StatCard from "./StatCard";
import { RevenueSummary, ProductInventorySummary } from "@/types/api";
import { formatCurrency, formatNumber } from "@/utils/utils"; // Assuming formatNumber is also in utils

interface KpiCardsProps {
  revenueSummary: RevenueSummary | undefined;
  inventorySummary: ProductInventorySummary | undefined;
}

const KpiCards: React.FC<KpiCardsProps> = ({
  revenueSummary,
  inventorySummary,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Revenue"
        primaryIcon={<DollarSign className="text-green-600 w-6 h-6" />}
        details={[
          {
            title: "Revenue",
            amount: formatCurrency(revenueSummary?.totalRevenue),
          },
        ]}
      />
      <StatCard
        title="Total Orders"
        primaryIcon={<ShoppingCart className="text-blue-600 w-6 h-6" />}
        details={[
          {
            title: "Orders",
            amount: formatNumber(revenueSummary?.totalOrders),
          },
        ]}
      />
      <StatCard
        title="Avg. Order Value"
        primaryIcon={<BadgeDollarSign className="text-purple-600 w-6 h-6" />}
        details={[
          {
            title: "Average",
            amount: formatCurrency(revenueSummary?.averageOrderValue),
          },
        ]}
      />
      <StatCard
        title="Active Products"
        primaryIcon={<Package className="text-orange-600 w-6 h-6" />}
        details={[
          {
            title: "Products",
            amount: formatNumber(inventorySummary?.totalStockCount),
          },
        ]}
      />
    </div>
  );
};

export default KpiCards;