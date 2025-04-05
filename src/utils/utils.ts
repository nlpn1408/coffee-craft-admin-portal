import axios from "axios";

export const formatCurrency = (value: number | string | null | undefined): string => {
  // Handle null/undefined cases explicitly
  if (value === null || value === undefined || value === "") {
    return "N/A"; // Or return '0 VND' or '' depending on desired display
  }
  // Attempt conversion and formatting for valid numbers/strings
  const numericValue = Number(value);
  if (isNaN(numericValue)) {
     return "N/A"; // Handle cases where conversion results in NaN
  }
  return numericValue.toLocaleString("it-IT", { // Use vi-VN locale as before? Or it-IT? Let's stick to it-IT as per original file.
    style: "currency",
    currency: "VND",
  });
};

// Helper function to format numbers
export const formatNumber = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return "N/A";
  // Use a locale appropriate for number formatting (e.g., en-US or vi-VN)
  return value.toLocaleString("en-US");
};

export const newRequest = axios.create({
  withCredentials: true,
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});
