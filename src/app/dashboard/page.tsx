"use client";

import { Activity, ListOrdered, Users as UsersIcon } from "lucide-react";
import KpiCards from "./KpiCards";
import OrderStatusChart from "./OrderStatusChart";
import TopSellingProductsChart from "./TopSellingProductsChart";
import LowStockList from "./LowStockList";
import UserActivitySummary from "./UserActivitySummary";
import {
  useGetRevenueSummaryQuery,
  useGetOrderStatusStatsQuery,
  useGetTopSellingProductsQuery,
  useGetProductInventorySummaryQuery,
  useGetUserSummaryStatsQuery,
} from "@/state/services/dashboardService";

const Dashboard = () => {
  // Fetch data using individual hooks
  const { data: revenueSummary, isLoading: isLoadingRevenue, error: errorRevenue } = useGetRevenueSummaryQuery();
  const { data: orderStatusStats, isLoading: isLoadingOrderStatus, error: errorOrderStatus } = useGetOrderStatusStatsQuery();
  const { data: topProducts, isLoading: isLoadingTopProducts, error: errorTopProducts } = useGetTopSellingProductsQuery();
  const { data: inventorySummary, isLoading: isLoadingInventory, error: errorInventory } = useGetProductInventorySummaryQuery();
  const { data: userSummary, isLoading: isLoadingUserSummary, error: errorUserSummary } = useGetUserSummaryStatsQuery(); // Fetch user stats

  // Combined loading and error states
  const isLoading = isLoadingRevenue || isLoadingOrderStatus || isLoadingTopProducts || isLoadingInventory || isLoadingUserSummary;
  const error = errorRevenue || errorOrderStatus || errorTopProducts || errorInventory || errorUserSummary;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading dashboard data...
      </div>
    );
  }

  if (error) {
    console.error("Dashboard Loading Error:", error);
    return (
      <div className="text-red-600 text-center p-4 border border-red-300 rounded bg-red-50 mt-4">
        Error loading dashboard data. Please check the console or try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      {/* Section 1: KPIs */}
      <h2 className="text-xl font-semibold text-gray-700">
        Key Metrics (Last 30 Days)
      </h2>
      {/* Pass userSummary to KpiCards, remove inventorySummary */}
      <KpiCards revenueSummary={revenueSummary} userSummary={userSummary} />

      {/* Section 2: Order & Product Insights */}
      <h2 className="text-xl font-semibold text-gray-700">
        Insights (Last 30 Days)
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
           <h3 className="text-lg font-medium mb-3 flex items-center">
             <Activity className="w-5 h-5 mr-2 text-gray-600" /> Order Status Distribution
           </h3>
           <OrderStatusChart data={orderStatusStats} />
        </div>

        {/* Top Selling Products Chart */}
         <div className="bg-white p-4 rounded-lg shadow">
           <h3 className="text-lg font-medium mb-3 flex items-center">
             <ListOrdered className="w-5 h-5 mr-2 text-gray-600" /> Top 5 Selling Products (by Quantity)
           </h3>
           <TopSellingProductsChart data={topProducts} />
         </div>
      </div>

      {/* Section 3: User & Inventory Insights */}
      <h2 className="text-xl font-semibold text-gray-700">User & Inventory</h2>
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Activity Summary */}
          <UserActivitySummary data={userSummary} />

          {/* Inventory Overview (using LowStockList component) */}
          <LowStockList data={inventorySummary} />
       </div>
    </div>
  );
};

export default Dashboard;
