"use client";

import { TopSellingProductsResponse } from "@/types/api";
import { Spin, Alert } from 'antd'; // Import Spin and Alert
import { AlertCircle } from 'lucide-react'; // For error icon
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
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";

interface TopSellingProductsChartProps {
  data: TopSellingProductsResponse | undefined;
  isLoading: boolean; // Add isLoading prop
  error: FetchBaseQueryError | SerializedError | undefined; // Add error prop
}

const TopSellingProductsChart: React.FC<TopSellingProductsChartProps> = ({
  data,
  isLoading,
  error,
}) => {

  if (isLoading) {
    return <div className="flex justify-center items-center h-[250px]"><Spin size="large" /></div>;
  }

  if (error) {
    console.error("Top Selling Products Chart Error:", error);
     return (
        <div className="flex justify-center items-center h-[250px]">
             <Alert
                message="Error Loading Chart"
                description="Could not load top selling products."
                type="error"
                showIcon
                icon={<AlertCircle size={20}/>}
            />
        </div>
    );
  }

  // Prepare data for Recharts BarChart
  const chartData =
    data?.data?.map((product) => ({
      name: String(product?.name ?? "Unknown Product"), // Ensure name is string
      value: product.totalQuantitySold,
    })) ?? [];

  if (!chartData || chartData.length === 0) {
    return (
      <p className="text-gray-500 text-sm text-center py-10 h-[250px] flex items-center justify-center">
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
        {/* Removed Legend as it's less useful for single bar */}
        <Bar dataKey="value" fill="#82ca9d" name="Quantity Sold" /> {/* Reverted back to original green/teal */}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TopSellingProductsChart;