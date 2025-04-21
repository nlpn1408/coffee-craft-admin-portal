"use client";

import React, { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  DatePicker,
  Space,
  Typography,
  Card,
  List,
  Avatar,
  Skeleton,
} from "antd"; // Added Card, List, Avatar, Skeleton
import { HomeOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

import {
  DollarSign,
  ShoppingCart,
  BadgeDollarSign,
  Users,
  Repeat,
  Percent,
  ListOrdered,
  Package,
  User,
} from "lucide-react"; // Updated icons
import StatCard from "./StatCard";
import OrderTrendChart from "./OrderTrendChart"; // Keep OrderTrendChart
import {
  useGetRevenueSummaryQuery,
  useGetUserSummaryStatsQuery,
  useGetOrderTrendQuery,
  useGetTopSellingProductsQuery,
  useGetRecentOrdersQuery, // Added new hook
  useGetTopCustomersQuery, // Added new hook
} from "@/state/services/dashboardService";
import { formatCurrency, formatNumber } from "@/utils/utils"; // Import formatNumber
import { TopSellingProduct } from "@/types/api"; // Import TopSellingProduct type
import { Order } from "@/types"; // Import Order type
import { renderOrderStatusTag } from "../orders/utils/renderOrderStatusTag";
const { Text, Title } = Typography; // Added Title

// Helper to check if two Dayjs dates represent the same calendar day
const isSameDay = (date1: Dayjs | null, date2: Dayjs | null): boolean => {
  if (!date1 || !date2) return false;
  return date1.isSame(date2, "day");
};

// Placeholder component for Recent Orders
const RecentOrdersList: React.FC<{
  data: Order[] | undefined;
  isLoading: boolean;
}> = ({ data, isLoading }) => {
  const router = useRouter();

  return (
    <Card title="Recent Orders" className="shadow-md rounded-2xl min-h-[300px]">
      {isLoading ? (
        <Skeleton active />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={data}
          renderItem={(item) => (
            <List.Item
              key={item.id} // Added key
              onClick={() => router.push(`/orders?id=${item.id}`)} // Added onClick for navigation
              style={{ cursor: "pointer" }} // Added cursor style
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    size={60}
                    src={item.orderItems?.[0]?.product?.images?.[0]?.url}
                  />
                } // Assuming product and image are available
                title={`Order #${item.id}`}
                description={
                  <>
                    Customer: {item.user?.name || "N/A"} | Status:{" "}
                    {renderOrderStatusTag({ status: item.status })}
                  </>
                }
              />
              <div>{formatCurrency(item.finalTotal)}</div>
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

// Placeholder component for Top Customers
const TopCustomersList: React.FC<{
  data: any[] | undefined;
  isLoading: boolean;
}> = ({ data, isLoading }) => {
  console.log("🚀 ~ data:", data);
  // Use 'any' for now, replace with actual type
  return (
    <Card title="Top Customers" className="shadow-md rounded-2xl min-h-[300px]">
      {isLoading ? (
        <Skeleton active />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={data}
          renderItem={(item) => (
            <List.Item
              key={item.userId} // Added key
            >
              <List.Item.Meta
                avatar={
                  <Avatar src={item.user?.imgUrl} icon={<UserOutlined />} />
                }
                title={item.name || item.email}
                description={`${item.orderCount} Orders`}
              />
              <div>{formatCurrency(item.totalSpent)}</div>
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

const Dashboard = () => {
  const router = useRouter(); // Initialize useRouter

  // Define initial default dates
  const initialStartDate = useMemo(() => dayjs().subtract(30, "days"), []);
  const initialEndDate = useMemo(() => dayjs(), []);

  // State for date range using Dayjs, initialized with defaults
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    initialStartDate,
    initialEndDate,
  ]);

  // Flag to track if the user has interacted with the date picker
  const hasUserSelectedDate = useRef(false);

  // Prepare query arguments based ONLY on date range state
  const queryArgs = useMemo(() => {
    if (
      !hasUserSelectedDate.current &&
      isSameDay(dateRange[0], initialStartDate) &&
      isSameDay(dateRange[1], initialEndDate)
    ) {
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

  // Fetch data for the simplified dashboard
  const {
    data: revenueSummary,
    isLoading: isLoadingRevenue,
    error: errorRevenue,
  } = useGetRevenueSummaryQuery(queryArgs);

  const {
    data: userSummary,
    isLoading: isLoadingUserSummary,
    error: errorUserSummary,
  } = useGetUserSummaryStatsQuery(queryArgs);

  const {
    data: orderTrendData, // Renamed for clarity
    isLoading: isLoadingOrderTrend,
    error: errorOrderTrend,
  } = useGetOrderTrendQuery(queryArgs);

  const {
    data: topProducts,
    isLoading: isLoadingTopProducts,
    error: errorTopProducts,
  } = useGetTopSellingProductsQuery(queryArgs);

  const {
    data: recentOrders,
    isLoading: isLoadingRecentOrders,
    error: errorRecentOrders,
  } = useGetRecentOrdersQuery({ limit: 5 }); // Fetching last 5 recent orders

  const {
    data: topCustomers,
    isLoading: isLoadingTopCustomers,
    error: errorTopCustomers,
  } = useGetTopCustomersQuery({ ...queryArgs, limit: 3 }); // Fetching top 3 customers

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
    if (queryArgs?.period === "custom") {
      return `(${dayjs(queryArgs.startDate).format("DD/MM/YYYY")} - ${dayjs(
        queryArgs.endDate
      ).format("DD/MM/YYYY")})`;
    }
    if (!queryArgs && revenueSummary?.startDate && revenueSummary?.endDate) {
      const start = dayjs(revenueSummary.startDate).format("DD/MM/YYYY");
      const end = dayjs(revenueSummary.endDate).format("DD/MM/YYYY");
      return `(${start} - ${end})`;
    }
    return "(Last 30 Days)";
  };

  const titleSuffix = getDateRangeSuffix();

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
            disabledDate={(current) =>
              current && current.isAfter(dayjs().endOf("day"))
            }
          />
        </Space>
      </div>

      {/* Row 1: KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {" "}
        {/* Adjusted grid columns */}
        {/* Total Revenue Card */}
        <StatCard
          title="Total Revenue"
          primaryIcon={<DollarSign className="text-green-600 w-6 h-6" />}
          details={[
            {
              title: "Revenue",
              amount:
                revenueSummary?.totalRevenue !== undefined
                  ? formatCurrency(revenueSummary.totalRevenue)
                  : "Loading...",
            },
          ]}
          isLoading={isLoadingRevenue}
          error={errorRevenue}
        />
        {/* New Customers Card */}
        <StatCard
          title="New Customers"
          primaryIcon={<Users className="text-indigo-600 w-6 h-6" />}
          details={[
            {
              title: "New Users",
              amount:
                userSummary?.newUsersInPeriod !== undefined
                  ? formatNumber(userSummary.newUsersInPeriod)
                  : "Loading...",
            },
          ]}
          isLoading={isLoadingUserSummary}
          error={errorUserSummary}
        />
        {/* Repeat Purchase Rate Card */}
        <StatCard
          title="Repeat Purchase Rate"
          primaryIcon={<Repeat className="text-blue-600 w-6 h-6" />}
          details={[
            {
              title: "Rate",
              amount:
                revenueSummary?.repeatPurchaseRate !== undefined
                  ? `${revenueSummary.repeatPurchaseRate.toFixed(2)}%`
                  : "Loading...",
            },
          ]}
          isLoading={isLoadingRevenue} // Assuming this comes from revenue summary
          error={errorRevenue}
        />
        {/* Avg. Order Value Card */}
        <StatCard
          title="Avg. Order Value"
          primaryIcon={<BadgeDollarSign className="text-purple-600 w-6 h-6" />}
          details={[
            {
              title: "Average",
              amount:
                revenueSummary?.averageOrderValue !== undefined
                  ? formatCurrency(revenueSummary.averageOrderValue)
                  : "Loading...",
            },
          ]}
          isLoading={isLoadingRevenue}
          error={errorRevenue}
        />
        {/* Conversion Rate Card */}
        {/* <StatCard
          title="Conversion Rate"
          primaryIcon={<Percent className="text-orange-500 w-6 h-6" />}
          details={[
            {
              title: "Rate",
              amount:
                revenueSummary?.conversionRate !== undefined
                  ? `${revenueSummary.conversionRate.toFixed(2)}%`
                  : "Loading...",
            },
          ]}
          isLoading={isLoadingRevenue} // Assuming this comes from revenue summary
          error={errorRevenue}
        /> */}
      </div>

      {/* Row 2: Summary Chart & Most Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders List (Placeholder) */}
        <RecentOrdersList
          data={recentOrders?.data}
          isLoading={isLoadingRecentOrders}
        />

        {/* Order & Income Trend Chart */}
        <Card
          title={`Summary ${titleSuffix}`}
          className="shadow-md rounded-2xl min-h-[350px]"
        >
          <OrderTrendChart
            initialStartDate={queryArgs?.startDate} // Pass initialStartDate
            initialEndDate={queryArgs?.endDate} // Pass initialEndDate
          />
        </Card>
      </div>

      {/* Row 3: Recent Orders & Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Selling Products List */}
        <Card
          title="Most Selling Products"
          className="shadow-md rounded-2xl min-h-[350px]"
        >
          {isLoadingTopProducts ? (
            <Skeleton active />
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={topProducts?.data}
              renderItem={(item: TopSellingProduct) => (
                <List.Item
                  key={item.productId}
                  onClick={() => router.push(`/products/${item.productId}`)}
                  style={{ cursor: "pointer" }}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={item.imageUrl} size={60} />} // Use item.imageUrl for product image
                    title={item.name}
                    description={`SKU: ${item.sku}`}
                  />
                  <div>{item.totalQuantitySold} Sales</div>
                </List.Item>
              )}
            />
          )}
        </Card>

        {/* Top Customers List (Placeholder) */}
        <TopCustomersList
          data={topCustomers?.data}
          isLoading={isLoadingTopCustomers}
        />
      </div>
    </div>
  );
};

export default Dashboard;
