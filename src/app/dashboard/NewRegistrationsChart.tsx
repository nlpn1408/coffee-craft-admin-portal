"use client";

import React, { useState, useMemo } from "react";
import { Radio } from 'antd';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { NewRegistrationsResponse } from "@/types/api";
import { formatNumber } from "@/utils/utils";
import { useGetNewRegistrationsQuery } from "@/state/services/dashboardService";
import moment from 'moment';
import { Spin, Alert } from 'antd';
import { AlertCircle } from 'lucide-react';

interface NewRegistrationsChartProps {
  // Dates passed from parent IF the parent's date picker has been used
  initialStartDate?: string; // YYYY-MM-DD
  initialEndDate?: string;   // YYYY-MM-DD
}

const NewRegistrationsChart: React.FC<NewRegistrationsChartProps> = ({ initialStartDate, initialEndDate }) => {
  const [uiGroupBy, setUiGroupBy] = useState<'day' | 'month' | 'year'>('day');

  // Prepare query arguments
  const queryArgs = useMemo(() => {
    const apiGroupBy = uiGroupBy === 'year' ? 'month' : uiGroupBy;
    const args: any = { groupBy: apiGroupBy as 'day' | 'week' | 'month' };
    // ONLY send custom date params if they are explicitly passed from the parent
    if (initialStartDate && initialEndDate) {
      args.period = 'custom';
      args.startDate = initialStartDate;
      args.endDate = initialEndDate;
    }
    // If no dates provided by parent, args will just be { groupBy },
    // letting the API use its default date range.
    return args;
  }, [uiGroupBy, initialStartDate, initialEndDate]);

  const { data, isLoading, error } = useGetNewRegistrationsQuery(queryArgs);

  const chartData = data?.data?.map(item => ({
    date: item.date,
    Registrations: item.count,
  })) ?? [];

   const formatXAxis = (tickItem: string) => {
    const apiGroupBy = data?.groupBy ?? 'day';
    if (apiGroupBy === 'month') {
      return moment(tickItem, 'YYYY-MM').format('MMM YYYY');
    }
    if (apiGroupBy === 'week') {
       const [year, week] = tickItem.split('-');
       return `Week ${week}, ${year}`;
    }
    return moment(tickItem, 'YYYY-MM-DD').format('DD MMM');
  };


  if (isLoading) {
    return <div className="flex justify-center items-center h-[300px]"><Spin size="large" /></div>;
  }

  if (error) {
    console.error("New Registrations Chart Error:", error);
     return (
        <div className="flex justify-center items-center h-[300px]">
             <Alert
                message="Error Loading Chart"
                description="Could not load registration data."
                type="error"
                showIcon
                icon={<AlertCircle size={20}/>}
            />
        </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return <div className="text-center text-gray-500 py-4 h-[300px] flex items-center justify-center">No registration data available for the selected period.</div>;
  }

  return (
    <div>
       <div className="mb-4 flex justify-end">
        <Radio.Group onChange={(e) => setUiGroupBy(e.target.value as 'day' | 'month' | 'year')} value={uiGroupBy}>
          <Radio.Button value="day">By Day</Radio.Button>
          <Radio.Button value="month">By Month</Radio.Button>
          <Radio.Button value="year">By Year</Radio.Button>
        </Radio.Group>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
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
             formatter={(value: number) => [formatNumber(value), 'Registrations']}
             labelFormatter={(label: string) => formatXAxis(label)}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="Registrations"
            stroke="#82ca9d" // Reverted back to original green/teal
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NewRegistrationsChart;