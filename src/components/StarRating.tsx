import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md';
  showNumeric?: boolean;
  onClick?: () => void;
}

export function StarRating({
  rating,
  reviewCount,
  size = 'sm',
  showNumeric = true,
  onClick,
}: StarRatingProps) {
  const iconSize = size === 'sm' ? 14 : 16;
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.3 && rating - fullStars < 0.8;
  const roundedFull = rating - fullStars >= 0.8 ? fullStars + 1 : fullStars;

  const content = (
    <span className="inline-flex items-center gap-1.5">
      {showNumeric && (
        <span className="text-[13px] font-semibold text-[#0F1111] tabular-nums">
          {rating.toFixed(1)}
        </span>
      )}
      <span className="inline-flex items-center gap-[1px]" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
        {[0, 1, 2, 3, 4].map((index) => {
          const isFilled = index < roundedFull;
          const isHalf = !isFilled && hasHalf && index === fullStars;
          return (
            <span key={index} className="relative inline-flex">
              <Star
                size={iconSize}
                className={
                  isFilled
                    ? 'fill-[#FF9900] text-[#E47911]'
                    : 'fill-[#E8E8E8] text-[#B8B8B8]'
                }
                strokeWidth={1.5}
              />
              {isHalf && (
                <span className="absolute inset-0 overflow-hidden w-1/2">
                  <Star
                    size={iconSize}
                    className="fill-[#FF9900] text-[#E47911]"
                    strokeWidth={1.5}
                  />
                </span>
              )}
            </span>
          );
        })}
      </span>
      {typeof reviewCount === 'number' && (
        <span className="text-[12px] text-[#00668A] group-hover:text-[#8A5100] group-hover:underline tabular-nums">
          ({reviewCount.toLocaleString('en-US')})
        </span>
      )}
    </span>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9900] rounded-sm"
      >
        {content}
      </button>
    );
  }

  return <div className="inline-flex items-center">{content}</div>;
}
