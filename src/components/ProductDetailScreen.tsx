import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  Zap,
  ShieldCheck,
  Lock,
  Bookmark,
  Check,
  ThumbsUp,
  ZoomIn,
  X,
  RotateCcw,
  Star,
  Bell,
  BellRing,
  Share2,
} from 'lucide-react';
import { DeliveryLocation, Department, PriceAlert, Product, ProductReview } from '../types';
import { formatCurrency, formatDeliveryDate, getDiscountPercent } from '../utils/format';
import { PriceDisplay } from './PriceDisplay';
import { ProductImage } from './ProductImage';
import { StarRating } from './StarRating';
import { PriceAlertModal } from './PriceAlertModal';

interface ProductDetailScreenProps {
  product: Product;
  relatedProducts: Product[];
  location: DeliveryLocation;
  isSaved: boolean;
  priceAlerts: PriceAlert[];
  defaultAlertEmail: string;
  initialVariantId?: string;
  onBackToCatalog: (dept?: Department) => void;
  onSelectProduct: (productId: string) => void;
  onAddToCart: (productId: string, variantId: string, quantity: number) => void;
  onBuyNow: (productId: string, variantId: string, quantity: number) => void;
  onToggleSave: (productId: string) => void;
  onSavePriceAlert: (data: {
    productId: string;
    variantId: string;
    variantLabel: string;
    email: string;
    targetPrice: number;
    currentPriceAtCreation: number;
  }) => void;
  onRemovePriceAlert: (alertId: string) => void;
  onAddReview: (productId: string, review: Omit<ProductReview, 'id' | 'date' | 'helpfulCount'>) => void;
  onVoteHelpful: (productId: string, reviewId: string) => void;
  onNotify?: (message: string) => void;
}

