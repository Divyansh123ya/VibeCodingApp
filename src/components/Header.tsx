import React, { useState, useRef, useEffect } from 'react';
import {
  MapPin,
  Search,
  ShoppingCart,
  PackageCheck,
  X,
  ChevronDown,
  Zap,
  Bookmark,
} from 'lucide-react';
import { DEPARTMENTS } from '../data/catalog';
import { DeliveryLocation, Department, Product, ScreenView } from '../types';
import { formatCurrency } from '../utils/format';

interface HeaderProps {
  activeScreen: ScreenView;
  selectedDepartment: Department;
  searchQuery: string;
  dealsOnly: boolean;
  expressOnly: boolean;
  cartItemCount: number;
  savedCount: number;
  orderCount: number;
  location: DeliveryLocation;
  products: Product[];
  onNavigate: (screen: ScreenView) => void;
  onSelectDepartment: (dept: Department) => void;
  onSearchChange: (q: string) => void;
  onToggleDealsOnly: () => void;
  onToggleExpressOnly: () => void;
  onOpenCartDrawer: () => void;
  onSelectProduct: (productId: string) => void;
  onUpdateLocation: (loc: DeliveryLocation) => void;
  onOpenSavedTab: () => void;
}

const PRESET_LOCATIONS: DeliveryLocation[] = [
  { city: 'Bengaluru', state: 'KA', zip: '560038' },
  { city: 'Mumbai', state: 'MH', zip: '400001' },
  { city: 'New Delhi', state: 'DL', zip: '110001' },
  { city: 'Hyderabad', state: 'TS', zip: '500081' },
];

