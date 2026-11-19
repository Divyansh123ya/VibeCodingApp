import { useState } from 'react';
import {
  Check,
  SlidersHorizontal,
  X,
  Truck,
  RotateCcw,
  ShieldCheck,
  Bookmark,
  Zap,
  ChevronRight,
  SearchX,
} from 'lucide-react';
import { DEPARTMENTS, HERO_BANNER_IMAGE } from '../data/catalog';
import { DeliveryLocation, Department, Product, SortOption } from '../types';
import { formatDeliveryDate, getDiscountPercent } from '../utils/format';
import { PriceDisplay } from './PriceDisplay';
import { ProductImage } from './ProductImage';
import { StarRating } from './StarRating';

interface CatalogScreenProps {
  products: Product[];
  selectedDepartment: Department;
  searchQuery: string;
  dealsOnly: boolean;
  expressOnly: boolean;
  minRating: number;
  priceRange: [number | null, number | null];
  sortBy: SortOption;
  savedIds: string[];
  location: DeliveryLocation;
  onSelectDepartment: (dept: Department) => void;
  onToggleDealsOnly: () => void;
  onToggleExpressOnly: () => void;
  onChangeMinRating: (rating: number) => void;
  onChangePriceRange: (range: [number | null, number | null]) => void;
  onChangeSort: (sort: SortOption) => void;
  onClearAllFilters: () => void;
  onSelectProduct: (productId: string) => void;
  onAddToCart: (productId: string, variantId: string, quantity?: number) => void;
  onToggleSave: (productId: string) => void;
}

const PRICE_PRESETS: { label: string; range: [number | null, number | null] }[] = [
  { label: 'Any Price', range: [null, null] },
  { label: 'Under ₹15,000', range: [null, 15000] },
  { label: '₹15,000 to ₹30,000', range: [15000, 30000] },
  { label: '₹30,000 to ₹60,000', range: [30000, 60000] },
  { label: 'Over ₹60,000', range: [60000, null] },
];

