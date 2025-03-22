export const formatCurrency = (value: number | string) => {
  return Number(value).toLocaleString("it-IT", { style: "currency", currency: "VND" });
};
