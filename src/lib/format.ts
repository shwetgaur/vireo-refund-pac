export function inr(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function lakh(n: number, digits = 1): string {
  return `Rs ${(n / 100_000).toFixed(digits)} lakh`;
}

export function crore(n: number, digits = 1): string {
  return `Rs ${(n / 10_000_000).toFixed(digits)} crore`;
}

export function pct(n: number): string {
  return `${(n * 100).toFixed(0)}%`;
}

export function monthLabel(ym: string): string {
  const [y, m] = ym.split("-");
  const names = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${names[Number(m) - 1]} ${y.slice(2)}`;
}
