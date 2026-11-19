import React, { useState } from 'react';
import {
  ShoppingCart,
  Trash2,
  Bookmark,
  Zap,
  ShieldCheck,
  Tag,
  Check,
  ArrowRight,
  Plus,
  Minus,
} from 'lucide-react';
import { CartItem, Product } from '../types';
import { formatCurrency, formatDeliveryDate } from '../utils/format';
import { PriceDisplay } from './PriceDisplay';
import { ProductImage } from './ProductImage';

interface CartScreenProps {
  items: CartItem[];
  savedForLater: CartItem[];
  products: Product[];
  appliedPromo: { code: string; percent: number } | null;
  onUpdateQty: (productId: string, variantId: string, qty: number) => void;
  onRemoveItem: (productId: string, variantId: string) => void;
  onSaveForLater: (productId: string, variantId: string) => void;
  onMoveToCart: (productId: string, variantId: string) => void;
  onRemoveSavedForLater: (productId: string, variantId: string) => void;
  onApplyPromo: (code: string) => { success: boolean; message: string };
  onClearPromo: () => void;
  onSelectProduct: (productId: string) => void;
  onProceedToCheckout: () => void;
  onContinueShopping: () => void;
}

export function CartScreen({
  items,
  savedForLater,
  products,
  appliedPromo,
  onUpdateQty,
  onRemoveItem,
  onSaveForLater,
  onMoveToCart,
  onRemoveSavedForLater,
  onApplyPromo,
  onClearPromo,
  onSelectProduct,
  onProceedToCheckout,
  onContinueShopping,
}: CartScreenProps) {
  const [promoInput, setPromoInput] = useState('');
  const [promoFeedback, setPromoFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const resolveItems = (list: CartItem[]) =>
    list
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return null;
        const variant =
          product.variants.find((v) => v.id === item.variantId) ?? product.variants[0];
        const unitPrice = product.price + variant.priceDelta;
        return { item, product, variant, unitPrice };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  const resolvedCart = resolveItems(items);
  const resolvedSaved = resolveItems(savedForLater);

  const totalCount = resolvedCart.reduce((s, r) => s + r.item.quantity, 0);
  const subtotal = resolvedCart.reduce((s, r) => s + r.unitPrice * r.item.quantity, 0);
  const discountAmount = appliedPromo ? subtotal * (appliedPromo.percent / 100) : 0;
  const estimatedTotal = Math.max(0, subtotal - discountAmount);

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = onApplyPromo(promoInput.trim());
    setPromoFeedback({ ok: res.success, text: res.message });
    if (res.success) {
      setPromoInput('');
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-6 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left 8 Columns: Shopping Cart & Saved for Later */}
        <div className="lg:col-span-8 space-y-5">
          <div className="rt-card p-5 sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4 border-b border-[#D5D9D9]">
              <h1 className="text-[24px] leading-[32px] font-bold text-[#0F1111]">
                Shopping Cart
              </h1>
              <span className="text-[13px] text-[#565959] hidden sm:inline">Price</span>
            </div>

            {resolvedCart.length === 0 ? (
              <div className="py-12 text-center">
                <ShoppingCart className="w-12 h-12 text-[#888C8C] mx-auto mb-3" strokeWidth={1.5} />
                <h2 className="text-[18px] font-semibold text-[#0F1111] mb-1">
                  Your cart is currently empty
                </h2>
                <p className="text-[14px] text-[#565959] mb-5">
                  Browse our curated hardware catalog to add items with Express next-day delivery.
                </p>
                <button
                  type="button"
                  onClick={onContinueShopping}
                  className="rt-btn-primary px-6 py-2.5 text-[14px] cursor-pointer"
                >
                  Browse Catalog
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#E2E2E2]">
                {resolvedCart.map(({ item, product, variant, unitPrice }) => (
                  <div
                    key={`${item.productId}-${item.variantId}`}
                    className="py-5 flex flex-col sm:flex-row gap-4"
                  >
                    <button
                      type="button"
                      onClick={() => onSelectProduct(product.id)}
                      className="w-full sm:w-[150px] aspect-[4/3] rounded border border-[#D5D9D9] bg-white overflow-hidden shrink-0"
                    >
                      <ProductImage
                        src={product.image}
                        alt={product.shortTitle}
                        containerClassName="w-full h-full"
                        className={product.imageClassName ?? ''}
                      />
                    </button>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-[12px] text-[#565959] mb-0.5">
                            {product.brand} · {product.department}
                          </div>
                          <button
                            type="button"
                            onClick={() => onSelectProduct(product.id)}
                            className="text-left text-[16px] font-semibold text-[#0F1111] hover:text-[#8A5100] leading-[22px]"
                          >
                            {product.title}
                          </button>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
                            <span className="text-[#067D62] font-semibold">In Stock</span>
                            <span className="text-[#565959]">
                              Config: <strong className="text-[#0F1111]">{variant.label}</strong>
                            </span>
                            {product.expressEligible && (
                              <span className="inline-flex items-center gap-1 text-[#0F1111]">
                                <span className="px-1.5 py-0.5 bg-[#232F3E] text-white text-[10px] font-bold uppercase tracking-wider rounded-sm">
                                  Express
                                </span>
                                <span>Arrives {formatDeliveryDate(product.deliveryDays)}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="sm:text-right shrink-0">
                          <PriceDisplay
                            price={unitPrice * item.quantity}
                            size="md"
                            align="right"
                          />
                          {item.quantity > 1 && (
                            <div className="text-[11px] text-[#565959] tabular-nums mt-0.5">
                              {formatCurrency(unitPrice)} each
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Item Controls */}
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center border border-[#888C8C] rounded overflow-hidden bg-white">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.productId, item.variantId, item.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="px-2.5 py-1.5 hover:bg-[#F3F3F4] text-[#0F1111]"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3.5 py-1 text-[13px] font-semibold tabular-nums border-x border-[#D5D9D9]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.productId, item.variantId, item.quantity + 1)}
                            aria-label="Increase quantity"
                            className="px-2.5 py-1.5 hover:bg-[#F3F3F4] text-[#0F1111]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-[#D5D9D9]">|</span>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.productId, item.variantId)}
                          className="text-[13px] text-[#00668A] hover:text-[#CC0C39] hover:underline inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>

                        <span className="text-[#D5D9D9]">|</span>

                        <button
                          type="button"
                          onClick={() => onSaveForLater(item.productId, item.variantId)}
                          className="text-[13px] text-[#00668A] hover:text-[#8A5100] hover:underline inline-flex items-center gap-1"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                          Save for later
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-4 flex justify-end items-baseline gap-2">
                  <span className="text-[16px] text-[#0F1111]">
                    Subtotal ({totalCount} {totalCount === 1 ? 'item' : 'items'}):
                  </span>
                  <span className="text-[20px] font-bold text-[#0F1111] tabular-nums">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Saved for Later Box */}
          {resolvedSaved.length > 0 && (
            <div className="rt-card p-5 sm:p-6">
              <h2 className="text-[18px] font-bold text-[#0F1111] pb-3 mb-4 border-b border-[#D5D9D9]">
                Saved for Later ({resolvedSaved.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {resolvedSaved.map(({ item, product, variant, unitPrice }) => (
                  <div
                    key={`${item.productId}-${item.variantId}`}
                    className="p-3.5 rounded border border-[#D5D9D9] bg-[#F9F9F9] flex gap-3"
                  >
                    <ProductImage
                      src={product.image}
                      alt={product.shortTitle}
                      containerClassName="w-[80px] h-[64px] rounded border border-[#D5D9D9] shrink-0"
                      className={product.imageClassName ?? ''}
                    />
                    <div className="flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => onSelectProduct(product.id)}
                        className="text-left text-[13px] font-semibold text-[#0F1111] hover:text-[#8A5100] line-clamp-1"
                      >
                        {product.shortTitle}
                      </button>
                      <div className="text-[12px] text-[#565959]">{variant.label}</div>
                      <div className="text-[14px] font-bold text-[#0F1111] tabular-nums mt-0.5">
                        {formatCurrency(unitPrice)}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onMoveToCart(item.productId, item.variantId)}
                          className="rt-btn-secondary px-2.5 py-1 text-[12px] cursor-pointer"
                        >
                          Move to Cart
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveSavedForLater(item.productId, item.variantId)}
                          className="text-[12px] text-[#565959] hover:text-[#CC0C39]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 4 Columns: Sticky Order Summary */}
        <aside className="lg:col-span-4 lg:sticky lg:top-[122px] space-y-4">
          <div className="rt-card p-5 space-y-4">
            <div className="p-3 rounded bg-[#F0FAF7] border border-[#067D62]/30 flex items-start gap-2.5 text-[12px] text-[#0F1111]">
              <Zap className="w-4 h-4 text-[#067D62] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#067D62]">Free Next-Day Express Unlocked.</strong>{' '}
                Select Express Shipping at checkout at no extra charge.
              </div>
            </div>

            <div className="space-y-2 text-[14px] tabular-nums">
              <div className="flex justify-between">
                <span className="text-[#565959]">Items ({totalCount}):</span>
                <span className="font-medium text-[#0F1111]">{formatCurrency(subtotal)}</span>
              </div>

              {appliedPromo && (
                <div className="flex justify-between text-[#067D62] font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    Promo ({appliedPromo.code})
                    <button
                      type="button"
                      onClick={onClearPromo}
                      className="text-[11px] underline text-[#565959] hover:text-[#CC0C39]"
                    >
                      Remove
                    </button>
                  </span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-[#565959]">Express Shipping:</span>
                <span className="font-semibold text-[#067D62]">FREE</span>
              </div>

              <div className="pt-3 border-t border-[#D5D9D9] flex items-baseline justify-between">
                <span className="text-[16px] font-bold text-[#0F1111]">Estimated Subtotal:</span>
                <span className="text-[22px] font-bold text-[#0F1111]">
                  {formatCurrency(estimatedTotal)}
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={resolvedCart.length === 0}
              onClick={onProceedToCheckout}
              className="rt-btn-primary w-full py-2.5 px-4 text-[14px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Promo Code Form */}
            <div className="pt-3 border-t border-[#E2E2E2]">
              <label htmlFor="promo-code" className="block text-[12px] font-semibold text-[#0F1111] mb-1.5">
                Promotional Code (Try <span className="text-[#8A5100]">SAVE10</span> or <span className="text-[#8A5100]">MERIDIAN15</span>)
              </label>
              <form onSubmit={handlePromoSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-[#565959] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="promo-code"
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Enter promo code"
                    className="rt-input w-full pl-8 pr-2.5 py-1.5 text-[13px] uppercase"
                  />
                </div>
                <button
                  type="submit"
                  className="rt-btn-secondary px-3.5 py-1.5 text-[13px] whitespace-nowrap cursor-pointer"
                >
                  Apply
                </button>
              </form>
              {promoFeedback && (
                <p
                  className={`mt-1.5 text-[12px] flex items-center gap-1 ${
                    promoFeedback.ok ? 'text-[#067D62]' : 'text-[#CC0C39]'
                  }`}
                >
                  {promoFeedback.ok && <Check className="w-3.5 h-3.5" />}
                  {promoFeedback.text}
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-[#E2E2E2] flex items-center gap-2 text-[12px] text-[#565959]">
              <ShieldCheck className="w-4 h-4 text-[#232F3E] shrink-0" />
              <span>Protected by Meridian Direct 2-Year Warranty &amp; 30-Day Free Returns.</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
