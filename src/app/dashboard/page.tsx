"use client";

import React, { useState, useMemo } from "react";
import { Breadcrumb, DatePicker, Space, Typography, Radio } from "antd"; // Import Radio
import { HomeOutlined } from "@ant-design/icons";
import moment from "moment"; // Import moment
// import type { Moment } from "moment"; // Import Moment type if needed for strict typing - removed for simplicity

import { Activity, ListOrdered, Users as UsersIcon } from "lucide-react";
import KpiCards from "./KpiCards";
import OrderStatusChart from "./OrderStatusChart";
import TopSellingProductsChart from "./TopSellingProductsChart";
import LowStockList from "./LowStockList";
import UserActivitySummary from "./UserActivitySummary";
import OrderTrendChart from "./OrderTrendChart"; // Import the new chart component
import {
  useGetRevenueSummaryQuery,
  useGetOrderStatusStatsQuery,
  useGetTopSellingProductsQuery,
  useGetProductInventorySummaryQuery,
  useGetUserSummaryStatsQuery,
  useGetOrderTrendQuery, // Import the new query hook
} from "@/state/services/dashboardService";
const { Text } = Typography; // Destructure Text

const Dashboard = () => {
  // State for date range
  // State for date range, default to last 30 days
  const [dateRange, setDateRange] = useState<
    [moment.Moment | null, moment.Moment | null]
  >([moment().subtract(30, "days"), moment()]);
  // State for groupBy
  const [groupBy, setGroupBy] = useState<'day' | 'month' | 'year'>('day'); // Add groupBy state, default to 'day'

  // Prepare query arguments based on date range state
  const queryArgs = useMemo(() => {
    if (dateRange && dateRange[0] && dateRange[1]) {
      return {
        period: "custom" as const, // Explicitly set period to 'custom'
        startDate: dateRange[0].format("YYYY-MM-DD"),
        endDate: dateRange[1].format("YYYY-MM-DD"),
      };
    }
    // Return undefined if no range is selected to use API default (Last 30 days)
    return undefined;
  }, [dateRange]);

  // Prepare query arguments for order trend, including groupBy
  const orderTrendArgs = useMemo(() => {
      // Combine dateRangeArgs and groupBy. Pass undefined for date args if dateRangeArgs is undefined.
      return { ...queryArgs, groupBy }; // Use queryArgs here as it contains date info or is undefined
  }, [queryArgs, groupBy]);


  // Fetch data using individual hooks, passing queryArgs
  const {
    data: revenueSummary,
    isLoading: isLoadingRevenue,
    error: errorRevenue,
  } = useGetRevenueSummaryQuery(queryArgs);
  const {
    data: orderStatusStats,
    isLoading: isLoadingOrderStatus,
    error: errorOrderStatus,
  } = useGetOrderStatusStatsQuery(queryArgs);
  const {
    data: topProducts,
    isLoading: isLoadingTopProducts,
    error: errorTopProducts,
  } = useGetTopSellingProductsQuery(queryArgs); // Assuming top products also accepts date range
  const {
    data: inventorySummary,
    isLoading: isLoadingInventory,
    error: errorInventory,
  } = useGetProductInventorySummaryQuery(); // Inventory doesn't take date range
  const {
    data: userSummary,
    isLoading: isLoadingUserSummary,
    error: errorUserSummary,
  } = useGetUserSummaryStatsQuery(queryArgs);
  const {
    data: orderTrend,
    isLoading: isLoadingOrderTrend,
    error: errorOrderTrend,
  } = useGetOrderTrendQuery(orderTrendArgs); // Use orderTrendArgs (contains groupBy)

  // Combined loading and error states
  const isLoading =
    isLoadingRevenue ||
    isLoadingOrderStatus ||
    isLoadingTopProducts ||
    isLoadingInventory ||
    isLoadingUserSummary ||
    isLoadingOrderTrend; // Add order trend loading
  const error =
    errorRevenue ||
    errorOrderStatus ||
    errorTopProducts ||
    errorInventory ||
    errorUserSummary ||
    errorOrderTrend; // Add order trend error

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
        Error loading dashboard data. Please check the console or try again
        later.
      </div>
    );
  }

  // Function to handle date range changes
  const handleDateChange = (dates: any, dateStrings: [string, string]) => {
    if (dates && dates.length === 2) {
      setDateRange(dates);
    } else {
      setDateRange([null, null]);
    }
  };

  // Determine the title suffix based on selected range or API response dates
  const getDateRangeSuffix = () => {
    if (dateRange && dateRange[0] && dateRange[1]) {
      return `(${dateRange[0].format("DD/MM/YYYY")} - ${dateRange[1].format(
        "DD/MM/YYYY"
      )})`;
    }
    // Use dates from one of the API responses if available and no custom range selected
    if (revenueSummary?.startDate && revenueSummary?.endDate) {
      const start = moment(revenueSummary.startDate).format("DD/MM/YYYY");
      const end = moment(revenueSummary.endDate).format("DD/MM/YYYY");
      return `(${start} - ${end})`; // Reflects API default or calculated period
    }
    return "(Last 30 Days)"; // Fallback default text
  };

  const titleSuffix = getDateRangeSuffix();

  return (
    <div className="space-y-6 pb-4">
      <div className="flex justify-between items-center">
        {" "}
        {/* Flex container for Breadcrumb and DatePicker */}
        <Breadcrumb
          items={[
            { href: "/", title: <HomeOutlined /> },
            { title: "Dashboard" },
          ]}
        />
        <Space>
          <Text>Date Range:</Text>
          <DatePicker.RangePicker
            onChange={handleDateChange}
            // Remove defaultValue to make it fully uncontrolled by React state
            disabledDate={(current) => {
              // Can not select days after today
              return current && current > moment().endOf("day");
            }}
          />
        </Space>
      </div>
      {/* Section 1: KPIs */}
      <h2 className="text-xl font-semibold text-gray-700">
        Key Metrics {titleSuffix}
      </h2>
      {/* Pass userSummary to KpiCards, remove inventorySummary */}
      <KpiCards revenueSummary={revenueSummary} userSummary={userSummary} />

      {/* Section 4: Order Trend Chart */}
      <h2 className="text-xl font-semibold text-gray-700">
        Order Creation {titleSuffix}
      </h2>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="mb-4 flex justify-end">
           <Radio.Group onChange={(e) => setGroupBy(e.target.value as 'day' | 'month' | 'year')} value={groupBy}>
              <Radio.Button value="day">By Day</Radio.Button>
              <Radio.Button value="month">By Month</Radio.Button>
              <Radio.Button value="year">By Year</Radio.Button>
           </Radio.Group>
        </div>
        <OrderTrendChart data={orderTrend} />
      </div>

      {/* Section 2: Order & Product Insights */}
      <h2 className="text-xl font-semibold text-gray-700">
        Insights {titleSuffix}
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-gray-600" /> Order Status
            Distribution
          </h3>
          <OrderStatusChart data={orderStatusStats} />
        </div>

        {/* Top Selling Products Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <ListOrdered className="w-5 h-5 mr-2 text-gray-600" /> Top 5 Selling
            Products (by Quantity)
          </h3>
          <TopSellingProductsChart data={topProducts} />
        </div>
      </div>

      {/* Section 3: User & Inventory Insights */}
      {/* Inventory title doesn't need date range */}
      <h2 className="text-xl font-semibold text-gray-700">
        User Activity & Inventory
      </h2>
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