export function Header({
  activeScreen,
  selectedDepartment,
  searchQuery,
  dealsOnly,
  expressOnly,
  cartItemCount,
  savedCount,
  orderCount,
  location,
  products,
  onNavigate,
  onSelectDepartment,
  onSearchChange,
  onToggleDealsOnly,
  onToggleExpressOnly,
  onOpenCartDrawer,
  onSelectProduct,
  onUpdateLocation,
  onOpenSavedTab,
}: HeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [zipInput, setZipInput] = useState(location.zip);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const locWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (locWrapRef.current && !locWrapRef.current.contains(e.target as Node)) {
        setLocationOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const searchSuggestions =
    searchQuery.trim().length > 0
      ? products
          .filter((p) => {
            const q = searchQuery.toLowerCase();
            return (
              p.title.toLowerCase().includes(q) ||
              p.brand.toLowerCase().includes(q) ||
              p.department.toLowerCase().includes(q)
            );
          })
          .slice(0, 5)
      : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchFocused(false);
    if (activeScreen !== 'catalog') {
      onNavigate('catalog');
    }
  };

  const handleZipApply = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = zipInput.replace(/\D/g, '').slice(0, 6);
    if (cleaned.length === 6) {
      const matched = PRESET_LOCATIONS.find((l) => l.zip === cleaned);
      onUpdateLocation(
        matched ?? { city: 'India Metro', state: 'IN', zip: cleaned }
      );
      setLocationOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full shadow-sm">
      {/* Tier 1: Nav Dark (#131A22) Global Utility Header */}
      <div className="bg-[#131A22] text-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-[64px] flex items-center gap-3 sm:gap-5">
          {/* Brand Wordmark */}
          <button
            type="button"
            onClick={() => {
              onSelectDepartment('All Products');
              onSearchChange('');
              onNavigate('catalog');
            }}
            className="flex flex-col items-start justify-center shrink-0 whitespace-nowrap group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9900] rounded px-1 py-0.5"
          >
            <span className="text-[20px] font-bold tracking-tight leading-none text-white">
              Meridian<span className="text-[#FF9900]">Direct</span>
            </span>
            <span className="mt-1 h-[2px] w-full bg-gradient-to-r from-[#FF9900] via-[#FF9900]/70 to-transparent rounded-full" />
          </button>

          {/* Delivery Location Selector (Desktop) */}
          <div ref={locWrapRef} className="relative hidden lg:block shrink-0">
            <button
              type="button"
              onClick={() => setLocationOpen((o) => !o)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-transparent hover:border-white/30 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9900]"
            >
              <MapPin className="w-4 h-4 text-[#FF9900] shrink-0" />
              <div className="leading-tight">
                <div className="text-[11px] text-[#CCCCCC] whitespace-nowrap">
                  Deliver to
                </div>
                <div className="text-[13px] font-semibold text-white whitespace-nowrap">
                  {location.city} {location.zip}
                </div>
              </div>
            </button>

            {locationOpen && (
              <div className="absolute left-0 top-full mt-2 w-[300px] bg-white text-[#0F1111] border border-[#D5D9D9] rounded-lg shadow-xl p-4 z-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[14px] font-semibold text-[#0F1111]">
                    Choose delivery location
                  </h3>
                  <button
                    type="button"
                    onClick={() => setLocationOpen(false)}
                    className="p-1 text-[#565959] hover:text-[#0F1111] rounded"
                    aria-label="Close location picker"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[12px] text-[#565959] mb-3">
                  Delivery options and Express next-day windows update based on your 6-digit PIN code.
                </p>
                <div className="space-y-1.5 mb-3">
                  {PRESET_LOCATIONS.map((preset) => (
                    <button
                      key={preset.zip}
                      type="button"
                      onClick={() => {
                        onUpdateLocation(preset);
                        setZipInput(preset.zip);
                        setLocationOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded text-[13px] border flex items-center justify-between ${
                        location.zip === preset.zip
                          ? 'border-[#FF9900] bg-[#FFF8EB] font-semibold'
                          : 'border-[#D5D9D9] hover:bg-[#F7FAFA]'
                      }`}
                    >
                      <span>
                        {preset.city}, {preset.state}
                      </span>
                      <span className="tabular-nums text-[#565959]">{preset.zip}</span>
                    </button>
                  ))}
                </div>
                <form onSubmit={handleZipApply} className="flex gap-2">
                  <input
                    type="text"
                    value={zipInput}
                    onChange={(e) => setZipInput(e.target.value)}
                    placeholder="Enter 6-digit PIN"
                    maxLength={6}
                    className="rt-input flex-1 px-2.5 py-1.5 text-[13px] tabular-nums"
                  />
                  <button
                    type="submit"
                    className="rt-btn-secondary px-3 py-1.5 text-[13px] whitespace-nowrap"
                  >
                    Apply
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Integrated Department + Search Bar */}
          <div ref={searchWrapRef} className="relative flex-1 min-w-0">
            <form
              onSubmit={handleSearchSubmit}
              className={`flex items-stretch h-[40px] rounded bg-white overflow-hidden transition-shadow ${
                searchFocused
                  ? 'ring-2 ring-[#FF9900]'
                  : 'ring-1 ring-[#8D9494]/40'
              }`}
            >
              <div className="relative hidden sm:flex items-center bg-[#F3F3F4] border-r border-[#D5D9D9]">
                <select
                  aria-label="Filter search by department"
                  value={selectedDepartment}
                  onChange={(e) => {
                    onSelectDepartment(e.target.value as Department);
                    if (activeScreen !== 'catalog') onNavigate('catalog');
                  }}
                  className="appearance-none bg-transparent text-[#0F1111] text-[12px] font-medium pl-3 pr-7 h-full cursor-pointer focus:outline-none"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept === 'All Products' ? 'All' : dept}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#565959] pointer-events-none absolute right-2" />
              </div>

              <input
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (activeScreen !== 'catalog') onNavigate('catalog');
                }}
                placeholder="Search headphones, monitors, espresso, cameras..."
                className="flex-1 min-w-0 px-3 text-[14px] text-[#0F1111] placeholder:text-[#565959] bg-white focus:outline-none"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search"
                  className="px-2 text-[#565959] hover:text-[#0F1111]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="submit"
                aria-label="Search catalog"
                className="px-4 bg-[#FF9900] hover:bg-[#F78A00] text-[#0F1111] flex items-center justify-center shrink-0"
              >
                <Search className="w-5 h-5" strokeWidth={2.2} />
              </button>
            </form>

            {/* Instant Search Suggestions Dropdown */}
            {searchFocused && searchSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#D5D9D9] rounded-md shadow-xl overflow-hidden z-50">
                <div className="px-3 py-1.5 bg-[#F3F3F4] border-b border-[#D5D9D9] text-[11px] font-semibold text-[#565959] uppercase tracking-wider">
                  Direct Product Matches
                </div>
                {searchSuggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSearchFocused(false);
                      onSelectProduct(item.id);
                    }}
                    className="w-full px-3 py-2.5 flex items-center justify-between gap-3 hover:bg-[#F7FAFA] text-left border-b border-[#EEEEEE] last:border-b-0"
                  >
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-[#0F1111] truncate">
                        {item.shortTitle}
                      </div>
                      <div className="text-[11px] text-[#565959]">
                        {item.brand} · {item.department}
                      </div>
                    </div>
                    <span className="text-[13px] font-bold text-[#0F1111] tabular-nums shrink-0">
                      {formatCurrency(item.price)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Orders & Lists Navigation */}
          <button
            type="button"
            onClick={() => onNavigate('orders')}
            className={`hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded border whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9900] ${
              activeScreen === 'orders'
                ? 'border-[#FF9900] bg-white/5'
                : 'border-transparent hover:border-white/30'
            }`}
          >
            <PackageCheck className="w-5 h-5 text-[#FF9900]" />
            <div className="text-left leading-tight">
              <div className="text-[11px] text-[#CCCCCC]">Returns &amp; Lists</div>
              <div className="text-[13px] font-semibold text-white tabular-nums">
                Orders ({orderCount})
              </div>
            </div>
          </button>

          {/* Cart Action Button */}
          <button
            type="button"
            onClick={onOpenCartDrawer}
            aria-label={`Open shopping cart with ${cartItemCount} items`}
            className={`flex items-center gap-2 px-3 py-1.5 rounded border whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9900] ${
              activeScreen === 'cart'
                ? 'border-[#FF9900] bg-white/5'
                : 'border-transparent hover:border-white/30'
            }`}
          >
            <div className="relative flex items-center">
              <ShoppingCart className="w-6 h-6 text-white" strokeWidth={1.8} />
              <span className="absolute -top-2 -right-2.5 min-w-[20px] h-[20px] px-1 rounded-full bg-[#FF9900] text-[#0F1111] text-[11px] font-bold flex items-center justify-center tabular-nums">
                {cartItemCount}
              </span>
            </div>
            <span className="hidden sm:inline text-[14px] font-semibold text-white ml-1">
              Cart
            </span>
          </button>
        </div>
      </div>

      {/* Tier 2: Secondary (#232F3E) Department & Filter Strip */}
      <nav
        aria-label="Product departments"
        className="bg-[#232F3E] text-white border-t border-white/10"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-[42px] flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 sm:gap-2">
            {DEPARTMENTS.map((dept) => {
              const isActive =
                activeScreen === 'catalog' &&
                !dealsOnly &&
                selectedDepartment === dept;
              return (
                <button
                  key={dept}
                  type="button"
                  onClick={() => {
                    onSelectDepartment(dept);
                    if (dealsOnly) onToggleDealsOnly();
                    onNavigate('catalog');
                  }}
                  className={`px-2.5 py-1 rounded text-[13px] whitespace-nowrap shrink-0 border ${
                    isActive
                      ? 'border-[#FF9900] bg-white/10 text-white font-semibold'
                      : 'border-transparent text-[#F0F1F1] hover:border-white/30 font-medium'
                  }`}
                >
                  {dept}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => {
                if (!dealsOnly) {
                  onSelectDepartment('All Products');
                  onToggleDealsOnly();
                } else {
                  onToggleDealsOnly();
                }
                onNavigate('catalog');
              }}
              className={`px-2.5 py-1 rounded text-[13px] whitespace-nowrap shrink-0 border font-semibold ${
                activeScreen === 'catalog' && dealsOnly
                  ? 'border-[#FF9900] bg-[#CC0C39] text-white'
                  : 'border-transparent text-[#FFB86F] hover:border-white/30'
              }`}
            >
              Today&apos;s Deals
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                onToggleExpressOnly();
                if (activeScreen !== 'catalog') onNavigate('catalog');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] font-semibold whitespace-nowrap border ${
                expressOnly
                  ? 'bg-[#FF9900] text-[#0F1111] border-[#FF9900]'
                  : 'border-white/20 text-[#F0F1F1] hover:border-white/50'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Express Eligible
            </button>

            <button
              type="button"
              onClick={onOpenSavedTab}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] font-medium text-[#F0F1F1] hover:text-white border border-transparent hover:border-white/30 whitespace-nowrap"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#FF9900]" />
              Saved ({savedCount})
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
