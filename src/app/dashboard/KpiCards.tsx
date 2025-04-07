"use client";

import {
  DollarSign,
  ShoppingCart,
  BadgeDollarSign,
  Users,
  Star,
  AlertCircle,
} from "lucide-react";
import { Spin, Alert } from 'antd'; // Import Spin and Alert
import StatCard from "./StatCard";
import { RevenueSummary, UserSummaryStats, ReviewSummaryStats } from "@/types/api";
import { formatCurrency, formatNumber } from "@/utils/utils";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";

interface KpiCardsProps {
  revenueSummary: RevenueSummary | undefined;
  userSummary: UserSummaryStats | undefined;
  reviewSummary: ReviewSummaryStats | undefined;
  isLoadingRevenue: boolean;
  isLoadingUser: boolean;
  isLoadingReview: boolean;
  errorRevenue: FetchBaseQueryError | SerializedError | undefined;
  errorUser: FetchBaseQueryError | SerializedError | undefined;
  errorReview: FetchBaseQueryError | SerializedError | undefined;
}

// Helper to render a placeholder for loading/error states within the grid cell
const renderPlaceholder = (isLoading: boolean, error: any, cardTitle: string) => {
  let content: React.ReactNode;
  if (isLoading) {
    content = <Spin size="default" />;
  } else if (error) {
    console.error(`Error loading ${cardTitle}:`, error);
    content = <Alert message="Error" type="error" showIcon icon={<AlertCircle size={16}/>} />;
  } else {
    content = <span className="text-gray-400">N/A</span>; // Should ideally not happen if data is undefined without error/loading
  }

  // Return a div structure similar to StatCard for consistent layout
  return (
    <div className="bg-white shadow-md rounded-2xl flex flex-col justify-center items-center p-4 min-h-[150px]"> {/* Adjust min-h as needed */}
      {content}
    </div>
  );
};


const KpiCards: React.FC<KpiCardsProps> = ({
  revenueSummary,
  userSummary,
  reviewSummary,
  isLoadingRevenue,
  isLoadingUser,
  isLoadingReview,
  errorRevenue,
  errorUser,
  errorReview,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Revenue Card */}
      {isLoadingRevenue || errorRevenue || !revenueSummary ? (
        renderPlaceholder(isLoadingRevenue, errorRevenue, "Total Revenue")
      ) : (
        <StatCard
          title="Total Revenue"
          primaryIcon={<DollarSign className="text-green-600 w-6 h-6" />}
          details={[{ title: "Revenue", amount: formatCurrency(revenueSummary.totalRevenue) }]}
        />
      )}

      {/* Total Orders Card */}
      {isLoadingRevenue || errorRevenue || !revenueSummary ? ( // Uses revenue data
        renderPlaceholder(isLoadingRevenue, errorRevenue, "Total Orders")
      ) : (
        <StatCard
          title="Total Orders"
          primaryIcon={<ShoppingCart className="text-blue-600 w-6 h-6" />}
          details={[{ title: "Orders", amount: formatNumber(revenueSummary.totalOrders) }]}
        />
      )}

      {/* Avg. Order Value Card */}
      {isLoadingRevenue || errorRevenue || !revenueSummary ? ( // Uses revenue data
         renderPlaceholder(isLoadingRevenue, errorRevenue, "Avg. Order Value")
      ) : (
        <StatCard
          title="Avg. Order Value"
          primaryIcon={<BadgeDollarSign className="text-purple-600 w-6 h-6" />}
          details={[{ title: "Average", amount: formatCurrency(revenueSummary.averageOrderValue) }]}
        />
      )}

      {/* Total Users Card
      {isLoadingUser || errorUser || !userSummary ? (
         renderPlaceholder(isLoadingUser, errorUser, "Total Users")
      ) : (
        <StatCard
          title="Total Users"
          primaryIcon={<Users className="text-indigo-600 w-6 h-6" />}
          details={[{ title: "Users", amount: formatNumber(userSummary.totalUsers) }]}
        />
      )} */}

      {/* Avg. Rating Card */}
      {isLoadingReview || errorReview || !reviewSummary ? (
         renderPlaceholder(isLoadingReview, errorReview, "Avg. Rating")
      ) : (
        <StatCard
          title="Avg. Rating"
          primaryIcon={<Star className="text-yellow-500 w-6 h-6" />}
          details={[{ title: "Rating", amount: reviewSummary.averageRating ? reviewSummary.averageRating.toFixed(2) : "N/A" }]}
        />
      )}
    </div>
  );
};

export default KpiCards;