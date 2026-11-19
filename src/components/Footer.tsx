import { ShieldCheck } from 'lucide-react';
import { Department, ScreenView } from '../types';

interface FooterProps {
  onNavigate: (screen: ScreenView) => void;
  onSelectDepartment: (dept: Department) => void;
}

export function Footer({ onNavigate, onSelectDepartment }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-12 text-white">
      {/* Back to top bar */}
      <button
        type="button"
        onClick={scrollToTop}
        className="w-full py-3.5 bg-[#37475A] hover:bg-[#485769] text-[13px] font-medium text-white text-center cursor-pointer"
      >
        Back to top
      </button>

      {/* Main footer directory (#232F3E) */}
      <div className="bg-[#232F3E] border-b border-white/10">
        <div className="max-w-[1440px] mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-[13px]">
          <div>
            <h3 className="text-[14px] font-bold text-white mb-3">Shop Departments</h3>
            <ul className="space-y-2 text-[#D5D9D9]">
              {(['Audio & Sound', 'Workstation', 'Smart Home', 'Kitchen Tech', 'Cameras & Optics'] as const).map(
                (dept) => (
                  <li key={dept}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectDepartment(dept);
                        onNavigate('catalog');
                        scrollToTop();
                      }}
                      className="hover:text-white hover:underline text-left"
                    >
                      {dept}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-[14px] font-bold text-white mb-3">Your Account</h3>
            <ul className="space-y-2 text-[#D5D9D9]">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('orders');
                    scrollToTop();
                  }}
                  className="hover:text-white hover:underline"
                >
                  Track Your Orders
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('cart');
                    scrollToTop();
                  }}
                  className="hover:text-white hover:underline"
                >
                  Shopping Cart
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('orders');
                    scrollToTop();
                  }}
                  className="hover:text-white hover:underline"
                >
                  Saved Hardware Lists
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('orders');
                    scrollToTop();
                  }}
                  className="hover:text-white hover:underline"
                >
                  Returns &amp; Replacements
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[14px] font-bold text-white mb-3">Fulfillment &amp; Trust</h3>
            <ul className="space-y-2 text-[#D5D9D9]">
              <li>Next-Day Express Shipping</li>
              <li>30-Day Hassle-Free Returns</li>
              <li>2-Year Direct Hardware Warranty</li>
              <li>Verified Buyer Review Policy</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[14px] font-bold text-white mb-3">Meridian Direct Guarantee</h3>
            <p className="text-[#D5D9D9] leading-relaxed mb-3">
              Every device ships factory-sealed directly from our regional fulfillment hubs with full serial-number warranty protection.
            </p>
            <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#FFB86F]">
              <ShieldCheck className="w-4 h-4" />
              <span>256-bit Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav Dark bottom bar (#131A22) */}
      <div className="bg-[#131A22]">
        <div className="max-w-[1440px] mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-[#CCCCCC]">
          <div className="flex items-center gap-3">
            <span className="text-[16px] font-bold tracking-tight text-white">
              Meridian<span className="text-[#FF9900]">Direct</span>
            </span>
            <span className="text-white/25">|</span>
            <span>India · INR (₹)</span>
          </div>
          <p>© 2026 Meridian Direct India Pvt. Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
