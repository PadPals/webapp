
export enum View {
  HOME = 'home',
  SHOP = 'shop',
  TRACKER = 'tracker',
  PROFILE = 'profile',
  CART = 'cart',
  CHECKOUT = 'checkout',
  ADMIN = 'admin'
}

export interface ProductVariant {
  id: string;
  size: string;
  price: number;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'regular' | 'super' | 'overnight' | 'liner';
  variants: ProductVariant[];
  stock: number;
}

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  selectedSize: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
  isSubscription?: boolean;
}

export interface PeriodEntry {
  startDate: string;
  endDate?: string;
  flow: 'Light' | 'Medium' | 'Heavy';
}

export interface Subscription {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  selectedSize: string;
  price: number;
  status: 'Active' | 'Paused' | 'Cancelled';
  frequency: 'Monthly' | 'Every 2 Months';
  nextDelivery: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  age: string;
  town: string;
  country: string;
  isStudent: boolean;
  university?: string;
  address?: string;
  padSize: string;
  preferredDeductionDate: string;
  subscriptionActive: boolean;
  orderHistory: Order[];
  subscriptions: Subscription[];
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered';
  type: 'Drop-off' | 'Pick-up';
}
