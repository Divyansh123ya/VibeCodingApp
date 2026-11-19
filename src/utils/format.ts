export function splitPrice(amount: number): { whole: string; cents: string } {
  const fixed = Math.max(0, amount).toFixed(2);
  const [wholeRaw, cents] = fixed.split('.');
  const whole = Number(wholeRaw).toLocaleString('en-IN');
  return { whole, cents };
}

export function formatCurrency(amount: number): string {
  return `₹${Math.max(0, amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function getDiscountPercent(price: number, listPrice?: number): number | null {
  if (!listPrice || listPrice <= price) return null;
  return Math.round(((listPrice - price) / listPrice) * 100);
}

export function formatDeliveryDate(daysFromNow: number): string {
  // Base reference date: Nov 19, 2026
  const base = new Date(2026, 10, 19);
  base.setDate(base.getDate() + daysFromNow);
  const weekday = base.toLocaleDateString('en-US', { weekday: 'short' });
  const monthDay = base.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (daysFromNow === 1) {
    return `Tomorrow, ${monthDay}`;
  }
  return `${weekday}, ${monthDay}`;
}
