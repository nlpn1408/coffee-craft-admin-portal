"use client";

import { UserSummaryStats } from "@/types/api";
import { formatNumber } from "@/utils/utils";
import { Users, UserPlus, AlertCircle } from "lucide-react";
import { Spin, Alert } from 'antd'; // Import Spin and Alert
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";

interface UserActivitySummaryProps {
  data: UserSummaryStats | undefined;
  isLoading: boolean; // Add isLoading prop
  error: FetchBaseQueryError | SerializedError | undefined; // Add error prop
}

const UserActivitySummary: React.FC<UserActivitySummaryProps> = ({ data, isLoading, error }) => {
  const formatDate = (isoString: string | undefined) => {
    if (!isoString) return "N/A";
    try {
      return new Date(isoString).toLocaleDateString('en-CA'); // YYYY-MM-DD format
    } catch (e) {
      return "Invalid Date";
    }
  };

  const periodStartDate = formatDate(data?.startDate);
  const periodEndDate = formatDate(data?.endDate);
  const periodLabel = data?.startDate && data?.endDate ? `(${periodStartDate} - ${periodEndDate})` : '(Last 30 Days)';

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-[100px]"><Spin size="default" /></div>; // Adjust height as needed
    }

    if (error) {
      console.error("User Activity Summary Error:", error);
      return (
          <div className="flex justify-center items-center h-[100px]">
               <Alert
                  message="Error Loading Data"
                  type="error"
                  showIcon
                  icon={<AlertCircle size={16}/>}
              />
          </div>
      );
    }

     if (!data) {
        return <div className="text-center text-gray-500 py-4 h-[100px]">No user data available.</div>;
     }

    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">New Users {periodLabel}</span>
          <span className="font-medium text-gray-800">
            {formatNumber(data?.newUsersInPeriod)}
          </span>
        </div>
         <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Active Users (Recent)</span>
           <span className="font-medium text-gray-800">
            {formatNumber(data?.activeUsers)}
          </span>
        </div>
         {/* Optionally display total users if needed */}
         {/* <div className="flex justify-between items-center text-sm border-t pt-2 mt-2">
           <span className="text-gray-500">Total Registered Users</span>
           <span className="font-semibold text-gray-900">
             {formatNumber(data?.totalUsers)}
           </span>
         </div> */}
      </div>
    );
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow min-h-[150px]"> {/* Added min-h */}
      <h3 className="text-lg font-medium mb-3 flex items-center">
        <Users className="w-5 h-5 mr-2 text-gray-600" /> User Activity
      </h3>
      {renderContent()}
    </div>
  );
};

export default UserActivitySummary;