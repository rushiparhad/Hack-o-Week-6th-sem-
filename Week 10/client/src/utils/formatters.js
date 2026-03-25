export function number(value) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(value || 0);
}

export function shortDate(value) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}
