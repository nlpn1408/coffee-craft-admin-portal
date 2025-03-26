import axios from "axios";

export const formatCurrency = (value: number | string) => {
  return Number(value).toLocaleString("it-IT", {
    style: "currency",
    currency: "VND",
  });
};

export const newRequest = axios.create({
  withCredentials: true,
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});
