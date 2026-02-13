
export enum View {
  HOME = 'home',
  SHOP = 'shop',
  TRACKER = 'tracker',
  PROFILE = 'profile',
  CART = 'cart',
  CHECKOUT = 'checkout',
  ADMIN = 'admin',
  ADMIN_APPLY = 'admin_apply',
  SUPER_ADMIN = 'super_admin'
}

export interface ProductVariant {
  id: string;
  size: string;
  price: number;
  image: string;
}

export interface Product {
  id: string;
  group_id: string;
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
  isSuperAdmin: boolean;
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
  user_id: string;
  created_at: string;
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Filled' | 'Packaged' | 'Out for Delivery';
  type: 'Drop-off' | 'Pick-up';
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  is_subscription: boolean;
}

export interface OrderTrackingEntry {
  id: string;
  order_id: string;
  status: string;
  location: string;
  timestamp: string;
}

export interface OrderWithUser extends Order {
  userName: string;
  userEmail: string;
  itemCount: number;
  productNames: string;
}

export interface AdminRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Denied';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}
