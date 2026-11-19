import { useState, useMemo, useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { INITIAL_ORDERS, INITIAL_PRODUCTS } from './data/catalog';
import {
  CartItem,
  DeliveryLocation,
  Department,
  Order,
  PriceAlert,
  Product,
  ProductReview,
  ScreenView,
  SortOption,
} from './types';
import { Header } from './components/Header';
import { CatalogScreen } from './components/CatalogScreen';
import { ProductDetailScreen } from './components/ProductDetailScreen';
import { CartDrawer } from './components/CartDrawer';
import { CartScreen } from './components/CartScreen';
import { CheckoutScreen, OrderConfirmationScreen } from './components/CheckoutScreen';
import { OrdersScreen } from './components/OrdersScreen';
import { Footer } from './components/Footer';
import { formatCurrency } from './utils/format';

export default function App() {
  const initialQuery = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const prodId = params.get('product');
    const varId = params.get('variant') ?? undefined;
    const matched = prodId ? INITIAL_PRODUCTS.find((p) => p.id === prodId) : undefined;
    return { matchedProductId: matched?.id, variantId: matched ? varId : undefined };
  }, []);

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [screen, setScreen] = useState<ScreenView>(
    initialQuery.matchedProductId ? 'product' : 'catalog'
  );
  const [activeProductId, setActiveProductId] = useState<string>(
    initialQuery.matchedProductId ?? INITIAL_PRODUCTS[0].id
  );
  const [activeInitialVariantId, setActiveInitialVariantId] = useState<string | undefined>(
    initialQuery.variantId
  );

  // Catalog Filters
  const [selectedDepartment, setSelectedDepartment] = useState<Department>('All Products');
  const [searchQuery, setSearchQuery] = useState('');
  const [dealsOnly, setDealsOnly] = useState(false);
  const [expressOnly, setExpressOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [priceRange, setPriceRange] = useState<[number | null, number | null]>([null, null]);
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  // Delivery Location
  const [location, setLocation] = useState<DeliveryLocation>({
    city: 'Bengaluru',
    state: 'KA',
    zip: '560038',
  });

  // Cart, Saved Items & Orders
  const [cart, setCart] = useState<CartItem[]>([
    { productId: 'aura-anc-pro', variantId: 'graphite', quantity: 1 },
  ]);
  const [savedForLater, setSavedForLater] = useState<CartItem[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>(['keyforge-75-pro', 'barista-precision-9']);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [ordersTab, setOrdersTab] = useState<'orders' | 'saved' | 'alerts'>('orders');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; percent: number } | null>(null);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => {
    try {
      const raw = window.localStorage.getItem('meridian_price_alerts');
      return raw ? (JSON.parse(raw) as PriceAlert[]) : [];
    } catch {
      return [];
    }
  });
  const [defaultAlertEmail, setDefaultAlertEmail] = useState<string>(() => {
    try {
      return window.localStorage.getItem('meridian_alert_email') ?? '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('meridian_price_alerts', JSON.stringify(priceAlerts));
    } catch {
      // Ignore storage quota errors
    }
  }, [priceAlerts]);

  useEffect(() => {
    try {
      if (defaultAlertEmail) {
        window.localStorage.setItem('meridian_alert_email', defaultAlertEmail);
      }
    } catch {
      // Ignore storage quota errors
    }
  }, [defaultAlertEmail]);

  // Load persisted Orders & Reviews from Neon Postgres via Vercel Serverless Functions
  useEffect(() => {
    fetch('/api/orders')
      .then((r) => (r.ok ? r.json() : []))
      .then((dbOrders: Order[]) => {
        if (Array.isArray(dbOrders) && dbOrders.length > 0) {
          setOrders((prev) => {
            const existingIds = new Set(dbOrders.map((o) => o.id));
            return [...dbOrders, ...prev.filter((o) => !existingIds.has(o.id))];
          });
        }
      })
      .catch((err) => console.error('Failed to load orders from Neon:', err));

    fetch('/api/reviews')
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: { product_id: string; review_data: ProductReview }[]) => {
        if (Array.isArray(rows) && rows.length > 0) {
          setProducts((prev) =>
            prev.map((p) => {
              const extra = rows
                .filter((r) => r.product_id === p.id)
                .map((r) => r.review_data);
              if (extra.length === 0) return p;

              const existingReviewIds = new Set(p.reviews.map((rev) => rev.id));
              const uniqueExtra = extra.filter((rev) => !existingReviewIds.has(rev.id));
              if (uniqueExtra.length === 0) return p;

              const totalCount = p.reviewCount + uniqueExtra.length;
              const extraSum = uniqueExtra.reduce((s, r) => s + r.rating, 0);
              const avgRating = Number(
                ((p.rating * p.reviewCount + extraSum) / totalCount).toFixed(1)
              );
              return {
                ...p,
                reviewCount: totalCount,
                rating: avgRating,
                reviews: [...uniqueExtra, ...p.reviews],
              };
            })
          );
        }
      })
      .catch((err) => console.error('Failed to load reviews from Neon:', err));
  }, []);

  // Drawer & Toast
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => {
      setToast((curr) => (curr === message ? null : curr));
    }, 2800);
  };

  const cartItemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const activeProduct = useMemo(
    () => products.find((p) => p.id === activeProductId) ?? products[0],
    [products, activeProductId]
  );

  const relatedProducts = useMemo(() => {
    const sameDept = products.filter(
      (p) => p.id !== activeProduct.id && p.department === activeProduct.department
    );
    const others = products.filter(
      (p) => p.id !== activeProduct.id && p.department !== activeProduct.department
    );
    return [...sameDept, ...others].slice(0, 4);
  }, [products, activeProduct]);

  const navigateTo = (nextScreen: ScreenView) => {
    setScreen(nextScreen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (productId: string) => {
    setActiveProductId(productId);
    setActiveInitialVariantId(undefined);
    navigateTo('product');
  };

  const handleAddToCart = (productId: string, variantId: string, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.productId === productId && item.variantId === variantId
      );
      if (existing) {
        return prev.map((item) =>
          item.productId === productId && item.variantId === variantId
            ? { ...item, quantity: Math.min(10, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { productId, variantId, quantity }];
    });
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      showToast(`Added "${prod.shortTitle}" to Cart`);
    }
  };

  const handleBuyNow = (productId: string, variantId: string, quantity: number) => {
    handleAddToCart(productId, variantId, quantity);
    navigateTo('checkout');
  };

  const handleUpdateQty = (productId: string, variantId: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveItem(productId, variantId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId && item.variantId === variantId
          ? { ...item, quantity: Math.min(10, qty) }
          : item
      )
    );
  };

  const handleRemoveItem = (productId: string, variantId: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.productId === productId && item.variantId === variantId))
    );
  };

  const handleSaveForLater = (productId: string, variantId: string) => {
    const found = cart.find(
      (item) => item.productId === productId && item.variantId === variantId
    );
    if (!found) return;
    handleRemoveItem(productId, variantId);
    setSavedForLater((prev) => {
      if (prev.some((i) => i.productId === productId && i.variantId === variantId)) {
        return prev;
      }
      return [...prev, { ...found, quantity: 1 }];
    });
    showToast('Moved item to Saved for Later');
  };

  const handleMoveToCart = (productId: string, variantId: string) => {
    setSavedForLater((prev) =>
      prev.filter((i) => !(i.productId === productId && i.variantId === variantId))
    );
    handleAddToCart(productId, variantId, 1);
  };

  const handleRemoveSavedForLater = (productId: string, variantId: string) => {
    setSavedForLater((prev) =>
      prev.filter((i) => !(i.productId === productId && i.variantId === variantId))
    );
  };

  const handleToggleSave = (productId: string) => {
    const exists = savedIds.includes(productId);
    setSavedIds((prev) =>
      exists ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      showToast(
        exists
          ? `Removed "${prod.shortTitle}" from Saved List`
          : `Saved "${prod.shortTitle}" to Hardware List`
      );
    }
  };

  const handleSavePriceAlert = (data: {
    productId: string;
    variantId: string;
    variantLabel: string;
    email: string;
    targetPrice: number;
    currentPriceAtCreation: number;
  }) => {
    setDefaultAlertEmail(data.email);
    setPriceAlerts((prev) => {
      const existing = prev.find(
        (a) => a.productId === data.productId && a.variantId === data.variantId
      );
      if (existing) {
        return prev.map((a) =>
          a.id === existing.id
            ? {
                ...a,
                email: data.email,
                targetPrice: data.targetPrice,
                currentPriceAtCreation: data.currentPriceAtCreation,
              }
            : a
        );
      }
      const next: PriceAlert = {
        id: `alert-${Date.now()}`,
        productId: data.productId,
        variantId: data.variantId,
        variantLabel: data.variantLabel,
        email: data.email,
        targetPrice: data.targetPrice,
        currentPriceAtCreation: data.currentPriceAtCreation,
        createdAt: 'November 19, 2026',
      };
      return [next, ...prev];
    });
    showToast(
      `Price alert set: we'll email ${data.email} at or below ${formatCurrency(data.targetPrice)}`
    );
  };

  const handleRemovePriceAlert = (alertId: string) => {
    setPriceAlerts((prev) => prev.filter((a) => a.id !== alertId));
    showToast('Price drop alert removed');
  };

  const handleApplyPromo = (rawCode: string): { success: boolean; message: string } => {
    const normalized = rawCode.toUpperCase();
    if (normalized === 'SAVE10') {
      setAppliedPromo({ code: 'SAVE10', percent: 10 });
      return { success: true, message: 'SAVE10 applied — 10% off your items.' };
    }
    if (normalized === 'MERIDIAN15') {
      setAppliedPromo({ code: 'MERIDIAN15', percent: 15 });
      return { success: true, message: 'MERIDIAN15 applied — 15% off your items.' };
    }
    return {
      success: false,
      message: 'Unrecognized code. Try SAVE10 or MERIDIAN15.',
    };
  };

  const handleAddReview = (
    productId: string,
    reviewInput: Omit<ProductReview, 'id' | 'date' | 'helpfulCount'>
  ) => {
    const newReview: ProductReview = {
      ...reviewInput,
      id: `rev-${Date.now()}`,
      date: 'November 19, 2026',
      helpfulCount: 0,
    };
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const nextCount = p.reviewCount + 1;
        const nextRating = Number(
          ((p.rating * p.reviewCount + newReview.rating) / nextCount).toFixed(1)
        );
        return {
          ...p,
          reviewCount: nextCount,
          rating: nextRating,
          reviews: [newReview, ...p.reviews],
        };
      })
    );

    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, review: newReview }),
    }).catch((err) => console.error('Failed to save review to Neon:', err));

    showToast('Your customer review has been published');
  };

  const handleVoteHelpful = (productId: string, reviewId: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          reviews: p.reviews.map((r) =>
            r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r
          ),
        };
      })
    );
  };

  const handlePlaceOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    setLatestOrder(order);
    setCart([]);
    setAppliedPromo(null);
    navigateTo('confirmation');

    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    }).catch((err) => console.error('Failed to save order to Neon:', err));
  };

  const handleClearAllFilters = () => {
    setSelectedDepartment('All Products');
    setSearchQuery('');
    setDealsOnly(false);
    setExpressOnly(false);
    setMinRating(0);
    setPriceRange([null, null]);
    setSortBy('featured');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#EAEDED] text-[#0F1111]">
      <Header
        activeScreen={screen}
        selectedDepartment={selectedDepartment}
        searchQuery={searchQuery}
        dealsOnly={dealsOnly}
        expressOnly={expressOnly}
        cartItemCount={cartItemCount}
        savedCount={savedIds.length}
        orderCount={orders.length}
        location={location}
        products={products}
        onNavigate={(next) => {
          if (next === 'orders') setOrdersTab('orders');
          navigateTo(next);
        }}
        onSelectDepartment={(dept) => setSelectedDepartment(dept)}
        onSearchChange={setSearchQuery}
        onToggleDealsOnly={() => setDealsOnly((d) => !d)}
        onToggleExpressOnly={() => setExpressOnly((e) => !e)}
        onOpenCartDrawer={() => setCartDrawerOpen(true)}
        onSelectProduct={handleSelectProduct}
        onUpdateLocation={(loc) => {
          setLocation(loc);
          showToast(`Delivery location updated to ${loc.city}, ${loc.zip}`);
        }}
        onOpenSavedTab={() => {
          setOrdersTab('saved');
          navigateTo('orders');
        }}
      />

      <main className="flex-1">
        {screen === 'catalog' && (
          <CatalogScreen
            products={products}
            selectedDepartment={selectedDepartment}
            searchQuery={searchQuery}
            dealsOnly={dealsOnly}
            expressOnly={expressOnly}
            minRating={minRating}
            priceRange={priceRange}
            sortBy={sortBy}
            savedIds={savedIds}
            location={location}
            onSelectDepartment={setSelectedDepartment}
            onToggleDealsOnly={() => setDealsOnly((d) => !d)}
            onToggleExpressOnly={() => setExpressOnly((e) => !e)}
            onChangeMinRating={setMinRating}
            onChangePriceRange={setPriceRange}
            onChangeSort={setSortBy}
            onClearAllFilters={handleClearAllFilters}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
            onToggleSave={handleToggleSave}
          />
        )}

        {screen === 'product' && (
          <ProductDetailScreen
            product={activeProduct}
            relatedProducts={relatedProducts}
            location={location}
            isSaved={savedIds.includes(activeProduct.id)}
            priceAlerts={priceAlerts}
            defaultAlertEmail={defaultAlertEmail}
            initialVariantId={activeInitialVariantId}
            onBackToCatalog={(dept) => {
              if (dept) setSelectedDepartment(dept);
              navigateTo('catalog');
            }}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onToggleSave={handleToggleSave}
            onSavePriceAlert={handleSavePriceAlert}
            onRemovePriceAlert={handleRemovePriceAlert}
            onAddReview={handleAddReview}
            onVoteHelpful={handleVoteHelpful}
            onNotify={showToast}
          />
        )}

        {screen === 'cart' && (
          <CartScreen
            items={cart}
            savedForLater={savedForLater}
            products={products}
            appliedPromo={appliedPromo}
            onUpdateQty={handleUpdateQty}
            onRemoveItem={handleRemoveItem}
            onSaveForLater={handleSaveForLater}
            onMoveToCart={handleMoveToCart}
            onRemoveSavedForLater={handleRemoveSavedForLater}
            onApplyPromo={handleApplyPromo}
            onClearPromo={() => setAppliedPromo(null)}
            onSelectProduct={handleSelectProduct}
            onProceedToCheckout={() => navigateTo('checkout')}
            onContinueShopping={() => navigateTo('catalog')}
          />
        )}

        {screen === 'checkout' && (
          <CheckoutScreen
            items={cart}
            products={products}
            location={location}
            appliedPromo={appliedPromo}
            onBackToCart={() => navigateTo('cart')}
            onPlaceOrder={handlePlaceOrder}
          />
        )}

        {screen === 'confirmation' && latestOrder && (
          <OrderConfirmationScreen
            order={latestOrder}
            onViewOrders={() => {
              setOrdersTab('orders');
              navigateTo('orders');
            }}
            onContinueShopping={() => navigateTo('catalog')}
          />
        )}

        {screen === 'orders' && (
          <OrdersScreen
            key={ordersTab}
            orders={orders}
            products={products}
            savedIds={savedIds}
            priceAlerts={priceAlerts}
            initialTab={ordersTab}
            onSelectProduct={handleSelectProduct}
            onBuyAgain={(productId) => {
              const prod = products.find((p) => p.id === productId);
              if (prod) {
                handleAddToCart(prod.id, prod.variants[0].id, 1);
              }
            }}
            onToggleSave={handleToggleSave}
            onRemovePriceAlert={handleRemovePriceAlert}
            onContinueShopping={() => navigateTo('catalog')}
          />
        )}
      </main>

      <Footer
        onNavigate={(next) => {
          if (next === 'orders') setOrdersTab('orders');
          navigateTo(next);
        }}
        onSelectDepartment={(dept) => {
          setSelectedDepartment(dept);
          setDealsOnly(false);
        }}
      />

      <CartDrawer
        open={cartDrawerOpen}
        items={cart}
        products={products}
        onClose={() => setCartDrawerOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onViewFullCart={() => navigateTo('cart')}
        onProceedToCheckout={() => navigateTo('checkout')}
        onSelectProduct={handleSelectProduct}
      />

      {/* Non-intrusive Feedback Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 max-w-[360px] bg-[#131A22] text-white border border-[#FF9900]/60 rounded-md shadow-xl px-4 py-3 flex items-center gap-2.5 text-[13px]"
        >
          <CheckCircle2 className="w-4 h-4 text-[#FF9900] shrink-0" />
          <span className="flex-1">{toast}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
            className="text-[#CCCCCC] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}