export function ProductDetailScreen({
  product,
  relatedProducts,
  location,
  isSaved,
  priceAlerts,
  defaultAlertEmail,
  initialVariantId,
  onBackToCatalog,
  onSelectProduct,
  onAddToCart,
  onBuyNow,
  onToggleSave,
  onSavePriceAlert,
  onRemovePriceAlert,
  onAddReview,
  onVoteHelpful,
  onNotify,
}: ProductDetailScreenProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(
    initialVariantId && product.variants.some((v) => v.id === initialVariantId)
      ? initialVariantId
      : product.variants[0].id
  );
  const [quantity, setQuantity] = useState(1);
  const [addedBanner, setAddedBanner] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [priceAlertOpen, setPriceAlertOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'shared' | 'copied'>('idle');
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [votedIds, setVotedIds] = useState<string[]>([]);

  // Write Review State
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    setSelectedVariantId(
      initialVariantId && product.variants.some((v) => v.id === initialVariantId)
        ? initialVariantId
        : product.variants[0].id
    );
    setQuantity(1);
    setAddedBanner(false);
    setShareStatus('idle');
    setStarFilter(null);
    setReviewFormOpen(false);
    setReviewSubmitted(false);
  }, [product.id, product.variants, initialVariantId]);

  const activeVariant =
    product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0];

  const effectivePrice = product.price + activeVariant.priceDelta;
  const effectiveListPrice = product.listPrice
    ? product.listPrice + activeVariant.priceDelta
    : undefined;
  const discountPct = getDiscountPercent(effectivePrice, effectiveListPrice);
  const activeSku = `${product.sku}-${activeVariant.skuSuffix}`;

  const activePriceAlert = priceAlerts.find(
    (a) => a.productId === product.id && a.variantId === activeVariant.id
  );

  const handleAdd = () => {
    onAddToCart(product.id, activeVariant.id, quantity);
    setAddedBanner(true);
    window.setTimeout(() => setAddedBanner(false), 2200);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?product=${encodeURIComponent(
      product.id
    )}&variant=${encodeURIComponent(activeVariant.id)}`;
    const shareData = {
      title: `${product.shortTitle} | Meridian Direct`,
      text: `${product.shortTitle} (${activeVariant.label}) — ${formatCurrency(effectivePrice)} on Meridian Direct`,
      url: shareUrl,
    };

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData);
        setShareStatus('shared');
        onNotify?.('Product link shared');
        window.setTimeout(() => setShareStatus('idle'), 2200);
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        // Fall through to clipboard copy if Web Share is blocked or unavailable
      }
    }

    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement('textarea');
        input.value = shareUrl;
        input.setAttribute('readonly', '');
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setShareStatus('copied');
      onNotify?.('Product link copied to clipboard');
      window.setTimeout(() => setShareStatus('idle'), 2200);
    } catch {
      onNotify?.('Unable to share link in this browser');
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewTitle.trim() || !reviewBody.trim()) return;
    onAddReview(product.id, {
      author: reviewAuthor.trim(),
      rating: reviewRating,
      title: reviewTitle.trim(),
      body: reviewBody.trim(),
      verified: true,
      variantPurchased: activeVariant.label,
    });
    setReviewAuthor('');
    setReviewTitle('');
    setReviewBody('');
    setReviewRating(5);
    setReviewFormOpen(false);
    setReviewSubmitted(true);
  };

  // Compute realistic star breakdown anchored to product.rating
  const starDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const matchingReviews = product.reviews.filter((r) => r.rating === stars).length;
    const baseWeights: Record<number, number> =
      product.rating >= 4.8
        ? { 5: 84, 4: 11, 3: 3, 2: 1, 1: 1 }
        : product.rating >= 4.7
        ? { 5: 78, 4: 14, 3: 5, 2: 2, 1: 1 }
        : { 5: 72, 4: 16, 3: 7, 2: 3, 1: 2 };
    return {
      stars,
      percent: baseWeights[stars],
      localCount: matchingReviews,
    };
  });

  const displayedReviews = starFilter
    ? product.reviews.filter((r) => r.rating === starFilter)
    : product.reviews;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-4 pb-10 space-y-6">
      {/* Breadcrumb Navigation & Share Action */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[12px] text-[#565959]">
          <button
            type="button"
            onClick={() => onBackToCatalog('All Products')}
            className="hover:text-[#8A5100] hover:underline"
          >
            All Products
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <button
            type="button"
            onClick={() => onBackToCatalog(product.department)}
            className="hover:text-[#8A5100] hover:underline"
          >
            {product.department}
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#0F1111] font-medium truncate max-w-[360px]">
            {product.shortTitle}
          </span>
        </nav>

        <button
          type="button"
          onClick={handleShare}
          aria-label={`Share ${product.shortTitle}`}
          className="rt-btn-secondary px-3 py-1.5 text-[12px] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
        >
          {shareStatus === 'idle' ? (
            <>
              <Share2 className="w-3.5 h-3.5 text-[#232F3E]" />
              Share
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5 text-[#067D62]" />
              {shareStatus === 'shared' ? 'Shared' : 'Link Copied'}
            </>
          )}
        </button>
      </div>

      {/* Main 12-Column PDP Surface */}
      <div className="rt-card p-5 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 5 Columns: Sticky Product Gallery */}
          <div className="lg:col-span-5 lg:sticky lg:top-[122px] space-y-3">
            <div className="relative rounded-lg border border-[#D5D9D9] bg-white overflow-hidden group">
              <ProductImage
                src={product.image}
                alt={product.title}
                containerClassName="aspect-[4/3] w-full"
                className={product.imageClassName ?? ''}
              />
              {product.isDeal && discountPct && (
                <span className="absolute top-3.5 left-3.5 px-2.5 py-1 bg-[#CC0C39] text-white text-[11px] font-bold uppercase tracking-wider rounded-sm">
                  {product.dealLabel ?? `Save ${discountPct}%`}
                </span>
              )}
              <button
                type="button"
                onClick={() => setZoomOpen(true)}
                className="absolute bottom-3 right-3 px-2.5 py-1.5 bg-white/95 border border-[#D5D9D9] rounded text-[12px] font-medium text-[#0F1111] hover:bg-[#F7FAFA] inline-flex items-center gap-1.5 shadow-sm"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                Inspect
              </button>
            </div>

            {/* Studio Preview Strip & SKU info */}
            <div className="flex items-center justify-between gap-3 px-1 text-[12px] text-[#565959]">
              <span>
                Selected: <strong className="text-[#0F1111]">{activeVariant.label}</strong>
              </span>
              <span className="tabular-nums">SKU: {activeSku}</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="p-2.5 rounded border border-[#E2E2E2] bg-[#F9F9F9] text-center">
                <div className="text-[11px] font-semibold text-[#0F1111]">Factory Sealed</div>
                <div className="text-[11px] text-[#565959]">Direct Authorized</div>
              </div>
              <div className="p-2.5 rounded border border-[#E2E2E2] bg-[#F9F9F9] text-center">
                <div className="text-[11px] font-semibold text-[#0F1111]">2-Year Coverage</div>
                <div className="text-[11px] text-[#565959]">Hardware Warranty</div>
              </div>
              <div className="p-2.5 rounded border border-[#E2E2E2] bg-[#F9F9F9] text-center">
                <div className="text-[11px] font-semibold text-[#0F1111]">30-Day Returns</div>
                <div className="text-[11px] text-[#565959]">Zero Restock Fee</div>
              </div>
            </div>
          </div>

          {/* Center 4 Columns: Title, Variants, Highlights & Specs */}
          <div className="lg:col-span-4 space-y-4">
            <div>
              <button
                type="button"
                onClick={() => onBackToCatalog(product.department)}
                className="text-[13px] font-medium text-[#00668A] hover:text-[#8A5100] hover:underline mb-1"
              >
                Visit the {product.brand} Store
              </button>
              <h1 className="text-[22px] sm:text-[24px] leading-[30px] font-bold text-[#0F1111] text-balance">
                {product.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <StarRating
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  size="md"
                  onClick={() => {
                    document.getElementById('pdp-reviews')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                />
                <span className="text-[#D5D9D9]">|</span>
                <span className="text-[12px] text-[#565959]">
                  Department: <strong className="text-[#0F1111]">{product.department}</strong>
                </span>
              </div>
            </div>

            <hr className="border-[#E2E2E2]" />

            {/* Prominent Retail Trust System Pricing Block */}
            <div className="space-y-1.5">
              {product.isDeal && (
                <div className="inline-block px-2 py-0.5 bg-[#CC0C39] text-white text-[11px] font-bold uppercase tracking-wider rounded-sm">
                  Limited-Time Offer
                </div>
              )}
              <PriceDisplay
                price={effectivePrice}
                listPrice={effectiveListPrice}
                size="lg"
                showSavingsBadge
              />
              <p className="text-[13px] text-[#565959]">
                Transparent pricing with FREE Express shipping and free 30-day returns.
              </p>
            </div>

            <hr className="border-[#E2E2E2]" />

            {/* Variant / Configuration Selector */}
            <div>
              <div className="text-[13px] text-[#565959] mb-2">
                Configuration / Finish:{' '}
                <strong className="text-[#0F1111]">{activeVariant.label}</strong>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.variants.map((variant) => {
                  const selected = variant.id === activeVariant.id;
                  const vPrice = product.price + variant.priceDelta;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`p-2.5 rounded text-left border flex items-center gap-2.5 cursor-pointer ${
                        selected
                          ? 'border-[#FF9900] bg-[#FFF8EB] ring-1 ring-[#FF9900]'
                          : 'border-[#D5D9D9] bg-white hover:bg-[#F7FAFA]'
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: variant.finishHex }}
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <div className="text-[12px] font-semibold text-[#0F1111] truncate">
                          {variant.label}
                        </div>
                        <div className="text-[12px] text-[#565959] tabular-nums">
                          {formatCurrency(vPrice)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="border-[#E2E2E2]" />

            {/* Product Summary & Highlights */}
            <div>
              <h2 className="text-[15px] font-bold text-[#0F1111] mb-2">About this item</h2>
              <p className="text-[14px] leading-[20px] text-[#0F1111] mb-3">
                {product.summary}
              </p>
              <ul className="space-y-2 text-[13px] leading-[19px] text-[#0F1111] list-disc pl-4">
                {product.highlights.map((bullet, idx) => (
                  <li key={idx}>{bullet}</li>
                ))}
              </ul>
            </div>

            {/* Technical Specifications Table */}
            <div className="pt-2">
              <h2 className="text-[15px] font-bold text-[#0F1111] mb-2.5">
                Technical Specifications
              </h2>
              <div className="border border-[#D5D9D9] rounded overflow-hidden">
                <table className="w-full text-[13px]">
                  <tbody>
                    {product.specs.map((spec, idx) => (
                      <tr
                        key={spec.label}
                        className={idx % 2 === 0 ? 'bg-[#F3F3F4]' : 'bg-white'}
                      >
                        <th className="text-left font-semibold text-[#565959] px-3 py-2 w-[42%] border-r border-[#E2E2E2]">
                          {spec.label}
                        </th>
                        <td className="px-3 py-2 text-[#0F1111] tabular-nums">
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right 3 Columns: Contiguous Buy Box */}
          <aside className="lg:col-span-3 lg:sticky lg:top-[122px]">
            <div className="rounded-lg border border-[#D5D9D9] bg-white p-5 space-y-4 shadow-xs">
              <PriceDisplay price={effectivePrice} size="lg" />

              {product.expressEligible && (
                <div className="space-y-1.5 text-[13px]">
                  <div className="inline-flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#232F3E] text-white text-[10px] font-bold uppercase tracking-wider rounded-sm">
                      <Zap className="w-3 h-3 text-[#FF9900] fill-[#FF9900]" />
                      Express
                    </span>
                    <span className="font-semibold text-[#00668A]">FREE Delivery</span>
                  </div>
                  <p className="text-[#0F1111] leading-[19px]">
                    Arrives{' '}
                    <strong className="font-semibold">
                      {formatDeliveryDate(product.deliveryDays)}
                    </strong>{' '}
                    to {location.city}, {location.zip}. Order within 4 hrs 18 mins.
                  </p>
                </div>
              )}

              {/* Stock Status */}
              <div className="text-[15px] font-semibold">
                {product.stockCount <= 8 ? (
                  <span className="text-[#CC0C39]">
                    Only {product.stockCount} left in stock
                  </span>
                ) : (
                  <span className="text-[#067D62]">In Stock</span>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-2.5">
                <label htmlFor="pdp-qty" className="text-[13px] font-medium text-[#0F1111]">
                  Qty:
                </label>
                <select
                  id="pdp-qty"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="rt-input px-3 py-1.5 text-[13px] font-medium tabular-nums cursor-pointer"
                >
                  {Array.from({ length: Math.min(10, product.stockCount) }, (_, i) => i + 1).map(
                    (num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Conversion CTAs */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleAdd}
                  className="rt-btn-primary w-full py-2.5 px-4 text-[14px] flex items-center justify-center gap-2 cursor-pointer"
                >
                  {addedBanner ? (
                    <>
                      <Check className="w-4 h-4" />
                      Added to Cart
                    </>
                  ) : (
                    'Add to Cart'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onBuyNow(product.id, activeVariant.id, quantity)}
                  className="rt-btn-secondary w-full py-2.5 px-4 text-[14px] cursor-pointer"
                >
                  Buy Now
                </button>
              </div>

              {/* Trust & Fulfillment Details */}
              <div className="pt-2 border-t border-[#E2E2E2] space-y-2 text-[12px]">
                <div className="flex justify-between gap-2">
                  <span className="text-[#565959]">Ships from</span>
                  <span className="text-[#0F1111] font-medium">Meridian Direct</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-[#565959]">Sold by</span>
                  <span className="text-[#00668A] font-medium">{product.brand} Official</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-[#565959]">Returns</span>
                  <span className="text-[#0F1111] inline-flex items-center gap-1">
                    <RotateCcw className="w-3 h-3 text-[#565959]" />
                    30-day free return
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-[#565959]">Security</span>
                  <span className="text-[#0F1111] inline-flex items-center gap-1">
                    <Lock className="w-3 h-3 text-[#565959]" />
                    Encrypted payment
                  </span>
                </div>
              </div>

              {/* Save to Hardware List & Set Price Alert */}
              <div className="pt-2 border-t border-[#E2E2E2] space-y-2">
                <button
                  type="button"
                  onClick={() => onToggleSave(product.id)}
                  className={`w-full py-2 px-3 rounded border text-[13px] font-medium inline-flex items-center justify-center gap-2 cursor-pointer ${
                    isSaved
                      ? 'border-[#FF9900] bg-[#FFF8EB] text-[#8A5100]'
                      : 'border-[#D5D9D9] bg-[#F9F9F9] text-[#0F1111] hover:bg-[#F3F3F4]'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#FF9900] text-[#FF9900]' : ''}`} />
                  {isSaved ? 'Saved in Hardware List' : 'Add to Saved List'}
                </button>

                {activePriceAlert ? (
                  <div className="p-3 rounded border border-[#00668A]/35 bg-[#F2F9FC] space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#004C69]">
                        <BellRing className="w-3.5 h-3.5 text-[#00668A]" />
                        Price Alert Active
                      </span>
                      <button
                        type="button"
                        onClick={() => setPriceAlertOpen(true)}
                        className="text-[12px] font-semibold text-[#00668A] hover:text-[#8A5100] hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="text-[12px] text-[#0F1111] leading-[17px]">
                      Email when{' '}
                      <strong className="tabular-nums">
                        ≤ {formatCurrency(activePriceAlert.targetPrice)}
                      </strong>
                    </div>
                    <div className="text-[11px] text-[#565959] truncate">
                      {activePriceAlert.email}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPriceAlertOpen(true)}
                    className="w-full py-2 px-3 rounded border border-[#D5D9D9] bg-white hover:bg-[#F7FAFA] text-[#0F1111] text-[13px] font-medium inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Bell className="w-4 h-4 text-[#8A5100]" />
                    Set Price Alert
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section id="pdp-reviews" className="rt-card p-5 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 4 cols: Rating Histogram & Write Review */}
          <div className="lg:col-span-4 space-y-5">
            <div>
              <h2 className="text-[20px] font-bold text-[#0F1111] mb-2">
                Customer Reviews
              </h2>
              <div className="flex items-center gap-2.5 mb-1">
                <StarRating rating={product.rating} size="md" showNumeric={false} />
                <span className="text-[16px] font-bold text-[#0F1111] tabular-nums">
                  {product.rating.toFixed(1)} out of 5
                </span>
              </div>
              <p className="text-[13px] text-[#565959] tabular-nums">
                {product.reviewCount.toLocaleString('en-US')} verified global ratings
              </p>
            </div>

            {/* Interactive 5-Star Breakdown Bars */}
            <div className="space-y-2">
              {starDistribution.map((row) => {
                const active = starFilter === row.stars;
                return (
                  <button
                    key={row.stars}
                    type="button"
                    onClick={() =>
                      setStarFilter((curr) => (curr === row.stars ? null : row.stars))
                    }
                    className={`w-full flex items-center gap-3 text-[13px] group py-0.5 rounded ${
                      active ? 'font-bold text-[#8A5100]' : 'text-[#00668A]'
                    }`}
                  >
                    <span className="w-[46px] text-left whitespace-nowrap group-hover:underline">
                      {row.stars} star
                    </span>
                    <div className="flex-1 h-[18px] bg-[#F3F3F4] border border-[#D5D9D9] rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-[#FF9900]"
                        style={{ width: `${row.percent}%` }}
                      />
                    </div>
                    <span className="w-[38px] text-right tabular-nums text-[#565959]">
                      {row.percent}%
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#E2E2E2]">
              <h3 className="text-[15px] font-bold text-[#0F1111] mb-1">
                Review this product
              </h3>
              <p className="text-[13px] text-[#565959] mb-3">
                Share hands-on build quality and performance notes with other buyers.
              </p>
              <button
                type="button"
                onClick={() => setReviewFormOpen((o) => !o)}
                className="rt-btn-secondary w-full py-2 text-[13px] cursor-pointer"
              >
                {reviewFormOpen ? 'Cancel Review' : 'Write a Customer Review'}
              </button>
            </div>
          </div>

          {/* Right 8 cols: Review Form + Verified Review Feed */}
          <div className="lg:col-span-8 space-y-5">
            {reviewSubmitted && (
              <div className="p-3.5 rounded border border-[#067D62]/40 bg-[#F0FAF7] text-[#067D62] text-[13px] font-medium flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                Thank you. Your verified customer review has been published below.
              </div>
            )}

            {reviewFormOpen && (
              <form
                onSubmit={handleReviewSubmit}
                className="p-5 rounded-lg border border-[#D5D9D9] bg-[#F9F9F9] space-y-4"
              >
                <h3 className="text-[16px] font-bold text-[#0F1111]">
                  Write a review for {product.shortTitle}
                </h3>

                <div>
                  <label className="block text-[13px] font-semibold text-[#0F1111] mb-1.5">
                    Overall Rating
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        aria-label={`Rate ${star} stars`}
                        className="p-1 cursor-pointer"
                      >
                        <Star
                          size={22}
                          className={
                            star <= reviewRating
                              ? 'fill-[#FF9900] text-[#E47911]'
                              : 'fill-[#E8E8E8] text-[#B8B8B8]'
                          }
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-[13px] text-[#565959] font-medium">
                      {reviewRating} out of 5 stars
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="rev-name" className="block text-[13px] font-semibold text-[#0F1111] mb-1">
                      Your Name
                    </label>
                    <input
                      id="rev-name"
                      type="text"
                      required
                      value={reviewAuthor}
                      onChange={(e) => setReviewAuthor(e.target.value)}
                      placeholder="e.g., Jordan Lee"
                      className="rt-input w-full px-3 py-2 text-[13px]"
                    />
                  </div>
                  <div>
                    <label htmlFor="rev-title" className="block text-[13px] font-semibold text-[#0F1111] mb-1">
                      Review Headline
                    </label>
                    <input
                      id="rev-title"
                      type="text"
                      required
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="What stood out most?"
                      className="rt-input w-full px-3 py-2 text-[13px]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="rev-body" className="block text-[13px] font-semibold text-[#0F1111] mb-1">
                    Written Review
                  </label>
                  <textarea
                    id="rev-body"
                    rows={3}
                    required
                    value={reviewBody}
                    onChange={(e) => setReviewBody(e.target.value)}
                    placeholder="Share details on build quality, setup, and daily reliability..."
                    className="rt-input w-full px-3 py-2 text-[13px]"
                  />
                </div>

                <div className="flex items-center gap-2.5">
                  <button type="submit" className="rt-btn-primary px-5 py-2 text-[13px] cursor-pointer">
                    Publish Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewFormOpen(false)}
                    className="rt-btn-secondary px-4 py-2 text-[13px] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="flex items-center justify-between pb-2 border-b border-[#E2E2E2]">
              <h3 className="text-[16px] font-bold text-[#0F1111]">
                {starFilter ? `Showing ${starFilter}-Star Reviews` : 'Top Verified Reviews'}
              </h3>
              {starFilter && (
                <button
                  type="button"
                  onClick={() => setStarFilter(null)}
                  className="text-[13px] text-[#00668A] hover:underline"
                >
                  Show all stars
                </button>
              )}
            </div>

            {displayedReviews.length === 0 ? (
              <div className="py-8 text-center text-[14px] text-[#565959]">
                No written reviews match the {starFilter}-star filter yet.
              </div>
            ) : (
              <div className="space-y-5">
                {displayedReviews.map((rev) => {
                  const hasVoted = votedIds.includes(rev.id);
                  return (
                    <article key={rev.id} className="pb-5 border-b border-[#EEEEEE] last:border-b-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-7 h-7 rounded-full bg-[#232F3E] text-white text-[12px] font-bold flex items-center justify-center">
                          {rev.author.charAt(0).toUpperCase()}
                        </span>
                        <span className="text-[13px] font-semibold text-[#0F1111]">
                          {rev.author}
                        </span>
                        {rev.verified && (
                          <span className="text-[12px] font-semibold text-[#8A5100] inline-flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Verified Purchase
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <StarRating rating={rev.rating} showNumeric={false} size="sm" />
                        <h4 className="text-[14px] font-bold text-[#0F1111]">
                          {rev.title}
                        </h4>
                      </div>

                      <div className="text-[12px] text-[#565959] mb-2">
                        Reviewed on {rev.date}
                        {rev.variantPurchased && (
                          <>
                            <span className="mx-1.5">·</span>
                            <span>Configuration: {rev.variantPurchased}</span>
                          </>
                        )}
                      </div>

                      <p className="text-[14px] leading-[21px] text-[#0F1111] mb-3">
                        {rev.body}
                      </p>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={hasVoted}
                          onClick={() => {
                            setVotedIds((prev) => [...prev, rev.id]);
                            onVoteHelpful(product.id, rev.id);
                          }}
                          className={`rt-btn-secondary px-3 py-1 text-[12px] inline-flex items-center gap-1.5 ${
                            hasVoted ? 'opacity-65 cursor-default' : 'cursor-pointer'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          {hasVoted ? 'Marked Helpful' : 'Helpful'}
                        </button>
                        <span className="text-[12px] text-[#565959] tabular-nums">
                          {rev.helpfulCount} people found this helpful
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products Row */}
      {relatedProducts.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-[20px] font-bold text-[#0F1111]">
            Customers Also Viewed
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedProducts.map((rel) => (
              <div
                key={rel.id}
                className="rt-card-hover p-4 flex flex-col justify-between"
              >
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectProduct(rel.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="block w-full text-left"
                  >
                    <ProductImage
                      src={rel.image}
                      alt={rel.shortTitle}
                      containerClassName="aspect-[4/3] w-full rounded mb-3 border border-[#EEEEEE]"
                      className={rel.imageClassName ?? ''}
                    />
                    <div className="text-[11px] text-[#565959] mb-0.5">{rel.brand}</div>
                    <h3 className="text-[14px] font-semibold text-[#0F1111] hover:text-[#8A5100] line-clamp-2 mb-1.5">
                      {rel.shortTitle}
                    </h3>
                  </button>
                  <StarRating rating={rel.rating} reviewCount={rel.reviewCount} size="sm" />
                </div>
                <div className="mt-3 pt-2 border-t border-[#EEEEEE] flex items-end justify-between gap-2">
                  <PriceDisplay price={rel.price} size="sm" />
                  <button
                    type="button"
                    onClick={() => {
                      onSelectProduct(rel.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-[12px] font-semibold text-[#00668A] hover:text-[#8A5100] hover:underline whitespace-nowrap"
                  >
                    View item
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Fullscreen Studio Image Zoom Modal */}
      {zoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#131A22]/85 flex items-center justify-center p-4 sm:p-8"
          onClick={() => setZoomOpen(false)}
        >
          <div
            className="relative bg-white rounded-lg max-w-[900px] w-full overflow-hidden border border-[#D5D9D9] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 bg-[#F3F3F4] border-b border-[#D5D9D9] flex items-center justify-between">
              <div className="text-[14px] font-semibold text-[#0F1111] truncate pr-4">
                {product.shortTitle} — {activeVariant.label}
              </div>
              <button
                type="button"
                onClick={() => setZoomOpen(false)}
                className="p-1 text-[#565959] hover:text-[#0F1111] rounded"
                aria-label="Close zoom preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-white p-6 flex items-center justify-center max-h-[75vh] overflow-hidden">
              <img
                src={product.image}
                alt={product.title}
                referrerPolicy="no-referrer"
                className={`max-h-[65vh] w-auto object-contain ${product.imageClassName ?? ''}`}
              />
            </div>
          </div>
        </div>
      )}
      {/* Price Drop Alert Modal */}
      <PriceAlertModal
        open={priceAlertOpen}
        product={product}
        variant={activeVariant}
        currentPrice={effectivePrice}
        existingAlert={activePriceAlert}
        defaultEmail={defaultAlertEmail}
        onClose={() => setPriceAlertOpen(false)}
        onSave={onSavePriceAlert}
        onRemove={onRemovePriceAlert}
      />
    </div>
  );
}
