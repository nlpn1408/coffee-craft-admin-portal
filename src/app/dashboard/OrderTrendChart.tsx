"use client";

import React, { useState, useMemo } from 'react';
import { Radio } from 'antd';
import { OrderTrendResponse, OrderTrendStat } from '@/types/api';
import { formatNumber, formatCurrency } from '@/utils/utils';
import { useGetOrderTrendQuery } from '@/state/services/dashboardService';
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
import moment from 'moment';
import { Spin, Alert } from 'antd';
import { AlertCircle } from 'lucide-react';

interface OrderTrendChartProps {
  initialStartDate?: string;
  initialEndDate?: string;
}

const OrderTrendChart = ({ initialStartDate, initialEndDate }: OrderTrendChartProps): React.ReactElement => {
  const [groupBy, setGroupBy] = useState<'day' | 'month' | 'year'>('day');

  const queryArgs = useMemo(() => {
    const args: any = { groupBy };
    if (initialStartDate && initialEndDate) {
      args.period = 'custom';
      args.startDate = initialStartDate;
      args.endDate = initialEndDate;
    }
    return args;
  }, [groupBy, initialStartDate, initialEndDate]);

  const { data, isLoading, error } = useGetOrderTrendQuery(queryArgs);

  const chartData = useMemo(() => data?.data?.map((item: OrderTrendStat) => ({
    ...item,
    revenue: item.totalRevenue ?? 0,
  })) ?? [], [data]); // Memoize chartData calculation

  const currentGroupBy = data?.groupBy ?? groupBy;

  // Calculate max revenue for domain setting
  const maxRevenue = useMemo(() => {
    if (!chartData || chartData.length === 0) return 0;
    // Add a small buffer (e.g., 10%) to the max value for better visualization
    return Math.max(...chartData.map(item => item.revenue)) * 1.1;
  }, [chartData]);


  const formatXAxis = (tickItem: string) => {
    if (currentGroupBy === 'month') {
      return moment(tickItem, 'YYYY-MM').format('MMM YYYY');
    }
    if (currentGroupBy === 'year') {
      return tickItem;
    }
    return moment(tickItem, 'YYYY-MM-DD').format('DD MMM');
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-[300px]"><Spin size="large" /></div>;
  }

  if (error) {
    console.error("Order Trend Chart Error:", error);
     return (
        <div className="flex justify-center items-center h-[300px]">
             <Alert
                message="Error Loading Chart"
                description="Could not load order trend data."
                type="error"
                showIcon
                icon={<AlertCircle size={20}/>}
            />
        </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <p className="text-gray-500 text-sm text-center py-10 h-[300px] flex items-center justify-center">
        No order trend data available for this period.
      </p>
    );
  }

  const customTooltipFormatter = (value: number, name: string, props: any) => {
    if (name === 'Orders Created') {
      return [formatNumber(value), name];
    }
    if (name === 'Total Revenue') {
       return [formatCurrency(value), name];
    }
    return [value, name];
  };


  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Radio.Group onChange={(e) => setGroupBy(e.target.value as 'day' | 'month' | 'year')} value={groupBy}>
          <Radio.Button value="day">By Day</Radio.Button>
          <Radio.Button value="month">By Month</Radio.Button>
          <Radio.Button value="year">By Year</Radio.Button>
        </Radio.Group>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
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
          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" allowDecimals={false} />
          {/* Set domain for the right YAxis */}
          <YAxis
             yAxisId="right"
             orientation="right"
             stroke="#82ca9d"
             tickFormatter={(value) => formatCurrency(value)}
             domain={[0, maxRevenue > 0 ? maxRevenue : 'auto']} // Set domain from 0 to maxRevenue (or auto if max is 0)
             allowDataOverflow={true} // Important if maxRevenue buffer is small
           />
          <Tooltip formatter={customTooltipFormatter} labelFormatter={(label: string) => formatXAxis(label)} />
          <Legend />
          <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Orders Created" />
          <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Total Revenue" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OrderTrendChart;