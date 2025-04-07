"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Breadcrumb, DatePicker, Space, Typography } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

import { Activity, ListOrdered, TicketPercent, BarChart3 } from "lucide-react"; // Added BarChart3
import KpiCards from "./KpiCards";
import OrderStatusChart from "./OrderStatusChart";
import TopSellingProductsChart from "./TopSellingProductsChart";
import LowStockList from "./LowStockList";
import UserActivitySummary from "./UserActivitySummary";
import OrderTrendChart from "./OrderTrendChart";
import NewRegistrationsChart from "./NewRegistrationsChart";
import ProductPerformanceChart from "./ProductPerformanceChart";
import VoucherUsageChart from "./VoucherUsageChart";
import {
  useGetRevenueSummaryQuery,
  useGetOrderStatusStatsQuery,
  useGetTopSellingProductsQuery,
  useGetProductInventorySummaryQuery,
  useGetUserSummaryStatsQuery,
  useGetReviewSummaryQuery,
} from "@/state/services/dashboardService";
const { Text } = Typography;

// Helper to check if two Dayjs dates represent the same calendar day
const isSameDay = (date1: Dayjs | null, date2: Dayjs | null): boolean => {
    if (!date1 || !date2) return false;
    return date1.isSame(date2, 'day');
}

const Dashboard = () => {
  // Define initial default dates
  const initialStartDate = useMemo(() => dayjs().subtract(30, "days"), []);
  const initialEndDate = useMemo(() => dayjs(), []);

  // State for date range using Dayjs, initialized with defaults
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null]
  >([initialStartDate, initialEndDate]);

  // Flag to track if the user has interacted with the date picker
  const hasUserSelectedDate = useRef(false);

  // Prepare query arguments based ONLY on date range state
  const queryArgs = useMemo(() => {
    if (!hasUserSelectedDate.current &&
        isSameDay(dateRange[0], initialStartDate) &&
        isSameDay(dateRange[1], initialEndDate)) {
      return undefined; // Let API use its default
    }
    if (dateRange && dateRange[0] && dateRange[1]) {
      return {
        period: "custom" as const,
        startDate: dateRange[0].format("YYYY-MM-DD"),
        endDate: dateRange[1].format("YYYY-MM-DD"),
      };
    }
    return undefined;
  }, [dateRange, initialStartDate, initialEndDate]);

  // Fetch data for components managed by this page
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
  } = useGetTopSellingProductsQuery(queryArgs);
  const {
    data: inventorySummary,
    isLoading: isLoadingInventory,
    error: errorInventory,
  } = useGetProductInventorySummaryQuery();
  const {
    data: userSummary,
    isLoading: isLoadingUserSummary,
    error: errorUserSummary,
  } = useGetUserSummaryStatsQuery(queryArgs);
  const {
    data: reviewSummary,
    isLoading: isLoadingReviewSummary,
    error: errorReviewSummary,
  } = useGetReviewSummaryQuery(queryArgs);

  // Combined loading state
  const isLoading =
    isLoadingRevenue ||
    isLoadingOrderStatus ||
    isLoadingTopProducts ||
    isLoadingInventory ||
    isLoadingUserSummary ||
    isLoadingReviewSummary;

  // Combined error state
  const error =
    errorRevenue ||
    errorOrderStatus ||
    errorTopProducts ||
    errorInventory ||
    errorUserSummary ||
    errorReviewSummary;

  // Function to handle date range changes
  const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    hasUserSelectedDate.current = true;
    if (dates) {
      setDateRange(dates);
    } else {
      setDateRange([null, null]);
    }
  };

  // Determine the title suffix
  const getDateRangeSuffix = () => {
     if (queryArgs?.period === 'custom') {
         return `(${dayjs(queryArgs.startDate).format("DD/MM/YYYY")} - ${dayjs(queryArgs.endDate).format("DD/MM/YYYY")})`;
     }
     if (!queryArgs && revenueSummary?.startDate && revenueSummary?.endDate) {
         const start = dayjs(revenueSummary.startDate).format("DD/MM/YYYY");
         const end = dayjs(revenueSummary.endDate).format("DD/MM/YYYY");
         return `(${start} - ${end})`;
     }
     return "(Last 30 Days)";
  };


  const titleSuffix = getDateRangeSuffix();
  const sharedStartDate = queryArgs?.startDate;
  const sharedEndDate = queryArgs?.endDate;

  return (
    <div className="space-y-6 pb-4">
      <div className="flex justify-between items-center">
        <Breadcrumb
          items={[
            { href: "/", title: <HomeOutlined /> },
            { title: "Dashboard" },
          ]}
        />
        <Space>
          <Text>Date Range:</Text>
          <DatePicker.RangePicker
            value={dateRange}
            onChange={handleDateChange}
            disabledDate={(current) => current && current.isAfter(dayjs().endOf("day"))}
          />
        </Space>
      </div>
      {/* Section 1: KPIs */}
      <h2 className="text-xl font-semibold text-gray-700">
        Key Metrics {titleSuffix}
      </h2>
      <KpiCards
        revenueSummary={revenueSummary}
        userSummary={userSummary}
        reviewSummary={reviewSummary}
        isLoadingRevenue={isLoadingRevenue}
        isLoadingUser={isLoadingUserSummary}
        isLoadingReview={isLoadingReviewSummary}
        errorRevenue={errorRevenue}
        errorUser={errorUserSummary}
        errorReview={errorReviewSummary}
      />

      {/* Section 2: Trends & Insights */}
      <h2 className="text-xl font-semibold text-gray-700">
        Trends & Insights {titleSuffix}
      </h2>
      {/* First Grid: Status, Performance, Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"> {/* Added mb-6 */}
        {/* Order Status Distribution Chart */}
        <div className="bg-white p-4 rounded-lg shadow min-h-[300px]">
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-gray-600" /> Order Status Distribution
          </h3>
          <OrderStatusChart
            data={orderStatusStats}
            isLoading={isLoadingOrderStatus}
            error={errorOrderStatus}
          />
        </div>

         {/* Product Performance Chart (Moved Up) */}
        <div className="bg-white p-4 rounded-lg shadow min-h-[350px]">
          <h3 className="text-lg font-medium mb-3 flex items-center">
             <BarChart3 className="w-5 h-5 mr-2 text-cyan-600" /> Product Performance {/* Added Icon */}
          </h3>
          <ProductPerformanceChart initialStartDate={sharedStartDate} initialEndDate={sharedEndDate} />
        </div>

        {/* Order Creation Trend Chart */}
        <div className="bg-white p-4 rounded-lg shadow min-h-[300px]">
          <h3 className="text-lg font-medium mb-3">Order Creation Trend</h3>
          <OrderTrendChart initialStartDate={sharedStartDate} initialEndDate={sharedEndDate} />
        </div>

        {/* New User Registrations Trend Chart */}
        <div className="bg-white p-4 rounded-lg shadow min-h-[300px]">
          <h3 className="text-lg font-medium mb-3">New User Registrations Trend</h3>
          <NewRegistrationsChart initialStartDate={sharedStartDate} initialEndDate={sharedEndDate} />
        </div>
      </div>

      {/* Second Grid: Top Products & Vouchers */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Top Selling Products Chart (Moved Down) */}
        <div className="bg-white p-4 rounded-lg shadow min-h-[300px]">
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <ListOrdered className="w-5 h-5 mr-2 text-gray-600" /> Top 5 Selling Products (by Quantity)
          </h3>
          <TopSellingProductsChart
            data={topProducts}
            isLoading={isLoadingTopProducts}
            error={errorTopProducts}
           />
        </div>

         {/* Voucher Usage Chart (Moved Here) */}
        <div className="bg-white p-4 rounded-lg shadow min-h-[300px]">
          <h3 className="text-lg font-medium mb-3 flex items-center">
             <TicketPercent className="w-5 h-5 mr-2 text-orange-500" /> Top 5 Voucher Usage
          </h3>
          <VoucherUsageChart initialStartDate={sharedStartDate} initialEndDate={sharedEndDate} />
        </div>
      </div>


      {/* Section 3: User & Inventory */}
      <h2 className="text-xl font-semibold text-gray-700">
        User & Inventory {/* Updated Title */}
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"> {/* Changed to 2 cols */}
        {/* User Activity Summary */}
        <UserActivitySummary
          data={userSummary}
          isLoading={isLoadingUserSummary}
          error={errorUserSummary}
        />

        {/* Inventory Overview */}
        <LowStockList
          data={inventorySummary}
          isLoading={isLoadingInventory}
          error={errorInventory}
        />
      </div>

    </div>
  );
};

export default Dashboard;
