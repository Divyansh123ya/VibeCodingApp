import { useState } from 'react';
import {
  PackageCheck,
  Search,
  CheckCircle2,
  Circle,
  FileText,
  X,
  Bookmark,
  ShoppingCart,
  Trash2,
  Bell,
  Mail,
} from 'lucide-react';
import { Order, PriceAlert, Product } from '../types';
import { formatCurrency } from '../utils/format';
import { PriceDisplay } from './PriceDisplay';
import { ProductImage } from './ProductImage';
import { StarRating } from './StarRating';

interface OrdersScreenProps {
  orders: Order[];
  products: Product[];
  savedIds: string[];
  priceAlerts: PriceAlert[];
  initialTab?: 'orders' | 'saved' | 'alerts';
  onSelectProduct: (productId: string) => void;
  onBuyAgain: (productId: string) => void;
  onToggleSave: (productId: string) => void;
  onRemovePriceAlert: (alertId: string) => void;
  onContinueShopping: () => void;
}

export function OrdersScreen({
  orders,
  products,
  savedIds,
  priceAlerts,
  initialTab = 'orders',
  onSelectProduct,
  onBuyAgain,
  onToggleSave,
  onRemovePriceAlert,
  onContinueShopping,
}: OrdersScreenProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'saved' | 'alerts'>(initialTab);
  const [orderSearch, setOrderSearch] = useState('');
  const [expandedTrackingId, setExpandedTrackingId] = useState<string | null>(
    orders[0]?.id ?? null
  );
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((order) => {
    if (!orderSearch.trim()) return true;
    const q = orderSearch.toLowerCase();
    return (
      order.id.toLowerCase().includes(q) ||
      order.items.some(
        (i) =>
          i.title.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q)
      )
    );
  });

  const savedProducts = products.filter((p) => savedIds.includes(p.id));

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6 pb-12 space-y-5">
      {/* Page Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] leading-[32px] font-bold text-[#0F1111]">
            Your Orders &amp; Hardware Lists
          </h1>
          <p className="text-[13px] text-[#565959]">
            Track shipments, inspect itemized invoices, and manage saved hardware.
          </p>
        </div>

        <div className="inline-flex p-1 bg-white border border-[#D5D9D9] rounded-md self-start">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-1.5 rounded text-[13px] font-semibold cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#232F3E] text-white'
                : 'text-[#0F1111] hover:bg-[#F3F3F4]'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-1.5 rounded text-[13px] font-semibold cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-[#232F3E] text-white'
                : 'text-[#0F1111] hover:bg-[#F3F3F4]'
            }`}
          >
            Saved List ({savedProducts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-1.5 rounded text-[13px] font-semibold cursor-pointer ${
              activeTab === 'alerts'
                ? 'bg-[#232F3E] text-white'
                : 'text-[#0F1111] hover:bg-[#F3F3F4]'
            }`}
          >
            Price Alerts ({priceAlerts.length})
          </button>
        </div>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="rt-card p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="text-[13px] text-[#565959]">
              Showing <strong className="text-[#0F1111] tabular-nums">{filteredOrders.length}</strong>{' '}
              {filteredOrders.length === 1 ? 'order' : 'orders'}
            </div>
            <div className="relative w-full sm:w-[290px]">
              <Search className="w-4 h-4 text-[#565959] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search order # or product..."
                className="rt-input w-full pl-9 pr-3 py-1.5 text-[13px]"
              />
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="rt-card p-12 text-center">
              <PackageCheck className="w-12 h-12 text-[#888C8C] mx-auto mb-3" strokeWidth={1.5} />
              <h2 className="text-[18px] font-semibold text-[#0F1111] mb-1">
                No matching orders found
              </h2>
              <p className="text-[13px] text-[#565959] mb-4">
                Try clearing your search filter or place a new order from the catalog.
              </p>
              <button
                type="button"
                onClick={onContinueShopping}
                className="rt-btn-primary px-5 py-2 text-[13px] cursor-pointer"
              >
                Explore Storefront
              </button>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const trackingOpen = expandedTrackingId === order.id;
              return (
                <article key={order.id} className="rt-card overflow-hidden">
                  {/* Order Meta Strip */}
                  <div className="px-5 py-3.5 bg-[#F3F3F4] border-b border-[#D5D9D9] grid grid-cols-2 sm:grid-cols-4 gap-4 text-[12px]">
                    <div>
                      <div className="uppercase tracking-wider text-[#565959] text-[10px] font-semibold">
                        Order Placed
                      </div>
                      <div className="text-[#0F1111] font-medium mt-0.5">{order.placedDate}</div>
                    </div>
                    <div>
                      <div className="uppercase tracking-wider text-[#565959] text-[10px] font-semibold">
                        Total
                      </div>
                      <div className="text-[#0F1111] font-bold tabular-nums mt-0.5">
                        {formatCurrency(order.total)}
                      </div>
                    </div>
                    <div>
                      <div className="uppercase tracking-wider text-[#565959] text-[10px] font-semibold">
                        Ship To
                      </div>
                      <div className="text-[#0F1111] font-medium mt-0.5 truncate">
                        {order.shippingAddress.fullName}
                      </div>
                    </div>
                    <div className="sm:text-right">
                      <div className="uppercase tracking-wider text-[#565959] text-[10px] font-semibold">
                        Order # {order.id}
                      </div>
                      <button
                        type="button"
                        onClick={() => setInvoiceOrder(order)}
                        className="mt-0.5 text-[#00668A] hover:text-[#8A5100] hover:underline font-medium inline-flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        View Invoice
                      </button>
                    </div>
                  </div>

                  {/* Order Body */}
                  <div className="p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-[16px] font-bold text-[#0F1111]">
                          {order.status}
                        </div>
                        <div className="text-[13px] text-[#067D62] font-medium">
                          {order.estimatedDelivery}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedTrackingId((curr) => (curr === order.id ? null : order.id))
                        }
                        className="rt-btn-secondary px-3.5 py-1.5 text-[13px] cursor-pointer"
                      >
                        {trackingOpen ? 'Hide Tracking' : 'Track Package'}
                      </button>
                    </div>

                    {/* Expandable Tracking Timeline */}
                    {trackingOpen && (
                      <div className="p-4 rounded border border-[#D5D9D9] bg-[#F9F9F9]">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          {order.trackingSteps.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              {step.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-[#067D62] shrink-0 mt-0.5" />
                              ) : (
                                <Circle className="w-4 h-4 text-[#8D9494] shrink-0 mt-0.5" />
                              )}
                              <div>
                                <div
                                  className={`text-[12px] font-semibold ${
                                    step.completed ? 'text-[#0F1111]' : 'text-[#565959]'
                                  }`}
                                >
                                  {step.label}
                                </div>
                                <div className="text-[11px] text-[#565959]">{step.timestamp}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Items */}
                    <div className="divide-y divide-[#EEEEEE]">
                      {order.items.map((item) => (
                        <div
                          key={`${item.productId}-${item.variantLabel}`}
                          className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center gap-4"
                        >
                          <button
                            type="button"
                            onClick={() => onSelectProduct(item.productId)}
                            className="w-[88px] h-[68px] rounded border border-[#D5D9D9] overflow-hidden shrink-0 bg-white"
                          >
                            <ProductImage
                              src={item.image}
                              alt={item.title}
                              containerClassName="w-full h-full"
                              className={item.imageClassName ?? ''}
                            />
                          </button>

                          <div className="flex-1 min-w-0">
                            <button
                              type="button"
                              onClick={() => onSelectProduct(item.productId)}
                              className="text-left text-[14px] font-semibold text-[#00668A] hover:text-[#8A5100] hover:underline"
                            >
                              {item.title}
                            </button>
                            <div className="text-[12px] text-[#565959] mt-0.5">
                              {item.brand} · {item.variantLabel} · Qty {item.quantity} ·{' '}
                              <span className="tabular-nums font-medium text-[#0F1111]">
                                {formatCurrency(item.unitPrice)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => onBuyAgain(item.productId)}
                              className="rt-btn-primary px-3.5 py-1.5 text-[12px] whitespace-nowrap cursor-pointer"
                            >
                              Buy It Again
                            </button>
                            <button
                              type="button"
                              onClick={() => onSelectProduct(item.productId)}
                              className="rt-btn-secondary px-3 py-1.5 text-[12px] whitespace-nowrap cursor-pointer"
                            >
                              View Item
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}

      {/* Saved List Tab */}
      {activeTab === 'saved' && (
        <div>
          {savedProducts.length === 0 ? (
            <div className="rt-card p-12 text-center">
              <Bookmark className="w-12 h-12 text-[#888C8C] mx-auto mb-3" strokeWidth={1.5} />
              <h2 className="text-[18px] font-semibold text-[#0F1111] mb-1">
                Your Saved Hardware List is empty
              </h2>
              <p className="text-[13px] text-[#565959] mb-5">
                Click the bookmark icon on any product card to track prices and compare hardware later.
              </p>
              <button
                type="button"
                onClick={onContinueShopping}
                className="rt-btn-primary px-5 py-2 text-[13px] cursor-pointer"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedProducts.map((product) => (
                <div key={product.id} className="rt-card p-4 flex flex-col justify-between">
                  <div>
                    <button
                      type="button"
                      onClick={() => onSelectProduct(product.id)}
                      className="block w-full text-left"
                    >
                      <ProductImage
                        src={product.image}
                        alt={product.shortTitle}
                        containerClassName="aspect-[4/3] w-full rounded border border-[#EEEEEE] mb-3"
                        className={product.imageClassName ?? ''}
                      />
                      <div className="text-[12px] text-[#565959] mb-0.5">
                        {product.brand} · {product.department}
                      </div>
                      <h3 className="text-[15px] font-semibold text-[#0F1111] hover:text-[#8A5100] line-clamp-2 mb-2">
                        {product.shortTitle}
                      </h3>
                    </button>
                    <StarRating rating={product.rating} reviewCount={product.reviewCount} size="sm" />
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#EEEEEE] space-y-3">
                    <PriceDisplay price={product.price} listPrice={product.listPrice} size="md" />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onBuyAgain(product.id)}
                        className="rt-btn-primary flex-1 py-2 px-3 text-[13px] inline-flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Add to Cart
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleSave(product.id)}
                        aria-label={`Remove ${product.shortTitle} from saved list`}
                        className="rt-btn-secondary p-2 text-[#565959] hover:text-[#CC0C39] cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Price Alerts Tab */}
      {activeTab === 'alerts' && (
        <div>
          {priceAlerts.length === 0 ? (
            <div className="rt-card p-12 text-center">
              <Bell className="w-12 h-12 text-[#888C8C] mx-auto mb-3" strokeWidth={1.5} />
              <h2 className="text-[18px] font-semibold text-[#0F1111] mb-1">
                No active price drop alerts
              </h2>
              <p className="text-[13px] text-[#565959] mb-5">
                Open any product detail page and click &ldquo;Set Price Alert&rdquo; to subscribe to email notifications when prices drop.
              </p>
              <button
                type="button"
                onClick={onContinueShopping}
                className="rt-btn-primary px-5 py-2 text-[13px] cursor-pointer"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {priceAlerts.map((alert) => {
                const product = products.find((p) => p.id === alert.productId);
                if (!product) return null;
                const variant =
                  product.variants.find((v) => v.id === alert.variantId) ?? product.variants[0];
                const currentPrice = product.price + variant.priceDelta;

                return (
                  <article
                    key={alert.id}
                    className="rt-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <button
                      type="button"
                      onClick={() => onSelectProduct(product.id)}
                      className="w-full sm:w-[110px] aspect-[4/3] rounded border border-[#D5D9D9] bg-white overflow-hidden shrink-0"
                    >
                      <ProductImage
                        src={product.image}
                        alt={product.shortTitle}
                        containerClassName="w-full h-full"
                        className={product.imageClassName ?? ''}
                      />
                    </button>

                    <div className="flex-1 min-w-0 space-y-1">
                      <button
                        type="button"
                        onClick={() => onSelectProduct(product.id)}
                        className="text-left text-[15px] font-semibold text-[#00668A] hover:text-[#8A5100] hover:underline"
                      >
                        {product.shortTitle}
                      </button>
                      <div className="text-[12px] text-[#565959]">
                        {product.brand} · {alert.variantLabel} · Created {alert.createdAt}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[13px]">
                        <span className="tabular-nums text-[#565959]">
                          Current:{' '}
                          <strong className="text-[#0F1111]">
                            {formatCurrency(currentPrice)}
                          </strong>
                        </span>
                        <span className="tabular-nums text-[#004C69] font-semibold">
                          Alert Target: ≤ {formatCurrency(alert.targetPrice)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[12px] text-[#565959]">
                          <Mail className="w-3.5 h-3.5" />
                          {alert.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onSelectProduct(product.id)}
                        className="rt-btn-secondary px-3.5 py-1.5 text-[12px] whitespace-nowrap cursor-pointer"
                      >
                        View / Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemovePriceAlert(alert.id)}
                        aria-label={`Remove price alert for ${product.shortTitle}`}
                        className="rt-btn-secondary p-2 text-[#565959] hover:text-[#CC0C39] cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Invoice Modal */}
      {invoiceOrder && (
        <div
          className="fixed inset-0 z-50 bg-[#131A22]/75 flex items-center justify-center p-4"
          onClick={() => setInvoiceOrder(null)}
        >
          <div
            className="bg-white rounded-lg border border-[#D5D9D9] max-w-[600px] w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 bg-[#232F3E] text-white flex items-center justify-between">
              <div className="font-bold text-[15px]">
                Tax Invoice — Order #{invoiceOrder.id}
              </div>
              <button
                type="button"
                onClick={() => setInvoiceOrder(null)}
                aria-label="Close invoice"
                className="p-1 text-[#CCCCCC] hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-[13px]">
              <div className="flex justify-between gap-4 pb-3 border-b border-[#E2E2E2]">
                <div>
                  <div className="font-bold text-[#0F1111]">Meridian Direct India Pvt. Ltd.</div>
                  <div className="text-[#565959]">Outer Ring Road, Bellandur, Bengaluru, KA 560103</div>
                  <div className="text-[11px] text-[#565959] tabular-nums">GSTIN: 29AABCM4821K1Z5</div>
                </div>
                <div className="text-right">
                  <div className="text-[#565959]">Date: {invoiceOrder.placedDate}</div>
                  <div className="font-semibold text-[#0F1111]">{invoiceOrder.paymentSummary}</div>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#565959] mb-1">
                  Bill &amp; Ship To
                </div>
                <div className="font-semibold text-[#0F1111]">{invoiceOrder.shippingAddress.fullName}</div>
                <div className="text-[#565959]">
                  {invoiceOrder.shippingAddress.street}
                  {invoiceOrder.shippingAddress.apt ? `, ${invoiceOrder.shippingAddress.apt}` : ''} ·{' '}
                  {invoiceOrder.shippingAddress.city}, {invoiceOrder.shippingAddress.state}{' '}
                  {invoiceOrder.shippingAddress.zip}
                </div>
                <div className="text-[#565959] tabular-nums">
                  Mobile: {invoiceOrder.shippingAddress.phone}
                </div>
              </div>

              <div className="border border-[#D5D9D9] rounded overflow-hidden">
                <table className="w-full text-[12px]">
                  <thead className="bg-[#F3F3F4] border-b border-[#D5D9D9]">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold text-[#565959]">Item</th>
                      <th className="text-right px-3 py-2 font-semibold text-[#565959]">Qty</th>
                      <th className="text-right px-3 py-2 font-semibold text-[#565959]">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEEEEE]">
                    {invoiceOrder.items.map((item) => (
                      <tr key={`${item.productId}-${item.variantLabel}`}>
                        <td className="px-3 py-2 text-[#0F1111]">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-[#565959]">{item.variantLabel}</div>
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">{item.quantity}</td>
                        <td className="px-3 py-2 text-right font-semibold tabular-nums">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-1.5 text-right tabular-nums">
                <div className="text-[#565959]">
                  Subtotal: <span className="text-[#0F1111] font-medium ml-2">{formatCurrency(invoiceOrder.subtotal)}</span>
                </div>
                {invoiceOrder.discount > 0 && (
                  <div className="text-[#067D62]">
                    Promo Discount: <span className="font-medium ml-2">-{formatCurrency(invoiceOrder.discount)}</span>
                  </div>
                )}
                <div className="text-[#565959]">
                  Shipping: <span className="text-[#0F1111] font-medium ml-2">{invoiceOrder.shippingCost === 0 ? 'FREE' : formatCurrency(invoiceOrder.shippingCost)}</span>
                </div>
                <div className="text-[#565959]">
                  GST (18%): <span className="text-[#0F1111] font-medium ml-2">{formatCurrency(invoiceOrder.tax)}</span>
                </div>
                <div className="text-[16px] font-bold text-[#0F1111] pt-2 border-t border-[#E2E2E2]">
                  Grand Total: <span className="ml-2">{formatCurrency(invoiceOrder.total)}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setInvoiceOrder(null)}
                  className="rt-btn-secondary px-4 py-1.5 text-[13px] cursor-pointer"
                >
                  Close Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
