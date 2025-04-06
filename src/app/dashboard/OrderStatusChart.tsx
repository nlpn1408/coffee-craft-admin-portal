"use client";

import { OrderStatus } from "@/types";
import { OrderStatusStatsResponse } from "@/types/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatNumber } from "@/utils/utils";

// Map OrderStatus enum to display names and colors
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
}

const OrderStatusChart: React.FC<OrderStatusChartProps> = ({ data }) => {
  // Prepare data for Recharts PieChart
  const chartData =
    data?.data
      ?.filter((stat) => stat.orderCount > 0)
      .map((stat) => ({
        name: orderStatusDisplay[stat.status]?.name ?? stat.status,
        value: stat.orderCount,
        fill: orderStatusDisplay[stat.status]?.hexColor ?? "#cccccc",
      })) ?? [];

  if (!chartData || chartData.length === 0) {
    return (
      <p className="text-gray-500 text-sm text-center py-10">
        No order status data available for this period.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number, name: string) => [`${formatNumber(value)} Orders`, name]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default OrderStatusChart;