export function CatalogScreen({
  products,
  selectedDepartment,
  searchQuery,
  dealsOnly,
  expressOnly,
  minRating,
  priceRange,
  sortBy,
  savedIds,
  location,
  onSelectDepartment,
  onToggleDealsOnly,
  onToggleExpressOnly,
  onChangeMinRating,
  onChangePriceRange,
  onChangeSort,
  onClearAllFilters,
  onSelectProduct,
  onAddToCart,
  onToggleSave,
}: CatalogScreenProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [customMin, setCustomMin] = useState('');
  const [customMax, setCustomMax] = useState('');

  const hasActiveFilters =
    selectedDepartment !== 'All Products' ||
    searchQuery.trim().length > 0 ||
    dealsOnly ||
    expressOnly ||
    minRating > 0 ||
    priceRange[0] !== null ||
    priceRange[1] !== null;

  const filteredProducts = products
    .filter((p) => {
      if (selectedDepartment !== 'All Products' && p.department !== selectedDepartment) {
        return false;
      }
      if (dealsOnly && !p.isDeal) return false;
      if (expressOnly && !p.expressEligible) return false;
      if (minRating > 0 && p.rating < minRating) return false;
      if (priceRange[0] !== null && p.price < priceRange[0]) return false;
      if (priceRange[1] !== null && p.price > priceRange[1]) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.department.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating-desc':
          return b.rating - a.rating || b.reviewCount - a.reviewCount;
        case 'savings-desc': {
          const sa = getDiscountPercent(a.price, a.listPrice) ?? 0;
          const sb = getDiscountPercent(b.price, b.listPrice) ?? 0;
          return sb - sa;
        }
        default:
          return 0;
      }
    });

  const handleQuickAdd = (product: Product) => {
    const defaultVariant = product.variants[0];
    onAddToCart(product.id, defaultVariant.id, 1);
    setJustAddedId(product.id);
    window.setTimeout(() => {
      setJustAddedId((curr) => (curr === product.id ? null : curr));
    }, 1400);
  };

  const applyCustomPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const minVal = customMin.trim() ? Number(customMin) : null;
    const maxVal = customMax.trim() ? Number(customMax) : null;
    onChangePriceRange([
      minVal !== null && !Number.isNaN(minVal) ? minVal : null,
      maxVal !== null && !Number.isNaN(maxVal) ? maxVal : null,
    ]);
  };

  const renderFilterControls = () => (
    <div className="space-y-6">
      {/* Department */}
      <div>
        <h3 className="text-[13px] font-bold text-[#0F1111] mb-2.5">Department</h3>
        <ul className="space-y-1.5">
          {DEPARTMENTS.map((dept) => {
            const active = selectedDepartment === dept;
            return (
              <li key={dept}>
                <button
                  type="button"
                  onClick={() => {
                    onSelectDepartment(dept);
                    setMobileFiltersOpen(false);
                  }}
                  className={`w-full text-left text-[13px] py-1 px-2 rounded flex items-center justify-between ${
                    active
                      ? 'bg-[#FFF5E5] text-[#8A5100] font-semibold'
                      : 'text-[#0F1111] hover:bg-[#F3F3F4]'
                  }`}
                >
                  <span>{dept}</span>
                  {active && <ChevronRight className="w-3.5 h-3.5 text-[#8A5100]" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <hr className="border-[#E2E2E2]" />

      {/* Fulfillment & Deals */}
      <div>
        <h3 className="text-[13px] font-bold text-[#0F1111] mb-2.5">Delivery &amp; Offers</h3>
        <div className="space-y-2.5">
          <label className="flex items-center gap-2.5 text-[13px] text-[#0F1111] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={expressOnly}
              onChange={onToggleExpressOnly}
              className="w-4 h-4 accent-[#FF9900] rounded-sm cursor-pointer"
            />
            <span className="inline-flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#232F3E] text-white rounded-sm">
                Express
              </span>
              <span>Free Next-Day</span>
            </span>
          </label>

          <label className="flex items-center gap-2.5 text-[13px] text-[#0F1111] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dealsOnly}
              onChange={onToggleDealsOnly}
              className="w-4 h-4 accent-[#FF9900] rounded-sm cursor-pointer"
            />
            <span className="inline-flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#CC0C39] text-white rounded-sm">
                Deal
              </span>
              <span>Active Discounts</span>
            </span>
          </label>
        </div>
      </div>

      <hr className="border-[#E2E2E2]" />

      {/* Customer Rating */}
      <div>
        <h3 className="text-[13px] font-bold text-[#0F1111] mb-2.5">Avg. Customer Review</h3>
        <div className="space-y-1.5">
          {[4.8, 4.5, 4.0, 0].map((threshold) => {
            const active = minRating === threshold;
            return (
              <button
                key={threshold}
                type="button"
                onClick={() => onChangeMinRating(threshold)}
                className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between text-[13px] ${
                  active
                    ? 'bg-[#FFF5E5] text-[#8A5100] font-semibold'
                    : 'text-[#0F1111] hover:bg-[#F3F3F4]'
                }`}
              >
                {threshold === 0 ? (
                  <span>All Ratings</span>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <StarRating rating={threshold} showNumeric={false} size="sm" />
                    <span className="text-[12px] text-[#565959]">&amp; Up</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-[#E2E2E2]" />

      {/* Price Range */}
      <div>
        <h3 className="text-[13px] font-bold text-[#0F1111] mb-2.5">Price</h3>
        <div className="space-y-1 mb-3">
          {PRICE_PRESETS.map((preset) => {
            const active =
              priceRange[0] === preset.range[0] && priceRange[1] === preset.range[1];
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  onChangePriceRange(preset.range);
                  setCustomMin(preset.range[0]?.toString() ?? '');
                  setCustomMax(preset.range[1]?.toString() ?? '');
                }}
                className={`w-full text-left px-2 py-1 rounded text-[13px] ${
                  active
                    ? 'bg-[#FFF5E5] text-[#8A5100] font-semibold'
                    : 'text-[#0F1111] hover:bg-[#F3F3F4]'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={applyCustomPrice} className="flex items-center gap-1.5">
          <input
            type="number"
            min="0"
            placeholder="₹ Min"
            value={customMin}
            onChange={(e) => setCustomMin(e.target.value)}
            className="rt-input w-full px-2 py-1 text-[12px] tabular-nums"
          />
          <span className="text-[#565959] text-[12px]">–</span>
          <input
            type="number"
            min="0"
            placeholder="₹ Max"
            value={customMax}
            onChange={(e) => setCustomMax(e.target.value)}
            className="rt-input w-full px-2 py-1 text-[12px] tabular-nums"
          />
          <button
            type="submit"
            className="rt-btn-secondary px-2.5 py-1 text-[12px] shrink-0"
          >
            Go
          </button>
        </form>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => {
            setCustomMin('');
            setCustomMax('');
            onClearAllFilters();
          }}
          className="rt-btn-secondary w-full py-2 text-[13px]"
        >
          Reset All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-5 pb-8">
      {/* Dominant Focal Anchor: Storefront Hero Banner (only when unfiltered) */}
      {!hasActiveFilters && (
        <section
          aria-label="Featured Hardware Campaign"
          className="relative rounded-lg overflow-hidden border border-[#232F3E]/20 bg-[#131A22] mb-6"
        >
          <div className="relative min-h-[300px] sm:min-h-[360px] lg:min-h-[400px] flex items-center">
            <img
              src={HERO_BANNER_IMAGE}
              alt="Precision workstation desk featuring matte graphite wireless headphones, CNC mechanical keyboard, and anodized aluminum desk lamp"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover object-right"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#131A22] via-[#131A22]/88 to-[#131A22]/15" />

            <div className="relative z-10 max-w-[600px] px-6 sm:px-10 py-10">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-[#CC0C39] text-white text-[11px] font-bold uppercase tracking-wider rounded-sm">
                  Seasonal Savings
                </span>
                <span className="text-[13px] font-medium text-[#D5D9D9]">
                  Express Next-Day Delivery to {location.city}
                </span>
              </div>

              <h1 className="text-[28px] sm:text-[32px] lg:text-[36px] leading-[1.2] font-bold text-white tracking-tight text-balance mb-3">
                Engineered Workspace &amp; Studio Hardware Built for Daily Clarity
              </h1>

              <p className="text-[15px] leading-[22px] text-[#E2E2E2] mb-6 max-w-[490px]">
                Save up to 24% on verified flagship audio, CNC keyboards, and factory-calibrated USB-C monitors backed by our 2-year direct warranty.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onSelectProduct('aura-anc-pro')}
                  className="rt-btn-primary px-6 py-2.5 text-[14px] inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  Shop Aura Studio Pro
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onToggleDealsOnly}
                  className="px-5 py-2.5 text-[14px] font-medium text-white bg-white/10 hover:bg-white/20 border border-white/25 rounded whitespace-nowrap cursor-pointer"
                >
                  View All Deals
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 12-Column Fluid Retail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Filter Rail (3 columns on desktop) */}
        <aside className="hidden lg:block lg:col-span-3 rt-card p-5 sticky top-[122px]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E2E2E2]">
            <h2 className="text-[15px] font-bold text-[#0F1111]">Filter Catalog</h2>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onClearAllFilters}
                className="text-[12px] font-medium text-[#00668A] hover:text-[#8A5100] hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
          {renderFilterControls()}
        </aside>

        {/* Main Results & Product Grid (9 columns on desktop) */}
        <div className="lg:col-span-9 space-y-4">
          {/* Toolbar Strip */}
          <div className="rt-card px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden rt-btn-secondary px-3 py-1.5 text-[13px] inline-flex items-center gap-1.5"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>

              <div className="text-[14px] text-[#0F1111]">
                <span className="font-semibold tabular-nums">
                  {filteredProducts.length}
                </span>{' '}
                {filteredProducts.length === 1 ? 'result' : 'results'}
                {selectedDepartment !== 'All Products' && (
                  <span>
                    {' '}
                    in <strong className="font-semibold">{selectedDepartment}</strong>
                  </span>
                )}
                {searchQuery.trim() && (
                  <span>
                    {' '}
                    for <strong className="font-semibold text-[#8A5100]">&ldquo;{searchQuery}&rdquo;</strong>
                  </span>
                )}
                {dealsOnly && (
                  <span className="ml-2 text-[12px] font-semibold text-[#CC0C39]">
                    · Active Deals
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="catalog-sort" className="text-[13px] text-[#565959] whitespace-nowrap">
                Sort by:
              </label>
              <select
                id="catalog-sort"
                value={sortBy}
                onChange={(e) => onChangeSort(e.target.value as SortOption)}
                className="rt-input px-2.5 py-1.5 text-[13px] font-medium cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Avg. Customer Review</option>
                <option value="savings-desc">Biggest Savings</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="rt-card p-12 text-center">
              <SearchX className="w-12 h-12 text-[#888C8C] mx-auto mb-3" strokeWidth={1.5} />
              <h2 className="text-[20px] font-semibold text-[#0F1111] mb-1.5">
                No matching products found
              </h2>
              <p className="text-[14px] text-[#565959] mb-5 max-w-md mx-auto">
                Try adjusting your price range, clearing the search term, or browsing all Meridian Direct departments.
              </p>
              <button
                type="button"
                onClick={onClearAllFilters}
                className="rt-btn-primary px-5 py-2 text-[14px]"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
                const isSaved = savedIds.includes(product.id);
                const isAdded = justAddedId === product.id;
                const discountPct = getDiscountPercent(product.price, product.listPrice);

                return (
                  <article
                    key={product.id}
                    className="rt-card-hover flex flex-col overflow-hidden"
                  >
                    {/* Studio Imagery Container */}
                    <div className="relative bg-white border-b border-[#EEEEEE]">
                      <button
                        type="button"
                        onClick={() => onSelectProduct(product.id)}
                        className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF9900]"
                        aria-label={`View details for ${product.shortTitle}`}
                      >
                        <ProductImage
                          src={product.image}
                          alt={product.shortTitle}
                          containerClassName="aspect-[4/3] w-full"
                          className={`transition-transform duration-200 hover:scale-[1.03] ${product.imageClassName ?? ''}`}
                        />
                      </button>

                      {/* Single High-Contrast Promotional Badge when on Deal */}
                      {product.isDeal && discountPct && (
                        <span className="absolute top-3 left-3 px-2 py-0.5 bg-[#CC0C39] text-white text-[11px] font-bold uppercase tracking-wider rounded-sm pointer-events-none">
                          {product.dealLabel ?? `Save ${discountPct}%`}
                        </span>
                      )}

                      {/* Save / Bookmark Action */}
                      <button
                        type="button"
                        onClick={() => onToggleSave(product.id)}
                        aria-label={isSaved ? `Remove ${product.shortTitle} from saved list` : `Save ${product.shortTitle}`}
                        className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full border flex items-center justify-center bg-white/95 ${
                          isSaved
                            ? 'border-[#FF9900] text-[#8A5100]'
                            : 'border-[#D5D9D9] text-[#565959] hover:text-[#0F1111]'
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#FF9900] text-[#FF9900]' : ''}`} />
                      </button>
                    </div>

                    {/* Metadata, Rating, Pricing & Conversion Action */}
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="text-[12px] text-[#565959] mb-1">
                        <span>{product.brand}</span>
                        <span className="mx-1.5" aria-hidden="true">·</span>
                        <span>{product.department}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectProduct(product.id)}
                        className="text-left text-[15px] leading-[21px] font-semibold text-[#0F1111] hover:text-[#8A5100] line-clamp-2 mb-2 focus-visible:outline-none focus-visible:underline"
                      >
                        {product.title}
                      </button>

                      <div className="mb-3">
                        <StarRating
                          rating={product.rating}
                          reviewCount={product.reviewCount}
                          size="sm"
                          onClick={() => onSelectProduct(product.id)}
                        />
                      </div>

                      <div className="mt-auto space-y-3">
                        <PriceDisplay
                          price={product.price}
                          listPrice={product.listPrice}
                          size="lg"
                        />

                        {/* Express Eligibility & Delivery Estimate */}
                        <div className="space-y-1">
                          {product.expressEligible && (
                            <div className="inline-flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#232F3E] text-white text-[10px] font-bold uppercase tracking-wider rounded-sm">
                                <Zap className="w-3 h-3 text-[#FF9900] fill-[#FF9900]" />
                                Express
                              </span>
                              <span className="text-[12px] text-[#0F1111]">
                                FREE delivery{' '}
                                <strong className="font-semibold">
                                  {formatDeliveryDate(product.deliveryDays)}
                                </strong>
                              </span>
                            </div>
                          )}
                          <div className="text-[12px] text-[#565959]">
                            {product.stockCount <= 8 ? (
                              <span className="text-[#CC0C39] font-medium">
                                Only {product.stockCount} left in stock — order soon
                              </span>
                            ) : (
                              <span>In Stock · Ships to {location.zip}</span>
                            )}
                          </div>
                        </div>

                        <div className="pt-1 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleQuickAdd(product)}
                            className={`flex-1 py-2 px-3 text-[13px] rounded font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                              isAdded
                                ? 'bg-[#232F3E] text-white border border-[#232F3E]'
                                : 'rt-btn-primary'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-4 h-4 text-[#FF9900]" />
                                Added to Cart
                              </>
                            ) : (
                              'Add to Cart'
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => onSelectProduct(product.id)}
                            className="rt-btn-secondary py-2 px-3 text-[13px] whitespace-nowrap cursor-pointer"
                          >
                            Specs
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Trust & Fulfillment Guarantee Bar */}
          <section
            aria-label="Meridian Direct Service Guarantees"
            className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4"
          >
            <div className="rt-card p-5 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded bg-[#F3F3F4] border border-[#D5D9D9] flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-[#232F3E]" />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-[#0F1111] mb-0.5">
                  Next-Day Express Fulfillment
                </h3>
                <p className="text-[13px] leading-[19px] text-[#565959]">
                  Free next-day delivery on eligible hardware orders to {location.city} ({location.zip}) with real-time carrier tracking.
                </p>
              </div>
            </div>

            <div className="rt-card p-5 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded bg-[#F3F3F4] border border-[#D5D9D9] flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5 text-[#232F3E]" />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-[#0F1111] mb-0.5">
                  30-Day Hassle-Free Returns
                </h3>
                <p className="text-[13px] leading-[19px] text-[#565959]">
                  Prepaid drop-off labels and instant refund processing upon carrier scan—zero restocking fees.
                </p>
              </div>
            </div>

            <div className="rt-card p-5 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded bg-[#F3F3F4] border border-[#D5D9D9] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#232F3E]" />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-[#0F1111] mb-0.5">
                  2-Year Direct Hardware Warranty
                </h3>
                <p className="text-[13px] leading-[19px] text-[#565959]">
                  Every product is factory-sealed and covered by direct replacement support from Meridian Direct.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#131A22]/60"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative w-full max-w-[320px] bg-white h-full overflow-y-auto p-5 shadow-2xl z-10">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#D5D9D9]">
              <h2 className="text-[16px] font-bold text-[#0F1111]">Filter Catalog</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1.5 text-[#565959] hover:text-[#0F1111] rounded"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderFilterControls()}
          </div>
        </div>
      )}
    </div>
  );
}
