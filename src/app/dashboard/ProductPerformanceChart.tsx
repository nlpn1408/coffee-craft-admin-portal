"use client";

import React, { useState, useMemo } from 'react';
import { Radio } from 'antd';
import { ProductPerformanceResponse, ProductPerformanceStat } from '@/types/api';
import { formatNumber, formatCurrency } from '@/utils/utils';
import { useGetProductPerformanceQuery } from '@/state/services/dashboardService';
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
import { Spin, Alert } from 'antd';
import { AlertCircle } from 'lucide-react';

interface ProductPerformanceChartProps {
  initialStartDate?: string;
  initialEndDate?: string;
}

const ProductPerformanceChart: React.FC<ProductPerformanceChartProps> = ({ initialStartDate, initialEndDate }) => {
  const [groupBy, setGroupBy] = useState<'category' | 'brand'>('category');

  const queryArgs = useMemo(() => {
    const args: any = { groupBy };
    if (initialStartDate && initialEndDate) {
      args.period = 'custom';
      args.startDate = initialStartDate;
      args.endDate = initialEndDate;
    }
    return args;
  }, [groupBy, initialStartDate, initialEndDate]);

  const { data, isLoading, error } = useGetProductPerformanceQuery(queryArgs);

  const chartData = useMemo(() => {
    return data?.data
      ?.map((item: ProductPerformanceStat) => ({
        name: item.name,
        quantity: item.totalQuantitySold,
        revenue: item.totalRevenue,
      }))
      ?.filter(item => item.quantity > 0 || item.revenue > 0)
      ?.sort((a, b) => b.quantity - a.quantity) ?? [];
  }, [data]);

   const maxQuantity = useMemo(() => {
    if (!chartData || chartData.length === 0) return 0;
    return Math.max(...chartData.map(item => item.quantity)) * 1.1;
  }, [chartData]);

  const maxRevenue = useMemo(() => {
    if (!chartData || chartData.length === 0) return 0;
    return Math.max(...chartData.map(item => item.revenue)) * 1.1;
  }, [chartData]);

  const customTooltipFormatter = (value: number, name: string, props: any) => {
    const categoryName = props?.payload?.name ?? '';
    if (name === 'Quantity Sold') {
      return [formatNumber(value), `${categoryName} - ${name}`];
    }
    if (name === 'Total Revenue') {
       return [formatCurrency(value), `${categoryName} - ${name}`];
    }
    return [value, name];
  };

  // Function to render the chart area (chart or placeholder messages)
  const renderChartArea = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-[250px]"><Spin size="large" /></div>;
    }

    if (error) {
      console.error("Product Performance Chart Error:", error);
      return (
        <div className="flex justify-center items-center h-[250px]">
          <Alert
            message="Error Loading Chart"
            description="Could not load product performance data."
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
          No performance data available for this period/grouping.
        </p>
      );
    }

    // Render the actual chart if data is available
    return (
       <ResponsiveContainer width="100%" height={250}>
        <BarChart
            data={chartData}
            margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
            }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={50} />
          <YAxis
            yAxisId="left"
            orientation="left"
            stroke="#8884d8"
            tickFormatter={(value) => formatNumber(value)}
            allowDecimals={false}
            domain={[0, maxQuantity > 0 ? maxQuantity : 'auto']}
            allowDataOverflow={true}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#82ca9d"
            tickFormatter={(value) => formatCurrency(value)}
            domain={[0, maxRevenue > 0 ? maxRevenue : 'auto']}
            allowDataOverflow={true}
          />
          <Tooltip formatter={customTooltipFormatter} />
          <Legend />
          <Bar yAxisId="left" dataKey="quantity" fill="#8884d8" name="Quantity Sold" />
          <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Total Revenue" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div>
      {/* Controls - Rendered unconditionally */}
      <div className="mb-4 flex flex-wrap justify-end gap-4 items-center">
         {/* Changed to individual Radio.Button */}
         <Radio.Group
            onChange={(e) => setGroupBy(e.target.value)}
            value={groupBy}
            // optionType="button"   // REMOVE this prop
            // buttonStyle="solid"
            // size="small" // REMOVE size prop
         >
            <Radio.Button value="category">By Category</Radio.Button>
            <Radio.Button value="brand">By Brand</Radio.Button>
         </Radio.Group>
      </div>

      {/* Chart Area - Rendered conditionally */}
      {renderChartArea()}
    </div>
  );
};

export default ProductPerformanceChart;