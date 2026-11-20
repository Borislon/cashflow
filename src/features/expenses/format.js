export function formatMoney(amount) {
  const value = Number(amount);
  if (Number.isNaN(value)) return "—";
  return `${value.toFixed(2)} лв.`;
}

export function formatDate(isoDate) {
  if (!isoDate) return "—";
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year}`;
}

export function todayISODate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
