export const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

export const formatDateRange = (startDate?: string, endDate?: string) => {
  if (!startDate && !endDate) return "Dates pending";

  const formatter = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });
  const start = startDate ? formatter.format(new Date(startDate)) : undefined;
  const end = endDate ? formatter.format(new Date(endDate)) : undefined;

  if (start && end) return `${start} - ${end}`;
  return start ?? end ?? "Dates pending";
};

export const formatMoney = (amount?: number, currency = "USD") => {
  if (amount === undefined || Number.isNaN(amount)) return "TBD";

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount);
};
