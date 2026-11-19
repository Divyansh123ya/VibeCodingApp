import React, { useState, useEffect } from 'react';
import { Bell, X, Mail, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { PriceAlert, Product, ProductVariant } from '../types';
import { formatCurrency } from '../utils/format';
import { ProductImage } from './ProductImage';

interface PriceAlertModalProps {
  open: boolean;
  product: Product;
  variant: ProductVariant;
  currentPrice: number;
  existingAlert?: PriceAlert;
  defaultEmail: string;
  onClose: () => void;
  onSave: (data: {
    productId: string;
    variantId: string;
    variantLabel: string;
    email: string;
    targetPrice: number;
    currentPriceAtCreation: number;
  }) => void;
  onRemove?: (alertId: string) => void;
}

const DROP_PRESETS = [5, 10, 15, 20];

export function PriceAlertModal({
  open,
  product,
  variant,
  currentPrice,
  existingAlert,
  defaultEmail,
  onClose,
  onSave,
  onRemove,
}: PriceAlertModalProps) {
  const defaultTarget = Number((currentPrice * 0.9).toFixed(2));
  const [email, setEmail] = useState(existingAlert?.email ?? defaultEmail);
  const [targetInput, setTargetInput] = useState(
    (existingAlert?.targetPrice ?? defaultTarget).toFixed(2)
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setEmail(existingAlert?.email ?? defaultEmail);
      setTargetInput(
        (existingAlert?.targetPrice ?? Number((currentPrice * 0.9).toFixed(2))).toFixed(2)
      );
      setError(null);
    }
  }, [open, existingAlert, defaultEmail, currentPrice]);

  if (!open) return null;

  const parsedTarget = Number(targetInput);
  const isTargetValid =
    !Number.isNaN(parsedTarget) && parsedTarget > 0 && parsedTarget < currentPrice;
  const savingsAmount = isTargetValid ? currentPrice - parsedTarget : 0;
  const savingsPercent = isTargetValid
    ? Math.round((savingsAmount / currentPrice) * 100)
    : 0;

  const handlePresetClick = (pct: number) => {
    const calculated = Math.max(1, Number((currentPrice * (1 - pct / 100)).toFixed(2)));
    setTargetInput(calculated.toFixed(2));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedEmail)) {
      setError('Please enter a valid email address for price drop notifications.');
      return;
    }

    if (Number.isNaN(parsedTarget) || parsedTarget <= 0) {
      setError('Please enter a valid target price greater than ₹0.00.');
      return;
    }

    if (parsedTarget >= currentPrice) {
      setError(
        `Target price must be lower than the current price (${formatCurrency(currentPrice)}).`
      );
      return;
    }

    onSave({
      productId: product.id,
      variantId: variant.id,
      variantLabel: variant.label,
      email: trimmedEmail,
      targetPrice: Number(parsedTarget.toFixed(2)),
      currentPriceAtCreation: currentPrice,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#131A22]/75 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="price-alert-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg border border-[#D5D9D9] max-w-[500px] w-full overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header (#232F3E Secondary) */}
        <div className="px-5 py-3.5 bg-[#232F3E] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#FF9900]" />
            <h2 id="price-alert-modal-title" className="text-[15px] font-bold">
              {existingAlert ? 'Manage Price Drop Alert' : 'Set Price Drop Alert'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close price alert modal"
            className="p-1 text-[#CCCCCC] hover:text-white rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Product Summary Context */}
          <div className="p-3 rounded border border-[#E2E2E2] bg-[#F9F9F9] flex items-center gap-3">
            <ProductImage
              src={product.image}
              alt={product.shortTitle}
              containerClassName="w-[68px] h-[52px] rounded border border-[#D5D9D9] shrink-0"
              className={product.imageClassName ?? ''}
            />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-[#0F1111] truncate">
                {product.shortTitle}
              </div>
              <div className="text-[12px] text-[#565959] truncate">
                {variant.label}
              </div>
              <div className="text-[12px] text-[#565959] mt-0.5 tabular-nums">
                Current price:{' '}
                <strong className="text-[#0F1111] font-bold">
                  {formatCurrency(currentPrice)}
                </strong>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded border border-[#CC0C39] bg-[#FFF2F4] text-[#CC0C39] text-[12px] font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Target Price Field & Quick Drop Selectors */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="alert-target-price"
                className="text-[13px] font-semibold text-[#0F1111]"
              >
                Notify me when price drops to or below
              </label>
              {isTargetValid && (
                <span className="text-[12px] font-semibold text-[#CC0C39] tabular-nums">
                  Save {formatCurrency(savingsAmount)} ({savingsPercent}%)
                </span>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-[#565959]">
                ₹
              </span>
              <input
                id="alert-target-price"
                type="number"
                step="0.01"
                min="1"
                max={Math.max(1, currentPrice - 0.01).toFixed(2)}
                required
                value={targetInput}
                onChange={(e) => {
                  setTargetInput(e.target.value);
                  setError(null);
                }}
                className="rt-input w-full pl-7 pr-3 py-2 text-[15px] font-semibold tabular-nums"
              />
            </div>

            {/* Quick Drop Preset Buttons */}
            <div className="mt-2 grid grid-cols-4 gap-2">
              {DROP_PRESETS.map((pct) => {
                const presetVal = Number((currentPrice * (1 - pct / 100)).toFixed(2));
                const isSelected = Math.abs(parsedTarget - presetVal) < 0.02;
                return (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handlePresetClick(pct)}
                    className={`py-1.5 px-2 rounded border text-[12px] font-medium tabular-nums cursor-pointer ${
                      isSelected
                        ? 'border-[#FF9900] bg-[#FFF8EB] text-[#8A5100] font-semibold'
                        : 'border-[#D5D9D9] bg-white text-[#0F1111] hover:bg-[#F7FAFA]'
                    }`}
                  >
                    -{pct}% ({formatCurrency(presetVal)})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Email Notification Address */}
          <div>
            <label
              htmlFor="alert-email"
              className="block text-[13px] font-semibold text-[#0F1111] mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#565959] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="alert-email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="you@example.com"
                className="rt-input w-full pl-9 pr-3 py-2 text-[14px]"
              />
            </div>
            <p className="mt-1.5 text-[12px] text-[#565959] leading-[17px]">
              We monitor verified Meridian Direct pricing continuously and send a single email alert when the price meets your threshold.
            </p>
          </div>

          {existingAlert && (
            <div className="p-2.5 rounded bg-[#F0FAF7] border border-[#067D62]/30 text-[12px] text-[#067D62] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                Active alert set on {existingAlert.createdAt} for{' '}
                <strong className="tabular-nums">{formatCurrency(existingAlert.targetPrice)}</strong>
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 border-t border-[#E2E2E2] flex flex-wrap items-center justify-between gap-2.5">
            {existingAlert && onRemove ? (
              <button
                type="button"
                onClick={() => {
                  onRemove(existingAlert.id);
                  onClose();
                }}
                className="text-[13px] font-medium text-[#CC0C39] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Remove Alert
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="rt-btn-secondary px-4 py-2 text-[13px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rt-btn-primary px-5 py-2 text-[13px] cursor-pointer"
              >
                {existingAlert ? 'Update Price Alert' : 'Enable Price Alert'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
