import { formatCurrency, getDiscountPercent, splitPrice } from '../utils/format';

interface PriceDisplayProps {
  price: number;
  listPrice?: number;
  size?: 'sm' | 'md' | 'lg';
  showSavingsBadge?: boolean;
  align?: 'left' | 'right';
}

export function PriceDisplay({
  price,
  listPrice,
  size = 'lg',
  showSavingsBadge = false,
  align = 'left',
}: PriceDisplayProps) {
  const { whole, cents } = splitPrice(price);
  const discountPct = getDiscountPercent(price, listPrice);

  const sizeStyles = {
    sm: {
      symbol: 'text-[11px] top-[-0.35em]',
      whole: 'text-[18px] leading-[22px] font-bold',
      cents: 'text-[11px] top-[-0.35em] font-semibold',
    },
    md: {
      symbol: 'text-[12px] top-[-0.45em]',
      whole: 'text-[22px] leading-[26px] font-bold',
      cents: 'text-[12px] top-[-0.45em] font-semibold',
    },
    lg: {
      symbol: 'text-[14px] top-[-0.5em]',
      whole: 'text-[28px] leading-[32px] font-bold',
      cents: 'text-[14px] top-[-0.5em] font-semibold',
    },
  }[size];

  return (
    <div className={`flex flex-col ${align === 'right' ? 'items-end' : 'items-start'}`}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 tabular-nums">
        {showSavingsBadge && discountPct && (
          <span className="text-[14px] font-semibold text-[#CC0C39]">
            -{discountPct}%
          </span>
        )}
        <span className="inline-flex items-baseline text-[#0F1111]" aria-label={formatCurrency(price)}>
          <span className={`relative font-medium mr-[1px] ${sizeStyles.symbol}`}>₹</span>
          <span className={`tracking-tight ${sizeStyles.whole}`}>{whole}</span>
          <span className={`relative ml-[1px] ${sizeStyles.cents}`}>{cents}</span>
        </span>
      </div>
      {listPrice && listPrice > price && (
        <div className="mt-0.5 flex items-center gap-1.5 text-[12px] leading-[16px] text-[#565959] tabular-nums">
          <span>M.R.P.:</span>
          <span className="line-through">{formatCurrency(listPrice)}</span>
          {!showSavingsBadge && discountPct && (
            <span className="font-semibold text-[#CC0C39]">
              Save {formatCurrency(listPrice - price)} ({discountPct}%)
            </span>
          )}
        </div>
      )}
    </div>
  );
}
