"use client";

import {
  DollarSign,
  ShoppingCart,
  BadgeDollarSign,
  Users,
} from "lucide-react";
import StatCard from "./StatCard";
import { RevenueSummary, UserSummaryStats } from "@/types/api"; // Import UserSummaryStats, remove ProductInventorySummary
import { formatCurrency, formatNumber } from "@/utils/utils";

interface KpiCardsProps {
  revenueSummary: RevenueSummary | undefined;
  userSummary: UserSummaryStats | undefined; // Change prop name and type
}

const KpiCards: React.FC<KpiCardsProps> = ({
  revenueSummary,
  userSummary,
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
        title="Total Users"
        primaryIcon={<Users className="text-indigo-600 w-6 h-6" />} // Change icon and color
        details={[
          {
            title: "Users", // Change detail title
            amount: formatNumber(userSummary?.totalUsers), // Use userSummary data
          },
        ]}
      />
    </div>
  );
};

export default KpiCards;