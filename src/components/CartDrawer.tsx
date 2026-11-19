import { X, Trash2, Plus, Minus, ShoppingCart, Zap, ArrowRight } from 'lucide-react';
import { CartItem, Product } from '../types';
import { formatCurrency } from '../utils/format';
import { ProductImage } from './ProductImage';

interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  products: Product[];
  onClose: () => void;
  onUpdateQty: (productId: string, variantId: string, qty: number) => void;
  onRemoveItem: (productId: string, variantId: string) => void;
  onViewFullCart: () => void;
  onProceedToCheckout: () => void;
  onSelectProduct: (productId: string) => void;
}

export function CartDrawer({
  open,
  items,
  products,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onViewFullCart,
  onProceedToCheckout,
  onSelectProduct,
}: CartDrawerProps) {
  if (!open) return null;

  const resolved = items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
      const variant =
        product.variants.find((v) => v.id === item.variantId) ?? product.variants[0];
      const unitPrice = product.price + variant.priceDelta;
      return { item, product, variant, unitPrice };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  const subtotal = resolved.reduce((sum, r) => sum + r.unitPrice * r.item.quantity, 0);
  const totalCount = resolved.reduce((sum, r) => sum + r.item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Shopping cart drawer">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#131A22]/60"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative z-10 w-full max-w-[420px] bg-white h-full flex flex-col shadow-2xl border-l border-[#D5D9D9]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#131A22] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="w-5 h-5 text-[#FF9900]" />
            <h2 className="text-[16px] font-bold">
              Shopping Cart <span className="text-[#CCCCCC] font-normal tabular-nums">({totalCount})</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart drawer"
            className="p-1.5 text-[#CCCCCC] hover:text-white rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Express Shipping Notice */}
        {resolved.length > 0 && (
          <div className="px-5 py-2.5 bg-[#F3F3F4] border-b border-[#D5D9D9] flex items-center gap-2 text-[12px] text-[#0F1111]">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#232F3E] text-white text-[10px] font-bold uppercase tracking-wider rounded-sm shrink-0">
              <Zap className="w-3 h-3 text-[#FF9900] fill-[#FF9900]" />
              Express
            </span>
            <span>Your order qualifies for FREE Next-Day Express Delivery.</span>
          </div>
        )}

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {resolved.length === 0 ? (
            <div className="py-16 text-center">
              <ShoppingCart className="w-12 h-12 text-[#888C8C] mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-[16px] font-semibold text-[#0F1111] mb-1">
                Your Meridian Direct Cart is empty
              </h3>
              <p className="text-[13px] text-[#565959] mb-5">
                Explore studio audio, workstations, and smart home hardware with next-day Express delivery.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="rt-btn-primary px-5 py-2 text-[13px] cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            resolved.map(({ item, product, variant, unitPrice }) => (
              <div
                key={`${item.productId}-${item.variantId}`}
                className="flex gap-3.5 pb-4 border-b border-[#EEEEEE] last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectProduct(product.id);
                  }}
                  className="w-[84px] h-[68px] shrink-0 rounded border border-[#D5D9D9] overflow-hidden bg-white"
                >
                  <ProductImage
                    src={product.image}
                    alt={product.shortTitle}
                    containerClassName="w-full h-full"
                    className={product.imageClassName ?? ''}
                  />
                </button>

                <div className="flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectProduct(product.id);
                    }}
                    className="text-left text-[13px] font-semibold text-[#0F1111] hover:text-[#8A5100] line-clamp-2 leading-[18px]"
                  >
                    {product.shortTitle}
                  </button>
                  <div className="text-[12px] text-[#565959] mt-0.5">
                    {variant.label}
                  </div>
                  <div className="text-[14px] font-bold text-[#0F1111] mt-1 tabular-nums">
                    {formatCurrency(unitPrice * item.quantity)}
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="inline-flex items-center border border-[#888C8C] rounded overflow-hidden">
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.productId, item.variantId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="px-2 py-1 hover:bg-[#F3F3F4] text-[#0F1111]"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2.5 py-1 text-[12px] font-semibold tabular-nums border-x border-[#D5D9D9]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.productId, item.variantId, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="px-2 py-1 hover:bg-[#F3F3F4] text-[#0F1111]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.productId, item.variantId)}
                      className="text-[12px] text-[#565959] hover:text-[#CC0C39] inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Totals & CTAs */}
        {resolved.length > 0 && (
          <div className="p-5 border-t border-[#D5D9D9] bg-[#F9F9F9] space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[14px] font-medium text-[#565959]">
                Subtotal ({totalCount} {totalCount === 1 ? 'item' : 'items'})
              </span>
              <span className="text-[20px] font-bold text-[#0F1111] tabular-nums">
                {formatCurrency(subtotal)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="rt-btn-primary w-full py-2.5 px-4 text-[14px] flex items-center justify-center gap-2 cursor-pointer"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onViewFullCart();
              }}
              className="rt-btn-secondary w-full py-2 px-4 text-[13px] cursor-pointer"
            >
              View Full Cart &amp; Promo Codes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
