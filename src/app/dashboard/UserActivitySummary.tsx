"use client";

import { UserSummaryStats } from "@/types/api";
import { formatNumber } from "@/utils/utils";
import { Users, UserPlus } from "lucide-react";

interface UserActivitySummaryProps {
  data: UserSummaryStats | undefined;
}

const UserActivitySummary: React.FC<UserActivitySummaryProps> = ({ data }) => {
  const formatDate = (isoString: string | undefined) => {
    if (!isoString) return "N/A";
    try {
      // Simple date formatting, consider using date-fns for more complex needs
      return new Date(isoString).toLocaleDateString('en-CA'); // YYYY-MM-DD format
    } catch (e) {
      return "Invalid Date";
    }
  };

  const periodStartDate = formatDate(data?.startDate);
  const periodEndDate = formatDate(data?.endDate);
  const periodLabel = data?.startDate && data?.endDate ? `(${periodStartDate} - ${periodEndDate})` : '(Last 30 Days)';

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-3 flex items-center">
        <Users className="w-5 h-5 mr-2 text-gray-600" /> User Activity
      </h3>
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
    </div>
  );
};

export default UserActivitySummary;