import { useState } from 'react';
import { Package } from 'lucide-react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
}

export function ProductImage({
  src,
  alt,
  className = '',
  containerClassName = '',
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#F3F3F4] text-[#565959] p-4 ${containerClassName}`}
        role="img"
        aria-label={alt}
      >
        <Package className="w-10 h-10 mb-2 text-[#888C8C]" strokeWidth={1.5} />
        <span className="text-[12px] font-medium text-center line-clamp-2 max-w-[180px]">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden bg-[#FFFFFF] ${containerClassName}`}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`w-full h-full object-cover ${className}`}
      />
    </div>
  );
}
