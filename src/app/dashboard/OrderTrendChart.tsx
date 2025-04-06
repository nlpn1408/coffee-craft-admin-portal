"use client";

import React from 'react';
import { OrderTrendResponse } from '@/types/api';
import { formatNumber } from '@/utils/utils';
import {
  BarChart, 
  Bar, 
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import moment from 'moment'; // Import moment for date formatting

interface OrderTrendChartProps {
  data: OrderTrendResponse | undefined;
}

const OrderTrendChart = ({ data }: OrderTrendChartProps): React.ReactElement | null => { // Explicit return type
  const chartData = data?.data ?? [];
  const groupBy = data?.groupBy ?? 'day'; // Default to day if not provided

  // Format date for X-axis based on groupBy
  const formatXAxis = (tickItem: string) => {
    if (groupBy === 'month') {
      return moment(tickItem, 'YYYY-MM').format('MMM YYYY');
    }
    if (groupBy === 'year') {
      return tickItem; // Already YYYY
    }
    // Default to day format
    return moment(tickItem, 'YYYY-MM-DD').format('DD MMM');
  };

  if (!chartData || chartData.length === 0) {
    return (
      <p className="text-gray-500 text-sm text-center py-10">
        No order trend data available for this period.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart // Change to BarChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 0,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tickFormatter={formatXAxis} />
        <YAxis allowDecimals={false} />
        <Tooltip
          formatter={(value: number) => [formatNumber(value), 'Orders']}
          labelFormatter={(label: string) => formatXAxis(label)}
        />
        <Legend />
        <Bar dataKey="count" fill="#8884d8" name="Orders Created" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default OrderTrendChart;