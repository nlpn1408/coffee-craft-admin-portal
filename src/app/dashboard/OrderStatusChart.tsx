"use client";

import { OrderStatus } from "@/types";
import { OrderStatusStatsResponse, OrderStatusStat } from "@/types/api"; // Import OrderStatusStat
import { Spin, Alert } from 'antd';
import { AlertCircle } from 'lucide-react';
import {
  BarChart, // Changed from PieChart
  Bar,      // Changed from Pie
  XAxis,    // Added
  YAxis,    // Added
  CartesianGrid, // Added
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatNumber, formatCurrency } from "@/utils/utils"; // Import formatCurrency
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";

// Map OrderStatus enum to display names and colors (color used for bars now)
const orderStatusDisplay: Record<
  OrderStatus,
  { name: string; color: string; hexColor?: string }
> = {
  [OrderStatus.PENDING]: { name: "Pending", color: "text-yellow-600", hexColor: "#ca8a04" },
  [OrderStatus.CONFIRMED]: { name: "Confirmed", color: "text-blue-600", hexColor: "#2563eb" },
  [OrderStatus.SHIPPED]: { name: "Shipping", color: "text-purple-600", hexColor: "#9333ea" },
  [OrderStatus.DELIVERED]: { name: "Delivered", color: "text-green-600", hexColor: "#16a34a" },
  [OrderStatus.CANCELED]: { name: "Canceled", color: "text-red-600", hexColor: "#dc2626" },
};

interface OrderStatusChartProps {
  data: OrderStatusStatsResponse | undefined;
  isLoading: boolean;
  error: FetchBaseQueryError | SerializedError | undefined;
}

const OrderStatusChart: React.FC<OrderStatusChartProps> = ({ data, isLoading, error }) => {

  if (isLoading) {
    return <div className="flex justify-center items-center h-[250px]"><Spin size="large" /></div>;
  }

  if (error) {
    console.error("Order Status Chart Error:", error);
    return (
        <div className="flex justify-center items-center h-[250px]">
             <Alert
                message="Error Loading Chart"
                description="Could not load order status data."
                type="error"
                showIcon
                icon={<AlertCircle size={20}/>}
            />
        </div>
    );
  }

  // Prepare data for Recharts BarChart
  const chartData =
    data?.data
      // ?.filter((stat) => stat.orderCount > 0 || stat.totalValue > 0) // Keep statuses even if count/value is 0? Optional.
      ?.map((stat: OrderStatusStat) => ({
        name: orderStatusDisplay[stat.status]?.name ?? stat.status,
        count: stat.orderCount,
        value: stat.totalValue,
        // We might not need fill here if we assign colors per bar
      })) ?? [];

  if (!chartData || chartData.length === 0) {
    return (
      <p className="text-gray-500 text-sm text-center py-10 h-[250px] flex items-center justify-center">
        No order status data available for this period.
      </p>
    );
  }

  // Custom Tooltip Formatter
  const customTooltipFormatter = (value: number, name: string, props: any) => {
    if (name === 'Order Count') {
      return [formatNumber(value), name];
    }
    if (name === 'Total Value') {
       return [formatCurrency(value), name];
    }
    return [value, name];
  };

  return (
    // Using BarChart now
    <ResponsiveContainer width="100%" height={250}>
      <BarChart
        data={chartData}
        margin={{
            top: 5,
            right: 30, // Margin for right YAxis labels
            left: 0,
            bottom: 5,
          }}
        >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        {/* Left YAxis for Count */}
        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" allowDecimals={false} />
        {/* Right YAxis for Value */}
        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tickFormatter={(value) => formatCurrency(value)} />
        <Tooltip formatter={customTooltipFormatter} />
        <Legend />
        {/* Define two bars */}
        <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Order Count" />
        <Bar yAxisId="right" dataKey="value" fill="#82ca9d" name="Total Value" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default OrderStatusChart;