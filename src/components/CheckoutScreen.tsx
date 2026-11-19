import React, { useState } from 'react';
import {
  Lock,
  CheckCircle2,
  CreditCard,
  Banknote,
  FileText,
  Zap,
  Truck,
  Clock,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import {
  CartItem,
  DeliveryLocation,
  DeliverySpeed,
  Order,
  PaymentMethod,
  Product,
  ShippingAddress,
} from '../types';
import { formatCurrency, formatDeliveryDate } from '../utils/format';
import { ProductImage } from './ProductImage';

interface CheckoutScreenProps {
  items: CartItem[];
  products: Product[];
  location: DeliveryLocation;
  appliedPromo: { code: string; percent: number } | null;
  onBackToCart: () => void;
  onPlaceOrder: (order: Order) => void;
}

export function CheckoutScreen({
  items,
  products,
  location,
  appliedPromo,
  onBackToCart,
  onPlaceOrder,
}: CheckoutScreenProps) {
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: 'Aarav Sharma',
    street: '42, 12th Main Road, Indiranagar',
    apt: 'Flat 4B',
    city: location.city,
    state: location.state,
    zip: location.zip,
    phone: '98765 43210',
  });

  const [deliverySpeed, setDeliverySpeed] = useState<DeliverySpeed>('express');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('09/29');
  const [cardCvc, setCardCvc] = useState('842');
  const [poNumber, setPoNumber] = useState('PO-2026-119');
  const [formError, setFormError] = useState<string | null>(null);

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

  const subtotal = resolved.reduce((s, r) => s + r.unitPrice * r.item.quantity, 0);
  const discount = appliedPromo ? subtotal * (appliedPromo.percent / 100) : 0;
  const shippingCost = deliverySpeed === 'same-day' ? 199 : 0;
  const taxable = Math.max(0, subtotal - discount);
  const tax = Number((taxable * 0.18).toFixed(2));
  const total = Number((taxable + shippingCost + tax).toFixed(2));
  const itemCount = resolved.reduce((s, r) => s + r.item.quantity, 0);

  const estimatedDeliveryText =
    deliverySpeed === 'same-day'
      ? 'Today by 9:00 PM'
      : deliverySpeed === 'express'
      ? formatDeliveryDate(1)
      : formatDeliveryDate(4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.fullName.trim() || !address.street.trim() || !address.city.trim() || !address.zip.trim()) {
      setFormError('Please complete all required shipping address fields.');
      return;
    }
    const phoneDigits = address.phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
    if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
      setFormError('Please enter a valid 10-digit Indian mobile number (starting with 6–9).');
      return;
    }
    if (paymentMethod === 'card' && (!cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim())) {
      setFormError('Please provide valid payment card details.');
      return;
    }
    setFormError(null);

    const formattedIndianPhone = `+91 ${phoneDigits.slice(0, 5)} ${phoneDigits.slice(5)}`;
    const last4 = cardNumber.replace(/\D/g, '').slice(-4) || '4242';
    const paymentSummary =
      paymentMethod === 'card'
        ? `Visa ending in ${last4}`
        : paymentMethod === 'cod'
        ? 'Pay on Delivery (Cash or UPI at doorstep)'
        : `Business Net-30 GST Invoice (${poNumber || 'Standard'})`;

    const orderId = `MD-${Math.floor(800000 + Math.random() * 199000)}`;
    const newOrder: Order = {
      id: orderId,
      placedDate: 'November 19, 2026',
      estimatedDelivery: estimatedDeliveryText,
      status: 'Preparing Shipment',
      items: resolved.map(({ item, product, variant, unitPrice }) => ({
        productId: product.id,
        title: product.shortTitle,
        brand: product.brand,
        variantLabel: variant.label,
        unitPrice,
        quantity: item.quantity,
        image: product.image,
        imageClassName: product.imageClassName,
      })),
      subtotal,
      shippingCost,
      discount,
      tax,
      total,
      shippingAddress: { ...address, phone: formattedIndianPhone },
      deliverySpeed,
      paymentSummary,
      trackingSteps: [
        { label: 'Order Confirmed', timestamp: 'Nov 19, Just Now', completed: true },
        { label: 'Allocating Inventory at Fulfillment Hub', timestamp: 'In Progress', completed: false },
        { label: 'Out for Delivery', timestamp: `Scheduled ${estimatedDeliveryText}`, completed: false },
        { label: 'Delivered', timestamp: estimatedDeliveryText, completed: false },
      ],
    };

    onPlaceOrder(newOrder);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-5 pb-12">
      {/* Secure Checkout Sub-Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackToCart}
          className="text-[13px] font-medium text-[#00668A] hover:text-[#8A5100] hover:underline inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </button>

        <div className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#232F3E]">
          <Lock className="w-4 h-4 text-[#067D62]" />
          <span>Secure Encrypted Checkout ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left 8 Columns: Steps 1–4 */}
        <div className="lg:col-span-8 space-y-5">
          {formError && (
            <div className="p-3.5 rounded border border-[#CC0C39] bg-[#FFF2F4] text-[#CC0C39] text-[13px] font-medium">
              {formError}
            </div>
          )}

          {/* Step 1: Shipping Address */}
          <section className="rt-card p-5 sm:p-6">
            <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-[#E2E2E2]">
              <span className="w-6 h-6 rounded-full bg-[#232F3E] text-white text-[12px] font-bold flex items-center justify-center">
                1
              </span>
              <h2 className="text-[18px] font-bold text-[#0F1111]">Shipping Address</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="ship-name" className="block text-[13px] font-semibold text-[#0F1111] mb-1">
                  Full Name
                </label>
                <input
                  id="ship-name"
                  type="text"
                  required
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  className="rt-input w-full px-3 py-2 text-[14px]"
                />
              </div>

              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label htmlFor="ship-street" className="block text-[13px] font-semibold text-[#0F1111] mb-1">
                    Street Address
                  </label>
                  <input
                    id="ship-street"
                    type="text"
                    required
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    className="rt-input w-full px-3 py-2 text-[14px]"
                  />
                </div>
                <div>
                  <label htmlFor="ship-apt" className="block text-[13px] font-semibold text-[#0F1111] mb-1">
                    Apt / Suite
                  </label>
                  <input
                    id="ship-apt"
                    type="text"
                    value={address.apt}
                    onChange={(e) => setAddress({ ...address, apt: e.target.value })}
                    className="rt-input w-full px-3 py-2 text-[14px]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="ship-city" className="block text-[13px] font-semibold text-[#0F1111] mb-1">
                  City
                </label>
                <input
                  id="ship-city"
                  type="text"
                  required
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="rt-input w-full px-3 py-2 text-[14px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="ship-state" className="block text-[13px] font-semibold text-[#0F1111] mb-1">
                    State
                  </label>
                  <input
                    id="ship-state"
                    type="text"
                    required
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="rt-input w-full px-3 py-2 text-[14px]"
                  />
                </div>
                <div>
                  <label htmlFor="ship-zip" className="block text-[13px] font-semibold text-[#0F1111] mb-1">
                    PIN Code
                  </label>
                  <input
                    id="ship-zip"
                    type="text"
                    required
                    maxLength={6}
                    value={address.zip}
                    onChange={(e) => setAddress({ ...address, zip: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    placeholder="560038"
                    className="rt-input w-full px-3 py-2 text-[14px] tabular-nums"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="ship-phone" className="block text-[13px] font-semibold text-[#0F1111] mb-1">
                  Mobile Number (India +91, for delivery OTP &amp; updates)
                </label>
                <div className="flex items-stretch sm:max-w-[300px]">
                  <span className="inline-flex items-center px-3 bg-[#F3F3F4] border border-r-0 border-[#8D9494] rounded-l text-[13px] font-semibold text-[#0F1111] tabular-nums select-none">
                    +91
                  </span>
                  <input
                    id="ship-phone"
                    type="tel"
                    required
                    maxLength={11}
                    placeholder="98765 43210"
                    value={address.phone}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^\d\s]/g, '');
                      const digits = raw.replace(/\s/g, '').slice(0, 10);
                      const formatted =
                        digits.length > 5
                          ? `${digits.slice(0, 5)} ${digits.slice(5)}`
                          : digits;
                      setAddress({ ...address, phone: formatted });
                    }}
                    className="rt-input rounded-l-none flex-1 px-3 py-2 text-[14px] tabular-nums"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Step 2: Delivery Speed */}
          <section className="rt-card p-5 sm:p-6">
            <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-[#E2E2E2]">
              <span className="w-6 h-6 rounded-full bg-[#232F3E] text-white text-[12px] font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="text-[18px] font-bold text-[#0F1111]">Choose Delivery Speed</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  id: 'express' as DeliverySpeed,
                  title: 'Express Next-Day',
                  eta: formatDeliveryDate(1),
                  price: 'FREE',
                  desc: 'Insured courier with live doorstep tracking',
                  icon: Zap,
                },
                {
                  id: 'same-day' as DeliverySpeed,
                  title: 'Same-Day Priority',
                  eta: 'Today by 9:00 PM',
                  price: '₹199',
                  desc: 'Dedicated regional dispatch window',
                  icon: Clock,
                },
                {
                  id: 'standard' as DeliverySpeed,
                  title: 'Consolidated Ground',
                  eta: formatDeliveryDate(4),
                  price: 'FREE',
                  desc: 'Single-box low-emission ground transit',
                  icon: Truck,
                },
              ].map((option) => {
                const selected = deliverySpeed === option.id;
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setDeliverySpeed(option.id)}
                    className={`p-3.5 rounded text-left border cursor-pointer ${
                      selected
                        ? 'border-[#FF9900] bg-[#FFF8EB] ring-1 ring-[#FF9900]'
                        : 'border-[#D5D9D9] bg-white hover:bg-[#F7FAFA]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#0F1111]">
                        <Icon className="w-4 h-4 text-[#8A5100]" />
                        {option.title}
                      </span>
                      <span
                        className={`text-[12px] font-bold tabular-nums ${
                          option.price === 'FREE' ? 'text-[#067D62]' : 'text-[#0F1111]'
                        }`}
                      >
                        {option.price}
                      </span>
                    </div>
                    <div className="text-[13px] font-semibold text-[#00668A] mb-1">
                      {option.eta}
                    </div>
                    <p className="text-[12px] text-[#565959] leading-[16px]">
                      {option.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Step 3: Payment Method */}
          <section className="rt-card p-5 sm:p-6">
            <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-[#E2E2E2]">
              <span className="w-6 h-6 rounded-full bg-[#232F3E] text-white text-[12px] font-bold flex items-center justify-center">
                3
              </span>
              <h2 className="text-[18px] font-bold text-[#0F1111]">Payment Method</h2>
            </div>

            <div className="space-y-3">
              {/* Credit / Debit Card */}
              <div
                className={`p-4 rounded border ${
                  paymentMethod === 'card'
                    ? 'border-[#FF9900] bg-[#FFFDF8]'
                    : 'border-[#D5D9D9] bg-white'
                }`}
              >
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="w-4 h-4 accent-[#FF9900]"
                  />
                  <CreditCard className="w-4 h-4 text-[#232F3E]" />
                  <span className="text-[14px] font-semibold text-[#0F1111]">
                    Credit or Debit Card
                  </span>
                </label>

                {paymentMethod === 'card' && (
                  <div className="mt-3 pl-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label htmlFor="card-num" className="block text-[12px] font-medium text-[#565959] mb-1">
                        Card Number
                      </label>
                      <input
                        id="card-num"
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="rt-input w-full px-3 py-1.5 text-[13px] tabular-nums"
                      />
                    </div>
                    <div>
                      <label htmlFor="card-exp" className="block text-[12px] font-medium text-[#565959] mb-1">
                        Expiration
                      </label>
                      <input
                        id="card-exp"
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="rt-input w-full px-3 py-1.5 text-[13px] tabular-nums"
                      />
                    </div>
                    <div>
                      <label htmlFor="card-cvc" className="block text-[12px] font-medium text-[#565959] mb-1">
                        Security Code
                      </label>
                      <input
                        id="card-cvc"
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="rt-input w-full px-3 py-1.5 text-[13px] tabular-nums"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Cash on Delivery */}
              <div
                className={`p-4 rounded border ${
                  paymentMethod === 'cod'
                    ? 'border-[#FF9900] bg-[#FFFDF8]'
                    : 'border-[#D5D9D9] bg-white'
                }`}
              >
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="w-4 h-4 accent-[#FF9900]"
                  />
                  <Banknote className="w-4 h-4 text-[#232F3E]" />
                  <span className="text-[14px] font-semibold text-[#0F1111]">
                    Pay on Delivery (Cash or UPI at Doorstep)
                  </span>
                </label>
                {paymentMethod === 'cod' && (
                  <p className="mt-2 pl-6 text-[12px] text-[#565959]">
                    Pay the exact total ({formatCurrency(total)}) via Cash or UPI QR when our Meridian Express courier delivers your sealed package to {address.street}.
                  </p>
                )}
              </div>

              {/* Net-30 Corporate Invoice */}
              <div
                className={`p-4 rounded border ${
                  paymentMethod === 'invoice'
                    ? 'border-[#FF9900] bg-[#FFFDF8]'
                    : 'border-[#D5D9D9] bg-white'
                }`}
              >
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'invoice'}
                    onChange={() => setPaymentMethod('invoice')}
                    className="w-4 h-4 accent-[#FF9900]"
                  />
                  <FileText className="w-4 h-4 text-[#232F3E]" />
                  <span className="text-[14px] font-semibold text-[#0F1111]">
                    Business Net-30 Purchase Order
                  </span>
                </label>
                {paymentMethod === 'invoice' && (
                  <div className="mt-2.5 pl-6 max-w-[260px]">
                    <label htmlFor="po-num" className="block text-[12px] font-medium text-[#565959] mb-1">
                      PO Reference Number
                    </label>
                    <input
                      id="po-num"
                      type="text"
                      value={poNumber}
                      onChange={(e) => setPoNumber(e.target.value)}
                      className="rt-input w-full px-3 py-1.5 text-[13px] tabular-nums"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Step 4: Review Items */}
          <section className="rt-card p-5 sm:p-6">
            <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-[#E2E2E2]">
              <span className="w-6 h-6 rounded-full bg-[#232F3E] text-white text-[12px] font-bold flex items-center justify-center">
                4
              </span>
              <h2 className="text-[18px] font-bold text-[#0F1111]">Review Items &amp; Delivery</h2>
            </div>

            <div className="text-[14px] font-semibold text-[#067D62] mb-4">
              Estimated delivery: {estimatedDeliveryText}
            </div>

            <div className="divide-y divide-[#EEEEEE]">
              {resolved.map(({ item, product, variant, unitPrice }) => (
                <div key={`${item.productId}-${item.variantId}`} className="py-3 flex items-center gap-3.5">
                  <ProductImage
                    src={product.image}
                    alt={product.shortTitle}
                    containerClassName="w-[72px] h-[56px] rounded border border-[#D5D9D9] shrink-0"
                    className={product.imageClassName ?? ''}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-[#0F1111] truncate">
                      {product.shortTitle}
                    </div>
                    <div className="text-[12px] text-[#565959]">
                      {variant.label} · Qty: <strong className="text-[#0F1111]">{item.quantity}</strong>
                    </div>
                  </div>
                  <div className="text-[14px] font-bold text-[#0F1111] tabular-nums">
                    {formatCurrency(unitPrice * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right 4 Columns: Sticky Order Total & Place Order CTA */}
        <aside className="lg:col-span-4 lg:sticky lg:top-[122px]">
          <div className="rt-card p-5 space-y-4">
            <button
              type="submit"
              disabled={resolved.length === 0}
              className="rt-btn-primary w-full py-3 px-4 text-[15px] cursor-pointer disabled:opacity-50"
            >
              Place Your Order
            </button>

            <p className="text-[11px] leading-[16px] text-[#565959] text-center">
              By placing your order, you agree to Meridian Direct&apos;s privacy notice and 30-day return guarantee.
            </p>

            <hr className="border-[#E2E2E2]" />

            <h3 className="text-[16px] font-bold text-[#0F1111]">Order Summary</h3>

            <div className="space-y-2 text-[13px] tabular-nums">
              <div className="flex justify-between">
                <span className="text-[#565959]">Items ({itemCount}):</span>
                <span className="text-[#0F1111]">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#565959]">Shipping &amp; handling:</span>
                <span className={shippingCost === 0 ? 'text-[#067D62] font-semibold' : 'text-[#0F1111]'}>
                  {shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)}
                </span>
              </div>

              {discount > 0 && appliedPromo && (
                <div className="flex justify-between text-[#067D62] font-medium">
                  <span>Promo ({appliedPromo.code}):</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-[#565959]">Estimated GST (18%):</span>
                <span className="text-[#0F1111]">{formatCurrency(tax)}</span>
              </div>

              <div className="pt-3 border-t border-[#D5D9D9] flex items-baseline justify-between">
                <span className="text-[17px] font-bold text-[#CC0C39]">Order Total:</span>
                <span className="text-[22px] font-bold text-[#CC0C39]">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            <div className="p-3 rounded bg-[#F3F3F4] border border-[#D5D9D9] text-[12px] text-[#565959] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#232F3E] shrink-0 mt-0.5" />
              <span>
                All hardware ships sealed with full manufacturer serial registration and direct replacement support.
              </span>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}

interface OrderConfirmationScreenProps {
  order: Order;
  onViewOrders: () => void;
  onContinueShopping: () => void;
}

export function OrderConfirmationScreen({
  order,
  onViewOrders,
  onContinueShopping,
}: OrderConfirmationScreenProps) {
  return (
    <div className="max-w-[960px] mx-auto px-4 sm:px-6 pt-8 pb-14">
      <div className="rt-card overflow-hidden">
        {/* Confirmation Banner */}
        <div className="p-6 sm:p-8 bg-[#F0FAF7] border-b border-[#067D62]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <CheckCircle2 className="w-8 h-8 text-[#067D62] shrink-0 mt-0.5" />
            <div>
              <h1 className="text-[22px] sm:text-[24px] font-bold text-[#0F1111]">
                Order #{order.id} Confirmed — Preparing Shipment
              </h1>
              <p className="text-[14px] text-[#565959] mt-1">
                Confirmation sent. Estimated arrival:{' '}
                <strong className="text-[#0F1111]">{order.estimatedDelivery}</strong>
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right tabular-nums">
            <div className="text-[12px] text-[#565959]">Total Charged</div>
            <div className="text-[24px] font-bold text-[#0F1111]">
              {formatCurrency(order.total)}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[13px]">
            <div className="p-4 rounded border border-[#D5D9D9] bg-[#F9F9F9]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#565959] mb-1.5">
                Shipping To
              </div>
              <div className="font-semibold text-[#0F1111]">{order.shippingAddress.fullName}</div>
              <div className="text-[#565959]">
                {order.shippingAddress.street}
                {order.shippingAddress.apt ? `, ${order.shippingAddress.apt}` : ''}
              </div>
              <div className="text-[#565959]">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
              </div>
              <div className="text-[#565959] tabular-nums mt-0.5">
                {order.shippingAddress.phone}
              </div>
            </div>

            <div className="p-4 rounded border border-[#D5D9D9] bg-[#F9F9F9]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#565959] mb-1.5">
                Payment Method
              </div>
              <div className="font-semibold text-[#0F1111]">{order.paymentSummary}</div>
              <div className="text-[#565959] mt-1">Placed on {order.placedDate}</div>
            </div>

            <div className="p-4 rounded border border-[#D5D9D9] bg-[#F9F9F9]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#565959] mb-1.5">
                Order Receipt Summary
              </div>
              <div className="flex justify-between tabular-nums">
                <span className="text-[#565959]">Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between tabular-nums text-[#067D62]">
                  <span>Discount:</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between tabular-nums">
                <span className="text-[#565959]">Tax:</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between font-bold tabular-nums pt-1 mt-1 border-t border-[#D5D9D9]">
                <span>Total:</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Itemized Receipt */}
          <div>
            <h2 className="text-[15px] font-bold text-[#0F1111] mb-3">Items in This Shipment</h2>
            <div className="border border-[#D5D9D9] rounded divide-y divide-[#EEEEEE]">
              {order.items.map((item) => (
                <div key={`${item.productId}-${item.variantLabel}`} className="p-4 flex items-center gap-4">
                  <ProductImage
                    src={item.image}
                    alt={item.title}
                    containerClassName="w-[76px] h-[58px] rounded border border-[#D5D9D9] shrink-0"
                    className={item.imageClassName ?? ''}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-[#0F1111]">{item.title}</div>
                    <div className="text-[12px] text-[#565959]">
                      {item.brand} · {item.variantLabel} · Qty {item.quantity}
                    </div>
                  </div>
                  <div className="text-[14px] font-bold text-[#0F1111] tabular-nums">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onViewOrders}
              className="rt-btn-primary px-6 py-2.5 text-[14px] cursor-pointer"
            >
              Track Order in Your Orders
            </button>
            <button
              type="button"
              onClick={onContinueShopping}
              className="rt-btn-secondary px-5 py-2.5 text-[14px] cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
