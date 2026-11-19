export type Department =
  | 'All Products'
  | 'Audio & Sound'
  | 'Workstation'
  | 'Smart Home'
  | 'Kitchen Tech'
  | 'Cameras & Optics';

export type SortOption =
  | 'featured'
  | 'price-asc'
  | 'price-desc'
  | 'rating-desc'
  | 'savings-desc';

export type ScreenView =
  | 'catalog'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'orders'
  | 'confirmation';

export interface ProductVariant {
  id: string;
  label: string;
  finishHex: string;
  priceDelta: number;
  skuSuffix: string;
  inStock: boolean;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
  helpfulCount: number;
  variantPurchased?: string;
}

export interface Product {
  id: string;
  sku: string;
  brand: string;
  title: string;
  shortTitle: string;
  department: Exclude<Department, 'All Products'>;
  price: number;
  listPrice?: number;
  rating: number;
  reviewCount: number;
  expressEligible: boolean;
  isDeal?: boolean;
  dealLabel?: string;
  stockCount: number;
  deliveryDays: number;
  image: string;
  imageClassName?: string;
  summary: string;
  highlights: string[];
  specs: ProductSpec[];
  variants: ProductVariant[];
  reviews: ProductReview[];
}

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface DeliveryLocation {
  city: string;
  state: string;
  zip: string;
}

export interface ShippingAddress {
  fullName: string;
  street: string;
  apt: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

export type DeliverySpeed = 'express' | 'standard' | 'same-day';
export type PaymentMethod = 'card' | 'cod' | 'invoice';

export interface OrderLineItem {
  productId: string;
  title: string;
  brand: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
  image: string;
  imageClassName?: string;
}

export interface Order {
  id: string;
  placedDate: string;
  estimatedDelivery: string;
  status: 'Preparing Shipment' | 'Out for Delivery' | 'Delivered';
  items: OrderLineItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  tax: number;
  total: number;
  shippingAddress: ShippingAddress;
  deliverySpeed: DeliverySpeed;
  paymentSummary: string;
  trackingSteps: {
    label: string;
    timestamp: string;
    completed: boolean;
  }[];
}

export interface PriceAlert {
  id: string;
  productId: string;
  variantId: string;
  variantLabel: string;
  email: string;
  targetPrice: number;
  currentPriceAtCreation: number;
  createdAt: string;
}

