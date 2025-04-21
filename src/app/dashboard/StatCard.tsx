import { LucideIcon } from "lucide-react";
import React from "react";

type StatDetail = {
  title: string;
  amount: string;
  changePercentage?: number; // Make optional
  IconComponent?: LucideIcon; // Make optional
};

import { FetchBaseQueryError } from "@reduxjs/toolkit/query"; // Import FetchBaseQueryError
import { SerializedError } from "@reduxjs/toolkit"; // Import SerializedError
import { Spin, Alert } from 'antd'; // Import Spin and Alert
import { AlertCircle } from "lucide-react"; // Import AlertCircle icon


type StatCardProps = {
  title: string;
  primaryIcon: JSX.Element;
  details: StatDetail[];
  dateRange?: string; // Make optional
  isLoading?: boolean; // Added isLoading prop
  error?: FetchBaseQueryError | SerializedError | undefined; // Added error prop
};

const StatCard = ({
  title,
  primaryIcon,
  details,
  dateRange,
  isLoading = false, // Default to false
  error,
}: StatCardProps) => {
  const formatPercentage = (value: number) => {
    const signal = value >= 0 ? "+" : "";
    return `${signal}${value.toFixed()}%`;
  };

  const getChangeColor = (value: number) =>
    value >= 0 ? "text-green-500" : "text-red-500";

  let content;
  if (isLoading) {
    content = (
      <div className="flex justify-center items-center h-full">
        <Spin size="large" />
      </div>
    );
  } else if (error) {
    console.error(`Error loading ${title}:`, error);
    content = (
      <div className="flex justify-center items-center h-full">
        <Alert message="Error loading data" type="error" showIcon icon={<AlertCircle size={16}/>} />
      </div>
    );
  } else {
     content = (
       <div className="flex mb-4 mt-4 items-center justify-around gap-4 px-3">
         <div className="rounded-full p-5 bg-blue-50 border-sky-300 border-[1px]">
           {primaryIcon}
         </div>
         <div className="flex-1">
           {details.map((detail, index) => (
             <React.Fragment key={index}>
               <div className="flex items-center justify-between my-4">
                 <span className="text-gray-500">{detail.title}</span>
                 <span className="font-bold text-gray-800">{detail.amount}</span>
                 {/* Conditionally render change percentage and icon */}
                 {detail.IconComponent &&
                   detail.changePercentage !== undefined && (
                     <div className="flex items-center">
                       <detail.IconComponent
                         className={`w-4 h-4 mr-1 ${getChangeColor(
                           detail.changePercentage
                         )}`}
                       />
                       <span
                         className={`font-medium ${getChangeColor(
                           detail.changePercentage
                         )}`}
                       >
                         {formatPercentage(detail.changePercentage)}
                       </span>
                     </div>
                   )}
               </div>
               {index < details.length - 1 && <hr />}
             </React.Fragment>
           ))}
         </div>
       </div>
     );
  }


  return (
    <div className="md:row-span-1 xl:row-span-2 bg-white col-span-1 shadow-md rounded-2xl flex flex-col justify-between">
      {/* HEADER */}
      <div>
        <div className="flex justify-between items-center mb-2 px-5 pt-4">
          <h2 className="font-semibold text-lg text-gray-700">{title}</h2>
          {dateRange && <span className="text-xs text-gray-400">{dateRange}</span>}
        </div>
        <hr />
      </div>

      {/* BODY */}
      {content}
    </div>
  );
};

export default StatCard;
