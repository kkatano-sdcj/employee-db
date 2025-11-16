const currencyFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

export const formatCurrency = (value?: number | null) => {
  if (value === undefined || value === null) return "-";
  return currencyFormatter.format(value);
};

export const formatDateLabel = (value?: string | null) => value ?? "-";
