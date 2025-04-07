"use client";

import React, { useState, useMemo } from 'react';
import { Radio } from 'antd'; // For potential future controls (e.g., sortBy)
import { VoucherUsageResponse, VoucherUsageStat } from '@/types/api';
import { formatNumber, formatCurrency } from '@/utils/utils';
import { useGetVoucherUsageQuery } from '@/state/services/dashboardService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  // Legend, // Legend might be redundant for single bar
} from 'recharts';
import { Spin, Alert } from 'antd';
import { AlertCircle, TicketPercent } from 'lucide-react'; // Use voucher icon

interface VoucherUsageChartProps {
  initialStartDate?: string;
  initialEndDate?: string;
  initialLimit?: number;
}

const VoucherUsageChart: React.FC<VoucherUsageChartProps> = ({
  initialStartDate,
  initialEndDate,
  initialLimit = 5, // Default to top 5
}) => {
  // State for potential future controls like sortBy
  const [sortBy, setSortBy] = useState<'usageCount' | 'totalDiscount'>('usageCount');
  const [limit, setLimit] = useState<number>(initialLimit);

  // Prepare query arguments
  const queryArgs = useMemo(() => {
    const args: any = { limit, sortBy };
    if (initialStartDate && initialEndDate) {
      args.period = 'custom';
      args.startDate = initialStartDate;
      args.endDate = initialEndDate;
    }
    return args;
  }, [limit, sortBy, initialStartDate, initialEndDate]);

  const { data, isLoading, error } = useGetVoucherUsageQuery(queryArgs);

  // Prepare data for the Bar chart
  const chartData = useMemo(() => {
    return data?.data
      ?.map((item: VoucherUsageStat) => ({
        name: item.code, // Voucher code for YAxis
        value: item.usageCount, // Usage count for XAxis
        discount: item.totalDiscountGiven, // For tooltip
      }))
      // Already sorted by API based on sortBy, no need to sort here unless API doesn't sort
      ?? [];
  }, [data]);


  if (isLoading) {
    return <div className="flex justify-center items-center h-[250px]"><Spin size="large" /></div>;
  }

  if (error) {
    console.error("Voucher Usage Chart Error:", error);
    return (
      <div className="flex justify-center items-center h-[250px]">
        <Alert
          message="Error Loading Chart"
          description="Could not load voucher usage data."
          type="error"
          showIcon
          icon={<AlertCircle size={20}/>}
        />
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <p className="text-gray-500 text-sm text-center py-10 h-[250px] flex items-center justify-center">
        No voucher usage data available for this period.
      </p>
    );
  }

  // Custom Tooltip Formatter
  const customTooltipFormatter = (value: number, name: string, props: any) => {
     const voucherCode = props?.payload?.name ?? '';
     const discountGiven = props?.payload?.discount ?? 0;
     return [
        `${formatNumber(value)} Times Used`,
        `Total Discount: ${formatCurrency(discountGiven)}`
     ];
  };


  return (
    <div>
      {/* Add controls here later if needed (e.g., sortBy, limit) */}
      {/* <div className="mb-4 flex flex-wrap justify-end gap-4 items-center"> ... </div> */}

      <ResponsiveContainer width="100%" height={250}>
        <BarChart
            data={chartData}
            layout="vertical" // Horizontal bars
            margin={{
                top: 5,
                right: 30,
                left: 20, // Adjust left margin for Y-axis labels if needed
                bottom: 5,
            }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" allowDecimals={false} />
          <YAxis
            dataKey="name"
            type="category"
            width={100} // Adjust width based on voucher code length
            tick={{ fontSize: 10 }}
            />
          <Tooltip contentStyle={{fontSize: '12px'}} formatter={customTooltipFormatter} labelFormatter={(label: string) => `Code: ${label}`} />
          {/* <Legend /> */}
          <Bar dataKey="value" fill="#ffc658" name="Usage Count" /> {/* Example color: Amber */}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VoucherUsageChart;