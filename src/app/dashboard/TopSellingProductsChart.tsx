"use client";

import { TopSellingProductsResponse } from "@/types/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatNumber } from "@/utils/utils";

interface TopSellingProductsChartProps {
  data: TopSellingProductsResponse | undefined;
}

const TopSellingProductsChart: React.FC<TopSellingProductsChartProps> = ({
  data,
}) => {
  // Prepare data for Recharts BarChart
  const chartData =
    data?.data?.map((product) => ({
      name: String(product?.name ?? "Unknown Product"), // Ensure name is string
      value: product.totalQuantitySold,
    })) ?? [];

  if (!chartData || chartData.length === 0) {
    return (
      <p className="text-gray-500 text-sm text-center py-10">
        No top selling product data available.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis
          dataKey="name"
          type="category"
          width={150}
          tick={{ fontSize: 10 }}
        />
        <Tooltip formatter={(value: number, name: string) => [`${formatNumber(value)} Sold`, name]} />
        <Bar dataKey="value" fill="#8884d8" name="Quantity Sold" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TopSellingProductsChart;